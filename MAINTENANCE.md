# Maintenance record

## 2026-09-22 reliability and efficiency pass

Existing uncommitted feature work was retained. This pass adds:

- Firebase ID-token verification for all current API handlers and token forwarding from browser API calls; rejects cross-user identity claims and removes hardcoded identities from legacy routes.
- Chat SSE buffering across chunks, explicit incomplete-stream errors, reader cleanup, cancellation propagation, and retention of partial replies on client errors.
- Provider deadlines for Gemini, DeepSeek, OpenAI research, and the opportunity pipeline; disables automatic SDK retries for idea research.
- Recursive document/chat deletion rather than a single unbounded batch that omitted document chat descendants.
- Fewer document-list reads: no global background fetch; document pages hydrate their own data. Account changes clear workspace caches.
- Document-list load cancellation and visible load/create/delete errors; failed deletes no longer disappear from the UI. Rename only updates cached state after a successful save.
- On-demand imports for chat, export, and opportunity panels.
- Removes repeated server dotenv loading and an unused cross-route import; adds `npm test` and focused regressions.

## Verification

- Baseline: nine tests passed, lint passed, production build passed. Initial `/document/[docId]` first-load JavaScript: 304 kB (Next build estimate).
- Updated regression suite: 17 tests passed, including access control and streaming failures. Updated lint passed.
- Final clean production build passed, including lint/type checks and all 34 static pages. A prior build hit a missing generated `/_document` file; rebuilding after clearing only `.next` resolved it.
- `/document/[docId]` first-load JavaScript fell from 304 kB to 297 kB (about 2.3%); route-specific JavaScript fell from 33 kB to 25.8 kB. These are build estimates, not measured user latency. The documents route gained roughly 1 kB with error handling and authenticated transport.
- Local production HTTP checks passed: `/`, `/auth/signin`, `/documents`, and `/document/smoke-test` returned 200; all 22 API HTTP handlers returned 401 without a token. These checks do not exercise browser hydration or authenticated end-to-end behavior.
- `git diff --check` passed. Builds still emit a transitive `punycode` deprecation warning; dependency upgrades were not part of this pass.
- External providers were mocked in regression tests. Live credentials, production deployment, signed-in browser flows, provider credits, and Firestore rules were not verified.

## Remaining work

See `INFRASTRUCTURE.md` for the precise connected/prototype/legacy inventory. The main unresolved items are legacy-flow migration, prototype studio actions, per-user provider isolation and spending controls, paginated histories/lists at scale, deployment/rules verification, and durable background jobs. This audit is not a claim that prototype buttons or every live integration are production-ready.
