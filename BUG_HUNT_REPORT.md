# Ateelabo AI — bug hunt and hardening report

**Date:** 25 October 2026  
**Working branch:** `arena/0c1adaa6-ateelabo-ai`  
**Status:** implementation and local checks complete; live deployment verification is still required.

## Executive summary

Completed a source review, dependency audit, regression-test pass and focused application/security fixes. This report includes the first-pass connectivity/upload fixes and the deeper follow-up work.

The most significant additional discoveries were:

1. Newly uploaded document text was extracted but omitted from the first AI prompt.
2. Document context was shared at application level rather than isolated by conversation.
3. The administrator role-change handler was defined inside the statistics loader, outside the scope of its UI.
4. Login could automatically promote any account matching `ADMIN_EMAIL`, despite registration not verifying email ownership.
5. Browser history was not separated by account and persistence could resurrect deleted chats.
6. Authentication tokens were stored in JavaScript-readable local storage.
7. Unbounded provider work and document extraction needed more than a short-lived per-process rate limiter.

These paths have been changed and covered where practical by automated regression checks. **This is not a guarantee that every possible defect is absent, or a certification that the application is ready for public production.**

## Findings and changes

### Connectivity and deployment

| Finding | Change |
|---|---|
| Browser requests pointed at the visitor's `localhost:5000` | All frontend API calls now use relative `/api` URLs. |
| Frontend builds did not provide a runnable production API arrangement | Express serves the built SPA and API together in production, including deep links. |
| Port and origin assumptions were fixed to development values | Configurable `PORT`, `CORS_ORIGINS`, and explicit trusted-proxy network configuration. Server binds to all interfaces. |
| Vite/React plugin versions conflicted during clean installation | Updated the compatible React plugin, enabled it in Vite, and refreshed the lockfile. |
| README referred to missing environment files and serverless implementation | Added `.env.example` and replaced deployment/setup documentation. |
| Server started accepting traffic without awaiting its database connection | Startup awaits database connectivity and the unique-email index. Missing/weak startup secrets and invalid ports are rejected. |
| Database helper forced Google's public DNS resolver | Removed that override so the host's configured DNS is respected. |
| Unknown frontend/API routes could produce blank or inconsistent results | Added a frontend not-found page and structured API 404 responses. |

### Authentication and administrator safety

| Finding | Change |
|---|---|
| Browser JWTs were stored in `localStorage` | New logins use HttpOnly, SameSite=Strict cookies; production also sets Secure. New tokens are not returned in login JSON. |
| Password changes left existing JWT sessions usable | Added account token versions, checked on authenticated chat/admin/profile requests and incremented on password change. |
| Public registration could indirectly create an administrator by claiming the configured owner email | Removed login-time email-only promotion. Trusted operators can use `scripts/set-admin.js` after independently verifying account ownership. |
| Role promotion did not actually grant access because only the configured email passed authorization | Admin authorization now checks the authenticated account's current database role. Delegated administrators can access the dashboard. |
| Role-management UI referenced an out-of-scope function | Moved the handler to component scope and tested the selector interaction and statistics refresh. |
| Self-demotion/deletion could strand the acting administrator | Protected the acting account as well as the configured owner account. Invalid user IDs are rejected before database operations. |
| Registration/password-change inputs were loosely typed | Added normalization, email/name validation, password minimums, and bcrypt's 72-byte new-password limit. Object-based query input is rejected. |
| Registration and password-change attempts lacked dedicated abuse protection | Added account-action rate limiting; login keeps its own limiter. |
| Profile changes were only local and could misleadingly alter the displayed account email | Added authenticated server-side name/picture persistence. Email is read-only until an email-verification flow exists. |
| Profile could be opened without an account and later dereference a missing user | Added a login prompt. Corrupt/malformed saved user records are handled safely. |

**Compatibility:** old bearer JWTs remain accepted until expiry or token-version invalidation. A fresh login removes an old browser token. Existing account roles were not modified in a live database. Existing administrators must be reviewed before launch because the old promotion behavior may have already been exercised.

### Chat correctness and local data

| Finding | Change |
|---|---|
| Model requests omitted prior conversation messages | Send up to 20 bounded previous turns, with a 40,000-character overall history budget. Server rejects injected system roles and malformed history. |
| Freshly uploaded document was not used for the first question | Prompt construction now includes new extracted text, which takes precedence over older context. Tested through the upload endpoint. |
| Document context could cross conversation boundaries | Store it per chat and send only the active conversation's context. |
| Histories were shared across account sign-ins | Separate persistence keys by account ID or guest, with guarded account-switch loading/saving. |
| Old unscoped history could not safely be assigned to an owner | Preserve it unchanged; provide an explicit backup download in Settings rather than silently claiming ownership. |
| Saving only nonempty history could leave deleted chats on disk | Persist the current state consistently. Deleting the final chat creates a fresh blank chat. |
| Deleting a nonactive chat switched away from the current conversation | Only change selection when the active chat is removed. |
| In-flight requests had no browser deadline or account-change cancellation | Added abort handling, a client timeout, synchronous duplicate-send protection, and account/unmount cancellation. |
| Network failures could disappear into the console | Add visible error messages to the relevant conversation; failed replies are excluded from future AI history. |
| Artificial character-by-character playback delayed completion and repeatedly rewrote storage | Removed simulated streaming. Complete provider responses are displayed directly. |
| Empty-message document analysis was blocked in the UI | Permit a supported document with an empty message. |
| Sidebar resize state did not affect its width | Applied its width with viewport constraints. |
| Feedback buttons only displayed success alerts | Reactions are now stored on the local message, with pressed-state semantics. They are not represented as provider feedback. |
| Clipboard failures and unsupported read-aloud could throw | Added browser capability/error handling. |

Local storage is still local storage: account separation prevents accidental UI mixing, not access by someone who controls the same browser profile. This is not encrypted history or cloud synchronization. Disabling history stops future writes and does not erase existing saves.

### Uploads, AI reliability and cost protection

| Finding | Change |
|---|---|
| Anonymous paid AI access had no chat limiter | Enforce 30 chat requests per IP per 15 minutes before upload processing. |
| Restarting/scaling could bypass an in-memory-only spending control | Added durable MongoDB daily attempted-work reservations: 100/user, 20/guest IP, 1,000/global by default; configurable through environment variables. |
| Uploads lacked size/count checks | One PDF/DOCX, maximum 10 MB, with bounded multipart fields. |
| Filename/MIME checks alone could accept obviously mismatched content | Added file-signature checks before extraction. Parsers must also successfully extract nonempty text. |
| Complex documents were parsed in the main HTTP process | Move extraction to child processes with a 15-second deadline, 192 MB JS heap setting and two concurrent workers per API process. |
| Temporary files were not excluded from version control | Ignore `uploads/`; preserve cleanup paths, including budget/validation failures. |
| PDF parser cleanup could be skipped on extraction errors | Worker uses `finally` to destroy the parser; parent cleans the temporary upload. |
| Provider requests lacked deadlines and explicit output bounds | 45-second deadline per provider and 2,048 output tokens. |
| Primary-provider malformed JSON did not enter fallback | Empty/malformed primary output triggers the existing fallback path. Ordinary client errors still do not blindly retry. |
| Provider model identifiers were hardcoded | Configure `OPENAI_MODEL` and `GEMINI_MODEL`; Gemini default is `gemini-2.5-flash`. Live availability remains to be checked. |
| Cost estimates applied GPT-4o mini rates to every provider's tokens | Estimate only explicitly identified OpenAI GPT-4o mini usage and label the rates/exclusions. Gemini and other models are excluded. |
| Analytics dates mixed local calendar boundaries with UTC grouping | Standardized daily/monthly calculations and chart keys on UTC. |
| Private prompts/responses and internal exception details appeared in debug output | Removed chat-body/browser-response debug logs and reduced public/internal error detail. Added no-store and MIME/referrer response protections. |

Daily reservations count attempted provider/document work, not just successful answers. They reset at UTC midnight and fail closed if their database check fails. Failed work can consume the allowance; reservations are deliberately not refunded. Identity-only predefined replies do not consume the daily provider allowance. This is request-count protection, not exact dollar billing.

### Browser compatibility and truthful controls

- Text chat works when speech recognition is unsupported; only voice input is disabled.
- Starting dictation resets the prior transcript.
- Enter-to-send is persisted and respected; IME composition does not inadvertently send a message.
- Removed misleading selectable provider/model controls from chat and settings. Models are server-managed.
- Streaming and non-dark themes are explicitly unavailable rather than controls that silently do nothing.
- File descriptions now state PDF/DOCX support instead of suggesting image analysis.
- Corrected React SVG attribute casing found by UI tests.
- Removed unused browser-side document parser imports/direct PDF.js dependency, reducing bundle size and eliminating an unnecessary vulnerable dependency.

## Dependency audit and performance

- First-pass audit: **15 advisories** (4 moderate, 10 high, 1 critical).
- Final `npm audit`: **0 reported vulnerabilities**.
- Used compatible package fixes rather than `npm audit fix --force`.
- Removed unused direct PDF.js; retained the PDF parser's own dependency tree.
- Overrode vulnerable `postcss-selector-parser` with patched 7.1.6-compatible resolution while retaining Tailwind 3; CSS and production builds passed.
- Frontend JavaScript reduced from approximately **1,320.56 kB to 418.21 kB** minified, and **370.01 kB to 123.86 kB** gzip, using the builds observed during this session.

An audit result only describes currently reported dependency advisories; it does not prove the absence of supply-chain or application vulnerabilities.

## Verification performed

Final checks passed after a clean `npm ci`:

| Check | Result |
|---|---|
| Clean locked dependency installation | Passed |
| ESLint undefined identifiers, unreachable code and hook-order checks | Passed |
| Node test runner | 24 reported tests passed; 0 failed/skipped (includes API parent test) |
| jsdom frontend tests | 6 passed; 0 failed |
| Real PDF and DOCX fixture extraction | Passed |
| Production Vite build | Passed |
| Production HTTP smoke checks | Passed: `/`, login/profile/settings/admin deep links, built JavaScript asset, API 404, Secure/HttpOnly cookie attributes |
| Dependency audit | 0 reported vulnerabilities |
| Git diff whitespace/error check | Passed |

Regression coverage includes malformed credentials, anonymous/admin authorization, delegated role changes, self-demotion protection, revoked sessions, cookie login/logout, profile validation/persistence, primary-provider context, Gemini fallback/quota errors, initial document uploads, daily budget failure handling, bounded conversation roles/content, upload rejection/size limits, per-IP limiting, corruption-safe storage, account-isolated history, document isolation, logout history switching, unsupported speech recognition, Enter behavior and visible network errors.

API/database/provider behavior is tested using mocks and intercepted HTTP. The document fixtures are small synthetic test documents, not user data. Tests do not contact a live MongoDB deployment or spend provider credits. Added `npm run check` and a GitHub Actions workflow to rerun the checks; the remote workflow itself was not run here.

## Rollout checklist — still required

1. **Review all existing admin roles.** Independently verify the intended owner/administrators. The old automatic-promotion behavior was unsafe.
2. **Configure a unique JWT secret and deploy behind HTTPS.** Production cookies will not authenticate over plain HTTP. Rotating an old secret also invalidates legacy JWTs.
3. **Configure the exact trusted reverse-proxy networks.** Test that two visitors receive separate IP allowances and that arbitrary forwarded headers cannot bypass limits.
4. **Verify MongoDB permissions/indexes and concurrent quota reservations on the real deployment.** The new budget collection and TTL index require the host's database permissions; mocked tests do not prove cluster behavior.
5. **Test live OpenAI/Gemini model availability, quotas and fallback.** No real credentials or paid-provider calls were used for verification.
6. **Tune the daily allowances/output limits to the intended budget.** Account creation and distributed IPs can spread per-identity usage; the global daily cap is the shared final bound.
7. **Use a shared short-term limiter store for multiple API replicas.** The durable daily quota is shared, but 15-minute limiter state remains per process.
8. **Run actual-browser checks for microphone permissions, speech support, mobile layouts and sign-in on the production domain.** jsdom does not test real audio APIs or pixel layout.
9. **Operationally monitor uploads, errors and provider usage.** Child-process limits are not antivirus, a hard native-memory sandbox or a full denial-of-service defense. Interrupted server processes can leave temporary files requiring housekeeping.
10. **Back up before rollout.** Old unscoped chats are preserved, but cannot be safely auto-assigned; users can download them explicitly from Settings.

## Deliberately not implemented

Email verification/recovery, cloud chat synchronization, subscriptions/payments, OCR/image understanding, actual token streaming, non-dark themes, and alternative provider integrations are product features rather than safe incidental bug fixes. Unsupported controls were made truthful instead of adding untested integrations. Large-file architectural refactoring was limited to extracting validation, session, context, budget, extraction, cost and browser-storage helpers.

No live data was deleted, no credentials were added to the repository, and no deployment was performed during this pass. The implementation was initially saved on the session branch; subsequent publication and merge status are tracked by the GitHub pull request. Publishing the code does not replace the rollout checks above.
