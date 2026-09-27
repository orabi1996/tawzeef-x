-- Agency members can view only candidates submitted by their own agency to
-- companies where the agency currently has an active assignment. Candidate
-- creation is handled by the authenticated submit-agency-candidate function.
CREATE POLICY "Agency members view assigned candidates" ON public.candidates
  FOR SELECT TO authenticated
  USING (
    agency_id IS NOT NULL AND company_id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.agency_members am
      JOIN public.agency_assignments aa ON aa.agency_id = am.agency_id
      WHERE am.user_id = auth.uid()
        AND am.agency_id = candidates.agency_id
        AND aa.company_id = candidates.company_id
        AND aa.scope = 'company'
        AND aa.status = 'active'
    )
  );
