# Tawzeef-X — Phase 1: Candidate portal privacy hardening

**Scope:** Candidate public tracking portal and its Supabase Edge Function.
**Status:** Pull Request review / staging validation required. Do not merge or deploy blindly.

## 1. Changes

- Candidate information can no longer be retrieved through a tracking code, email address, phone fragment, or partial UUID alone.
- The public request action accepts an email and an optional **exact** tracking code, always returning a generic message regardless of whether a record exists.
- For matching records, a proof-of-email link is sent to the submitted address using the existing internal send-email function.
- The link contains an AES-GCM-encrypted, time-limited token in the URL **fragment**, not in a query parameter. A legacy query parameter is still accepted by the frontend for compatibility with PR previews.
- The read action requires a valid 15-minute token and only queries records for the email encoded in that verified token, optionally restricted by exact tracking code.
- The browser no longer falls back to unauthenticated direct Supabase queries or updates candidates' teaching credentials.
- The frontend supports /portal and the previously broken /candidate-portal alias.
- Unit tests cover token roundtrip, wrong key, tampering, expiry, malformed tokens and non-deterministic encryption, in addition to source-level security regressions.

## 2. Required server secret — BLOCKING

Before deploying the new Edge Function, create a high-entropy signing secret **separate** from the Supabase service-role key. Example of generating one locally:

    openssl rand -hex 32

Store the result in **Supabase Dashboard → Edge Functions → Secrets** under the variable name:

    CANDIDATE_PORTAL_SIGNING_SECRET

Do not place the value in GitHub, frontend VITE_* variables, PR comments or logs. The function **fails closed** without this secret. The same value must persist through redeployments; rotating it invalidates existing, short-lived links. Secrets cannot be verified from repository code.

## 3. Deployment ordering — BLOCKING

The new frontend and Edge Function use a new action-based request format. The old frontend and the new function, or the new frontend and the old function, are **not backward compatible**. Deploy both parts as a coordinated release, preferably after staging validation and with a pre-planned cutover. Do not deploy only one to production.

Verify that send-email can be invoked with server-side service-role authorization and that SMTP is configured and delivers messages. Do not send test messages to real candidates.

## 4. Staging test checklist

- [ ] Configure CANDIDATE_PORTAL_SIGNING_SECRET on the **staging** Supabase project.
- [ ] Deploy both the staging frontend and updated candidate-portal function.
- [ ] Request a link for an **unregistered** staging email: generic response, no candidate data.
- [ ] Request a link for a **registered test** email: message arrives in that mailbox, with a fragment URL (#access=...).
- [ ] Open the link: only that email's test applications appear, with correct jobs and stages.
- [ ] Try a partial/guessed tracking code or another user's email: no private data is returned.
- [ ] Modify an encrypted token character: read action returns HTTP 401.
- [ ] Try a test token after 15 minutes: read action returns HTTP 401.
- [ ] Verify token is removed from browser URL after use and responses are non-cacheable.
- [ ] Confirm legacy /candidate-portal links display the verification page.
- [ ] Verify anonymous browser requests cannot edit candidate records via the page.
- [ ] Run npm ci, npx tsc -p tsconfig.app.json --noEmit, npm run test and npm run build.
- [ ] Smoke test authenticated recruiter/admin dashboard and public job application.
- [ ] Confirm email delivery and behavior on mobile and desktop.

## 5. Known limits / follow-ups

1. Current per-IP rate limiting is **instance-local**, not a distributed abuse-control solution. Add a shared limiter, recipient cooldown and/or edge/WAF bot controls before high-volume production use.
2. The encrypted token is valid for 15 minutes but is not single-use. Stronger protection requires a database-backed, atomically consumed token nonce.
3. Email queries use exact matching. Verify canonicalized or mixed-case legacy addresses in staging.
4. Teacher-license edits need a separate authenticated candidate profile flow; the old public editing flow was removed.
5. Verify notification behavior across languages and company types.
6. GitHub Actions workflow configuration exists, but current test/build status requires **actual runs**. Historical audit reports do not establish current passing tests.

## 6. Acceptance criteria

Approve and merge only after the staging checklist passes, signing secret is provisioned, and the coordinated release is planned. Static inspection alone does not demonstrate production readiness.
