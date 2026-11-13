-- P0 security: tracking codes are identifiers, not authorization credentials.
-- Previous public SELECT policies exposed every row with any tracking_code,
-- including personal information, to anonymous clients.
--
-- Supabase service-role Edge Functions still bypass RLS; the email-verified
-- candidate-portal endpoint remains responsible for privacy-scoped reads.
--
-- Restrictive policy blocks anonymous SELECT even if another permissive
-- policy inadvertently grants it. Authenticated recruiter/candidate policies
-- remain unaffected. Keep public INSERT policy on applications intact.

BEGIN;

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public tracking code lookup candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public tracking code lookup applications" ON public.applications;

DROP POLICY IF EXISTS "Block anonymous candidate reads" ON public.candidates;
CREATE POLICY "Block anonymous candidate reads" ON public.candidates
  AS RESTRICTIVE
  FOR SELECT TO anon
  USING (false);

DROP POLICY IF EXISTS "Block anonymous application reads" ON public.applications;
CREATE POLICY "Block anonymous application reads" ON public.applications
  AS RESTRICTIVE
  FOR SELECT TO anon
  USING (false);

COMMIT;
