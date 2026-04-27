# MindBridge Audit Report (Evidence-Based)

Date: 2026-04-27
Project root: d:/cp/cp/mindbridge
Audit type: code + runtime sanity audit

---

## 1. Executive Summary

MindBridge has strong feature coverage for student wellness workflows and admin tooling, but there are critical reliability and security weaknesses that should be fixed before further feature expansion.

Top blockers found:

1. Frontend currently fails to load due to missing page import target.
2. Sensitive profile APIs allow broader access than intended.
3. Missing structured request validation in several write routes.

Runtime verification performed:

1. Backend starts successfully and connects to MongoDB.
2. Frontend Vite starts but throws unresolved import error for appointments page.

---

## 2. Findings (Ordered by Severity)

### Critical

1. Frontend hard failure: unresolved route import

- Evidence: [client/src/App.jsx](client/src/App.jsx#L13) imports AppointmentsPage, but file is absent in [client/src/pages](client/src/pages).
- Impact: app cannot render route graph in dev/prod build paths; core flow broken.
- Recommendation: restore [client/src/pages/AppointmentsPage.jsx](client/src/pages/AppointmentsPage.jsx) or remove route/import until restored.

2. Over-broad profile access rule in users route

- Evidence: [server/routes/users.js](server/routes/users.js#L107) only blocks students from viewing others, so counselor users can read any user profile by ID.
- Impact: privacy risk and least-privilege violation.
- Recommendation: enforce explicit role matrix (self/admin/case-scoped counselor access only).

### High

3. Missing explicit request validation on auth and content routes

- Evidence:
  - [server/routes/users.js](server/routes/users.js#L34) uses manual checks only.
  - [server/routes/forum.js](server/routes/forum.js#L33) accepts content/category without schema-level request validator middleware.
- Impact: inconsistent error quality, avoidable invalid payloads, greater attack surface.
- Recommendation: add express-validator schemas for register/login/post/reply/report endpoints.

4. AI moderation dependency is synchronous in post creation path

- Evidence: [server/routes/forum.js](server/routes/forum.js#L48) blocks post creation on external API call.
- Impact: latency spikes and potential posting failures on AI downtime.
- Recommendation: use timeout + graceful fallback; optionally async moderation queue.

### Medium

5. Duplicate exports in routes (maintainability smell)

- Evidence:
  - [server/routes/users.js](server/routes/users.js#L160)
  - [server/routes/forum.js](server/routes/forum.js#L211)
- Impact: not currently breaking, but indicates merge/cleanup debt.
- Recommendation: remove duplicate module exports and run route lint pass.

6. Forum upvotes are not idempotent per user

- Evidence: [server/routes/forum.js](server/routes/forum.js#L198) increments upvote count without tracking user vote state.
- Impact: score inflation; weak trust in community ranking.
- Recommendation: track voter IDs and toggle/limit one vote per user.

### Low

7. Polling intervals may generate unnecessary load

- Evidence: [client/src/pages/ForumPage.jsx](client/src/pages/ForumPage.jsx#L51) polls every 15s regardless of tab visibility.
- Impact: extra API traffic and battery usage.
- Recommendation: pause polling when tab hidden; switch to event-driven updates where possible.

---

## 3. Runtime Status (Verified)

Backend:

1. Starts correctly on port 5000 and connects to MongoDB.

Frontend:

1. Vite starts on 5173.
2. Fails with import-analysis error for missing AppointmentsPage import target from [client/src/App.jsx](client/src/App.jsx#L13).

Conclusion:

1. System is partially runnable, but current frontend state is broken until appointments page import mismatch is fixed.

---

## 4. Strengths Observed

1. Clear modular route structure and domain separation on backend.
2. Role-based route protection patterns are present in frontend route layer.
3. Security middleware baseline is included in server bootstrap:
   - helmet, rate limiting, mongo sanitize in [server/server.js](server/server.js).
4. Forum category mismatch bug was already addressed in current UI logic.

---

## 5. Priority Remediation Plan

### P0 (Fix Immediately)

1. Restore or remove broken appointments import path in [client/src/App.jsx](client/src/App.jsx#L13).
2. Tighten user profile authorization in [server/routes/users.js](server/routes/users.js#L107).
3. Add route-level input validation for register/login/forum write endpoints.

### P1 (Next Sprint)

1. Make forum moderation non-blocking with timeout/fallback in [server/routes/forum.js](server/routes/forum.js#L48).
2. Make upvotes idempotent by user in [server/routes/forum.js](server/routes/forum.js#L198).
3. Remove duplicated export lines in users/forum route files.

### P2 (Stabilization)

1. Add integration tests for auth, forum post/reply/report, and appointment routing.
2. Add build/start CI checks to catch missing file imports before merge.

---

## 6. Suggested Prompt for Another AI Agent

Use this exact prompt:

"Audit MindBridge using PROJECT_HANDOFF_REPORT_FOR_AI.md and verify each finding against code. Then produce:

1. confirmed vs unconfirmed findings,
2. exact patch diffs for P0/P1,
3. security threat model summary,
4. integration test plan (auth/forum/appointments),
5. release readiness score with go/no-go criteria."

---

## 7. Scope Notes

This audit focused on runtime viability, route security boundaries, and high-impact reliability concerns. It is not a full penetration test or formal compliance audit.
