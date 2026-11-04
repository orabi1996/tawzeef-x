# Company tasks and performance review workflow

## Problems addressed

The performance menu opened the legacy manual log, making independent review cycles difficult to find. Draft criteria could not be corrected after creation and users had to discover opening requirements through server errors.

Tasks were personal records with free-text assignees. Hardcoded templates were labelled as AI output, stage-based progress percentages implied measurement that did not exist, and arbitrary stage changes could bypass review. The guide also promised notifications and calendar integration that were not implemented.

## Resulting workflow

`/evaluation` opens independent 360 cycles. `/evaluation/cycles` remains compatible; the manual log is explicitly labelled at `/evaluation/manual`. The old `/performance-evaluation` entry redirects to the primary workflow.

Administrators create a draft, adjust criteria and dates, assign real company accounts, resolve readiness requirements, open collection, and close the cycle to release the existing confidential aggregate report. Draft edits use version checks; the subject cannot change under an existing roster. Opening also checks that participant accounts are active. Reports can start a linked development task. The link does not alter any review score.

Tasks progress through planned, in progress, review when assigned, and complete, with a separate backlog. Every task has an active company assignee, due date and expected outcome. Optional templates are labelled as templates. Completion requires a recorded result, completed checklist and no unresolved blocker. An assigned independent reviewer must approve; without one, the assignee confirms completion.

| Action | Authorized account |
| --- | --- |
| Read company tasks | Creator, assignee, reviewer; company owner/admin/hr can read all |
| Assign another member | Company owner/admin/hr |
| Create a personal assignment within company | Active member, assigned to self |
| Edit plan before review | Creator or company owner/admin/hr |
| Record checklist, result and blocker | Assignee while planned or in progress |
| Submit work | Assignee |
| Approve or request revision | Assigned reviewer; revision requires a reason |
| Recall review or reopen completed work | Creator or company owner/admin/hr, with a reason |
| Archive / restore | Creator or company owner/admin/hr |
| Comment | Authorized task participant or company owner/admin/hr |

Company membership and account status are checked on the server. Client roles cannot write the tasks table directly. Company task reads and writes go through the authenticated workflow gateway. All mutations lock the task and check its version. Comments and activity events use server identity and timestamps. Archive is reversible; no hard-delete action is exposed.

Existing personal records are not automatically assigned to a company. Their owner can explicitly import each into the selected company with an assignee and acceptance criteria. A task's details remain a local snapshot while being edited; a background refresh offers an explicit reload rather than replacing unsaved input.

## Verification

- 556 Vitest tests passed, including task creation, reviewer-only actions, missing evidence, filters, failed saves, concurrent-edit preservation, draft version payloads and opening readiness.
- TypeScript application check passed.
- Production build passed; existing large-bundle warnings remain.
- Targeted ESLint check passed for the new task/review components, helpers and tests.
- Isolated PostgreSQL-compatible migration replay passed the existing `performance360.sql` and new `task_workflow.sql` / `review_cycle_drafts.sql` transaction suites. Checks cover tenant and account isolation, direct-write denial, reviewer approval, invalid transitions, result/blocker/checklist gates, optimistic concurrency, server comment attribution, archive/restore, legacy import, closed-cycle links and inactive participants.
- CI runs the SQL suites against a disposable full Supabase migration replay. No fixture is intended for production.

## Operational limits

The task list displays at most the latest 500 accessible rows per active/archive view, then orders them by due date. Candidate options are capped at the latest 500. Lists refresh on focus and every 30 seconds; they are not a realtime subscription. Assignment emails, notification-bell delivery and calendar entries are not implemented or promised by the guides.

The directory proves company membership, not reporting relationships. Administrators must choose suitable raters and role-specific observable criteria. Confidential groups require three eligible numeric responses per criterion to reveal a mean. Missing/suppressed groups make the report partial. Task totals are not performance grades, and neither module makes employment decisions.

Apply both database migrations before deploying the new frontend. Keep the restricted task gateway when rolling back the UI; do not restore unrestricted writes to bypass review. A browser smoke test using real authorized assignee/reviewer accounts is still required to validate the organization's end-to-end operating process.
