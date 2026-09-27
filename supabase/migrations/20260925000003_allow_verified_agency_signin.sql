-- Allow invited agency members to sign in only while their agency and assigned company are active.
-- Also correct the company_members ordering column used by the existing gatekeeper.
CREATE OR REPLACE FUNCTION public.validate_tenant_status(_company_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid;
  _target_company_id uuid;
  _company_rec RECORD;
  _platform_role text := NULL;
  _user_role text := NULL;
  _is_candidate boolean := false;
  _agency_rec RECORD;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', NULL,
      'access_state', 'DENIED',
      'denial_reason', 'UNAUTHENTICATED',
      'is_platform_admin', false,
      'company_status', NULL
    );
  END IF;

  -- 1. Check platform role (single server-side source of truth)
  SELECT role INTO _platform_role
  FROM public.platform_roles
  WHERE user_id = _uid;

  IF _platform_role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'ALLOWED',
      'denial_reason', NULL,
      'is_platform_admin', true,
      'platform_role', _platform_role,
      'company_id', _company_id,
      'company_status', 'ACTIVE'
    );
  END IF;

  -- 2. Check candidate / job seeker role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role = 'job_seeker'::app_role
  ) INTO _is_candidate;

  -- Agency accounts have an active agency membership and an active company
  -- assignment, not a company_members row. Resolve both on the server.
  IF NOT _is_candidate THEN
    SELECT aa.company_id, aa.agency_id INTO _agency_rec
    FROM public.agency_members am
    JOIN public.agencies agency ON agency.id = am.agency_id AND agency.status = 'active'
    JOIN public.agency_assignments aa ON aa.agency_id = am.agency_id AND aa.scope = 'company' AND aa.status = 'active'
    JOIN public.companies company ON company.id = aa.company_id AND company.status = 'active'
    WHERE am.user_id = _uid AND (_company_id IS NULL OR aa.company_id = _company_id)
    ORDER BY aa.created_at ASC LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'user_id', _uid, 'access_state', 'ALLOWED', 'denial_reason', NULL,
        'is_platform_admin', false, 'is_agency', true, 'role', 'agency',
        'agency_id', _agency_rec.agency_id, 'company_id', _agency_rec.company_id,
        'company_status', 'ACTIVE'
      );
    END IF;
  END IF;

  -- 3. Resolve target company
  _target_company_id := _company_id;
  IF _target_company_id IS NULL THEN
    SELECT company_id INTO _target_company_id
    FROM public.company_members
    WHERE user_id = _uid
    ORDER BY joined_at ASC
    LIMIT 1;
  END IF;

  -- If user is candidate and not bound to a company context
  IF _is_candidate AND _target_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'ALLOWED',
      'denial_reason', NULL,
      'is_platform_admin', false,
      'is_candidate', true,
      'role', 'job_seeker',
      'company_id', NULL,
      'company_status', NULL
    );
  END IF;

  IF _target_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'DENIED',
      'denial_reason', 'NO_COMPANY_MEMBERSHIP',
      'is_platform_admin', false,
      'company_id', NULL,
      'company_status', NULL
    );
  END IF;

  -- 4. Retrieve company record
  SELECT id, name, status, parent_company_id INTO _company_rec
  FROM public.companies
  WHERE id = _target_company_id;

  IF _company_rec.id IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'DENIED',
      'denial_reason', 'COMPANY_NOT_FOUND',
      'is_platform_admin', false,
      'company_id', _target_company_id,
      'company_status', 'DELETED'
    );
  END IF;

  -- 5. FAIL-CLOSED: Non-active tenant status check
  IF _company_rec.status NOT IN ('active', 'ACTIVE') THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'DENIED',
      'denial_reason', 'COMPANY_' || upper(_company_rec.status),
      'is_platform_admin', false,
      'company_id', _company_rec.id,
      'company_name', _company_rec.name,
      'company_status', upper(_company_rec.status)
    );
  END IF;

  -- 6. Verify user membership in company or parent company
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _uid AND company_id = _company_rec.id
  ) AND NOT (
    _company_rec.parent_company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_members
      WHERE user_id = _uid AND company_id = _company_rec.parent_company_id
    )
  ) THEN
    RETURN jsonb_build_object(
      'user_id', _uid,
      'access_state', 'DENIED',
      'denial_reason', 'NOT_COMPANY_MEMBER',
      'is_platform_admin', false,
      'company_id', _company_rec.id,
      'company_status', upper(_company_rec.status)
    );
  END IF;

  -- 7. Get user's role in this tenant
  SELECT role::text INTO _user_role
  FROM public.user_roles
  WHERE user_id = _uid
  LIMIT 1;

  RETURN jsonb_build_object(
    'user_id', _uid,
    'access_state', 'ALLOWED',
    'denial_reason', NULL,
    'is_platform_admin', false,
    'is_candidate', _is_candidate,
    'role', COALESCE(_user_role, 'recruiter'),
    'company_id', _company_rec.id,
    'company_name', _company_rec.name,
    'company_status', upper(_company_rec.status)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_tenant_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_tenant_status(uuid) TO authenticated, service_role;
