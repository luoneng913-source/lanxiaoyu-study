# Customer Identity Segment Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first end-to-end practical tool, “门店客户身份分层转化工具”, with protected records, deterministic scoring, assignment submission, and student history.

**Architecture:** Keep the existing Next.js App Router and dark copper-gold visual system. A client tool form calculates only display previews; protected persistence and assignment submission run through authenticated Next.js route handlers and Supabase. Supabase RLS remains the second enforcement layer so students can access only their own records.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth/Postgres/RLS, existing CSS system, Node test runner.

## Global Constraints

- Do not redesign or replace the existing dark copper-gold UI.
- Do not remove existing courses, tools, private downloads, login, course access, assignments, or feedback.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Keep protected files outside `public/`.
- Every new user record must be protected by Supabase RLS.
- The five scoring inputs accept only `1`, `3`, or `5`; totals range from `5` to `25`.
- After each deliverable, run `npm run build`; before handoff also run `npm run vercel-build` and `npm test`.

---

## File map

| Path | Responsibility |
| --- | --- |
| `supabase/tool-records-migration.sql` | Adds roles/mentor relationship, tool record table, assignment link, indexes, RLS helpers and policies without deleting data. |
| `app/types/tool-records.ts` | Shared types for input, result, status and persisted record data. |
| `app/lib/customer-segment.ts` | Pure scoring and recommendation rules. |
| `app/components/tools/CustomerSegmentForm.tsx` | Accessible responsive form and client actions. |
| `app/components/tools/CustomerSegmentResult.tsx` | Result display, copy and browser Save-as-PDF flow. |
| `app/tools/customer-segment/page.tsx` | Authenticated tool entry and data loading shell. |
| `app/records/page.tsx` | “我的实战记录” list and status update UI. |
| `app/api/tools/customer-segment/route.ts` | Creates a protected tool record for the current user. |
| `app/api/tool-records/route.ts` | Lists only records permitted to the current requester. |
| `app/api/tool-records/[recordId]/route.ts` | Updates own execution status/result safely. |
| `app/api/tool-records/[recordId]/submit-assignment/route.ts` | Validates ownership and submits/updates the linked assignment submission. |
| `app/tools/page.tsx` | Adds the new practical-tool entry and its history link. |
| `app/assignments/page.tsx` | Replaces Phase 1 placeholder wording with assignment submission entry points when linked. |
| `app/page.tsx` | Routes existing course tool entry `customer-segment` to the dedicated tool page while preserving current content. |
| `app/globals.css` | Adds scoped tool, result, record and print styles; keeps current visual tokens. |
| `tests/customer-segment.test.mjs` | Tests the scoring boundaries and non-empty next-action outputs. |

## Task 1: Establish domain rules with tests

**Files:**
- Create: `tests/customer-segment.test.mjs`
- Create: `app/types/tool-records.ts`
- Create: `app/lib/customer-segment.ts`

**Interfaces:**
- Produces `calculateCustomerSegment(input: CustomerSegmentInput): CustomerSegmentResult`.
- `CustomerSegmentInput` has five score keys constrained to `1 | 3 | 5`.
- `CustomerSegmentResult` includes `totalScore`, `tier`, `judgement`, `missingInformation`, `mainRisk`, `nextAction`, `prohibitedAction`, and `followUpTiming`.

- [ ] Write tests for totals `25`, `18`, `13`, `8`, and `5`, asserting tier boundaries `S/A/B/C/D`.
- [ ] Run `node --test tests/customer-segment.test.mjs`; confirm it fails because the module does not exist.
- [ ] Add minimal shared types and pure calculation/recommendation implementation.
- [ ] Run `node --test tests/customer-segment.test.mjs`; confirm all boundary tests pass.
- [ ] Run `npm run build`.

## Task 2: Add protected persistence migration

**Files:**
- Create: `supabase/tool-records-migration.sql`

**Interfaces:**
- Produces `public.tool_records` with `input_data`, `result_data`, `action_plan` as JSONB.
- Produces `assignment_submissions.tool_record_id` nullable FK.
- Provides `public.current_profile_role()` and `public.is_assistant_for_user(uuid)` security-definer helpers.

- [ ] Write idempotent SQL using `alter table ... add column if not exists` and `create table if not exists`; never drop an existing table or data.
- [ ] Add `profiles.role` (`student|assistant|admin`) and `profiles.mentor_id`, defaulting existing/new users to `student`.
- [ ] Add RLS: students manage only own records; assistants can select assigned students; admins can select all records.
- [ ] Add indexes for user, tool, status, and creation time; add self-reference-safe policies to linked submissions.
- [ ] Run `npm run build` to ensure no app regression; provide the SQL for user execution in Supabase after implementation.

## Task 3: Implement authenticated record APIs

**Files:**
- Create: `app/api/tools/customer-segment/route.ts`
- Create: `app/api/tool-records/route.ts`
- Create: `app/api/tool-records/[recordId]/route.ts`
- Create: `app/api/tool-records/[recordId]/submit-assignment/route.ts`

**Interfaces:**
- `POST /api/tools/customer-segment` validates scores server-side, calculates result server-side, and creates the caller’s record.
- `GET /api/tool-records` returns current student’s records or authorised assistant/admin records.
- `PATCH /api/tool-records/:recordId` changes only `status` and `execution_result` of an owned record.
- `POST /api/tool-records/:recordId/submit-assignment` validates current ownership and upserts caller’s submission with `tool_record_id`.

- [ ] Write route-level validation tests for invalid score values and missing required customer name/contact (or extract and test validation helpers).
- [ ] Confirm failing tests before route implementation.
- [ ] Implement request authentication using the established `app/lib/supabase-server.ts` pattern; service role is only used server-side when needed.
- [ ] Implement JSON response error paths for unauthenticated, unauthorised, missing record, and unavailable assignment cases.
- [ ] Run route/helper tests, then `npm run build`.

## Task 4: Build the tool experience and history page

**Files:**
- Create: `app/components/tools/CustomerSegmentForm.tsx`
- Create: `app/components/tools/CustomerSegmentResult.tsx`
- Create: `app/tools/customer-segment/page.tsx`
- Create: `app/records/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Tool entry is `/tools/customer-segment` and accepts optional `assignmentId`/`courseId` query values.
- UI buttons are: 生成结果, 保存记录, 复制结论, 导出PDF, 提交为作业, 重新填写.
- Records page displays customer name, tool, date, tier, next action, status, result, and assistant feedback when present.

- [ ] Write failing tests for visible action labels and score option constraints using the existing rendered HTML testing approach.
- [ ] Implement responsive form sections and score controls without changing global navigation or existing course UI.
- [ ] Implement saved-record states and history list; PDF uses the browser print dialog with print stylesheet so the learner can select “Save as PDF”.
- [ ] Run tests, `npm run build`, and verify at desktop/mobile viewport in the rendered output.

## Task 5: Link tool into courses and assignments

**Files:**
- Modify: `app/tools/page.tsx`
- Modify: `app/assignments/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Existing `customer-segment` tool links route to `/tools/customer-segment`.
- Course module entry may use `/tools/customer-segment?courseId=<id>&assignmentId=<id>`.
- Assignment submission status and feedback remain visible through existing assignment data.

- [ ] Write a failing rendered HTML test that the existing course tool label points to the dedicated route.
- [ ] Replace only the relevant tool navigation action; do not replace card copy or visual styles.
- [ ] Add a clear assignment submission action only when an assignment ID is configured; otherwise show the non-destructive configuration message.
- [ ] Run `npm run build`, `npm run vercel-build`, and `npm test`.

## Task 6: Package, verify, and hand off

**Files:**
- Modify: `docs/superpowers/plans/2026-07-15-customer-identity-segment-tool.md` (checklist only)
- Create: `docs/tool-records-supabase-steps.md`

- [ ] Run `npm run build`.
- [ ] Run `npm run vercel-build`.
- [ ] Run `npm test`.
- [ ] Inspect the route tree to confirm no nested `app/app` route was added.
- [ ] Package the complete project and include the migration SQL and Supabase/Vercel deployment steps.

## Coverage self-review

- Input fields, 1/3/5 scores, tier rules, outputs and six actions: Tasks 1 and 4.
- Records/history and four execution statuses: Tasks 2–4.
- Student/assistant/admin RLS and no front-end service key: Tasks 2–3.
- Course/assignment linkage and feedback compatibility: Task 5.
- Visual preservation, mobile support, build/testing and deploy handoff: Tasks 4–6.
