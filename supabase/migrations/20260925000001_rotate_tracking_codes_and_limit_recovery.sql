-- Six-digit public tracking codes were guessable. Rotate existing application
-- codes once, keep linked candidate rows in sync, and give stand-alone
-- candidates their own 128-bit random codes. The application trigger creates a
-- separate candidate ID, so use the old code to keep both records in sync.
-- Old codes must be recovered by
-- email; they cannot be used to query private records after this migration.
CREATE TEMP TABLE rotated_tracking_codes ON COMMIT DROP AS
SELECT old_code, 'TX-' || upper(replace(gen_random_uuid()::text, '-', '')) AS new_code
FROM (
  SELECT tracking_code AS old_code FROM public.applications
  UNION
  SELECT tracking_code AS old_code FROM public.candidates
) old_codes
WHERE old_code IS NOT NULL AND old_code !~ '^TX-[0-9A-Fa-f]{32}$';

UPDATE public.applications AS a
SET tracking_code = r.new_code
FROM rotated_tracking_codes AS r
WHERE a.tracking_code = r.old_code;

UPDATE public.candidates AS c
SET tracking_code = r.new_code
FROM rotated_tracking_codes AS r
WHERE c.tracking_code = r.old_code;

UPDATE public.applications
SET tracking_code = 'TX-' || upper(replace(gen_random_uuid()::text, '-', ''))
WHERE tracking_code IS NULL;

UPDATE public.candidates AS c
SET tracking_code = a.tracking_code
FROM public.applications AS a
WHERE c.id = a.id AND c.tracking_code IS NULL;

UPDATE public.candidates AS c
SET tracking_code = 'TX-' || upper(replace(gen_random_uuid()::text, '-', ''))
WHERE c.tracking_code IS NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_tracking_code_lookup ON public.candidates (tracking_code);
CREATE INDEX IF NOT EXISTS idx_applications_tracking_code_lookup ON public.applications (tracking_code);

-- Recovery email requests are limited by mailbox, even across different IPs.
CREATE TABLE public.candidate_portal_recovery_limits (
  request_hash text PRIMARY KEY,
  attempts integer NOT NULL,
  reset_at timestamptz NOT NULL
);
ALTER TABLE public.candidate_portal_recovery_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.candidate_portal_recovery_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.allow_candidate_recovery(p_request_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
BEGIN
  IF p_request_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;

  INSERT INTO public.candidate_portal_recovery_limits AS r (request_hash, attempts, reset_at)
  VALUES (p_request_hash, 1, now() + interval '1 hour')
  ON CONFLICT (request_hash) DO UPDATE
  SET attempts = CASE WHEN r.reset_at <= now() THEN 1 ELSE r.attempts + 1 END,
      reset_at = CASE WHEN r.reset_at <= now() THEN now() + interval '1 hour' ELSE r.reset_at END
  RETURNING attempts INTO current_attempts;

  RETURN current_attempts <= 3;
END;
$$;

REVOKE ALL ON FUNCTION public.allow_candidate_recovery(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allow_candidate_recovery(text) TO service_role;
