-- Agency passwords were previously written into notes as [PASS:...].
UPDATE public.agencies
SET notes = nullif(btrim(regexp_replace(coalesce(notes, ''), '\[PASS:[^]]*\]', '', 'g')), '')
WHERE notes LIKE '%[PASS:%';

-- Treat platform roles as the only cross-tenant authority. Agency management
-- by a company owner goes through manage-agency-account after verifying its
-- assignment to that company.
CREATE OR REPLACE FUNCTION public.has_agency_access(_agency_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = _agency_id AND user_id = auth.uid()
  ) OR public.is_super_admin(auth.uid());
$$;

DROP POLICY IF EXISTS "Admins manage agencies" ON public.agencies;
CREATE POLICY "Platform admins manage agencies" ON public.agencies
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Company members view assigned agencies" ON public.agencies
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agency_assignments aa
    WHERE aa.agency_id = agencies.id AND public.has_company_access(aa.company_id)
  ));

DROP POLICY IF EXISTS "Admins manage agency members" ON public.agency_members;
CREATE POLICY "Platform admins manage agency members" ON public.agency_members
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage agency assignments" ON public.agency_assignments;
CREATE POLICY "Platform admins manage agency assignments" ON public.agency_assignments
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
