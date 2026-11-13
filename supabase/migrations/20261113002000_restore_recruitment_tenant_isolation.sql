-- P0: replace legacy "authenticated users access all" recruitment policies.
-- Candidate and application records contain personal data and must be scoped
-- to the requester's company/branch membership. Existing
-- public.has_company_access(company_id) includes authorized parent-branch
-- membership and platform_roles-backed super admins.
--
-- This migration must be tested with two isolated companies, parent/branch
-- access, an authenticated job seeker and a trusted platform super admin.
-- Public application INSERT remains allowed for the apply form.

BEGIN;

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users access all candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users access all applications" ON public.applications;

-- A company membership is mandatory for authenticated candidate access,
-- even if another permissive policy accidentally allows a broader role.
DROP POLICY IF EXISTS "Candidates require company membership" ON public.candidates;
CREATE POLICY "Candidates require company membership" ON public.candidates
  AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id))
  WITH CHECK (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Company members manage candidates" ON public.candidates;
CREATE POLICY "Company members manage candidates" ON public.candidates
  FOR ALL TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id))
  WITH CHECK (company_id IS NOT NULL AND public.has_company_access(company_id));

-- Application SELECT, UPDATE, DELETE must be tenant-scoped.
-- Authenticated job seekers can still submit public applications because
-- these restrictive policies do not apply to INSERT.
DROP POLICY IF EXISTS "Company members read applications" ON public.applications;
CREATE POLICY "Company members read applications" ON public.applications
  FOR SELECT TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Application reads require company membership" ON public.applications;
CREATE POLICY "Application reads require company membership" ON public.applications
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Company members update applications" ON public.applications;
CREATE POLICY "Company members update applications" ON public.applications
  FOR UPDATE TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id))
  WITH CHECK (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Application updates require company membership" ON public.applications;
CREATE POLICY "Application updates require company membership" ON public.applications
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id))
  WITH CHECK (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Company members delete applications" ON public.applications;
CREATE POLICY "Company members delete applications" ON public.applications
  FOR DELETE TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id));

DROP POLICY IF EXISTS "Application deletes require company membership" ON public.applications;
CREATE POLICY "Application deletes require company membership" ON public.applications
  AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (company_id IS NOT NULL AND public.has_company_access(company_id));

COMMIT;
