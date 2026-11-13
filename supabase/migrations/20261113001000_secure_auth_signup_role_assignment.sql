-- P0: the legacy auth signup trigger allowed an untrusted user_metadata.role
-- or any email containing "tawzeef" to become an admin. Revoke these elevation
-- paths. Only the server-managed invitations table may assign an invited role.
-- Platform-wide super-admin privileges remain in the protected platform_roles
-- table and must never be inferred from the user's email or user_metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _account_type text;
  _inv RECORD;
BEGIN
  _account_type := COALESCE(
    NEW.raw_user_meta_data ->> 'account_type',
    NEW.raw_user_meta_data ->> 'user_type',
    ''
  );

  -- Self-registered candidates may only obtain the job_seeker role.
  -- Company self-registration continues with recruiter, and has to pass
  -- separate company-membership / tenant authorization checks.
  IF _account_type IN ('job_seeker', 'candidate') THEN
    _role := 'job_seeker'::public.app_role;
  ELSE
    _role := 'recruiter'::public.app_role;
  END IF;

  -- A trusted, pending invitation can override the role.
  BEGIN
    SELECT id, role INTO _inv
    FROM public.invitations
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      _role := _inv.role;
      UPDATE public.invitations
      SET status = 'accepted', accepted_at = now()
      WHERE id = _inv.id;
    END IF;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    RAISE WARNING 'Signup invitation table unavailable: %', SQLERRM;
  END;

  INSERT INTO public.profiles (id, user_id, full_name, role, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NEW.email),
    _role::text,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    role = EXCLUDED.role,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Existing admin grants are not changed by this migration. Review
-- unexpected user_roles/admin memberships with the Supabase admin team.
