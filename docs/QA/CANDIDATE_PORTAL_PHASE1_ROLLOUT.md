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

## 1A. Expanded identity audit, existing database state

The source audit also found an unsafe legacy auto-create-candidate-account implementation. This PR removes the public invocation, requires service-role authorization for the function, and switches to Supabase email invitations rather than phone-based passwords or password resets. The candidate receipt and auth page no longer advertise a phone number as a password.

**Historical migration caveat:** The repository contains older SQL migrations that describe overly permissive anonymous and authenticated access. A separate read-only comparison recorded in PR #2 indicates that live company-scoped RLS and the signup trigger differ from these obsolete files. Two proposed RLS/signup migrations were therefore removed from this PR. **Do not reapply old SQL or treat repository migration history as a snapshot of the active database.** Tenant isolation, signup grants, and legacy accounts must still be tested in staging.

The existing application INSERT trigger is expected to sync application and candidate records. This behavior must be verified with test applications before rollout. Existing accounts previously assigned a phone-derived password should be reviewed for remediation.

## 2. Required server secret — BLOCKING

Before deploying the new Edge Function, create a high-entropy signing secret **separate** from the Supabase service-role key. Example of generating one locally:

    openssl rand -hex 32

Store the result in **Supabase Dashboard → Edge Functions → Secrets** under the variable name:

    CANDIDATE_PORTAL_SIGNING_SECRET

Do not place the value in GitHub, frontend VITE_* variables, PR comments or logs. The function **fails closed** without this secret. The same value must persist through redeployments; rotating it invalidates existing, short-lived links. Secrets cannot be verified from repository code.

## 3. Deployment ordering — BLOCKING

The new frontend and candidate-portal Edge Function use a new action-based request format. The old frontend and the new function, or the new frontend and the old function, are **not backward compatible**. The service-only invitation function must be deployed as part of the coordinated rollout. No new SQL migrations are included in this PR; verify the active database policies instead. Deploy both parts as a coordinated release, preferably after staging validation and with a pre-planned cutover. Do not deploy only one to production.

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
- [ ] On a staging database, verify a candidate from Company A cannot be read or updated by Company B; test branch access and platform super admin.
- [ ] Confirm an anonymous Supabase client cannot SELECT candidates or applications, but can still INSERT a legitimate application.
- [ ] Confirm a self-created account cannot gain admin from role metadata or a similar-looking email.
- [ ] Confirm the candidate invitation Edge Function rejects anon/user bearer tokens and never returns a password.
- [ ] Confirm a public job application still creates a candidate through the database trigger and never reports a false success.
- [ ] Validate that no legitimate recruiter is blocked by missing company_id and that private dashboards still load.
- [ ] Audit old phone-password accounts and unexpected admin grants; plan remediation and customer communication.
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
