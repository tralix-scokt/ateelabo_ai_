# Ateelabo AI

React/Vite/Tailwind frontend with an Express API, MongoDB accounts and usage analytics, PDF/DOCX analysis, and OpenAI/Gemini integration.

## Requirements and setup

Use Node.js 22.13+ on the Node 22 release line, or Node 24, npm, MongoDB, and provider API credentials. Verified here with Node 22.22.3.

1. Copy `.env.example` to `.env`. Configure `MONGO_URI`, provider keys and a unique `JWT_SECRET` of at least 32 characters. Never commit secrets.
2. Generate a secret locally: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Run `npm ci`.
4. Run `npm start` for the API (default port 5000).
5. In a second terminal run `npm run dev` (binds to all interfaces).

Frontend requests use relative `/api` URLs; Vite proxies them to port 5000. If changing the API development port, update the proxy target in `vite.config.js` too. Environment variables are server-side; do not expose keys through Vite variables.

## Production deployment

Run `npm run build`, then `NODE_ENV=production npm start` on a persistent Node-capable host with MongoDB and environment variables configured. Express serves the built frontend and API, including SPA deep links. It binds to `0.0.0.0` and honors `PORT`.

- **HTTPS is required:** production session cookies are Secure, HttpOnly and SameSite=Strict. Do not use the production app over plain HTTP.
- A static-only deployment is insufficient. This API uses MongoDB, temporary disk storage and child processes for document parsing; it is not a drop-in serverless function.
- If hosting frontend assets separately, reverse-proxy `/api` to Express under the same public origin. Same-origin deployment is the supported browser authentication setup.
- `CORS_ORIGINS` is an explicit comma-separated origin allowlist. Do not use a wildcard for credentialed traffic.
- Configure `TRUST_PROXY` only with your actual reverse proxy IPs/CIDRs. The default trusts no forwarded IPs. An incorrect setting can either combine visitors behind one IP or permit IP spoofing. Check your hosting topology before setting it; do not set it to arbitrary client networks.
- Existing accounts and usage records remain in place. No live database migration was run by this change.

## Authentication and administrators

New logins set an HttpOnly session cookie instead of returning a token to browser JavaScript. Old bearer tokens remain accepted for compatibility until they expire or their account's token version changes; logging in removes the old browser token. Password changes invalidate previous sessions and require a fresh login.

**Login no longer grants admin merely because an email matches `ADMIN_EMAIL`.** Registration does not verify email ownership, so automatic promotion was unsafe. Existing admin roles are preserved: review them before launch. To bootstrap a trusted administrator, create the account, verify its ownership outside the app, then run from a trusted operator environment:

```bash
node scripts/set-admin.js verified-admin@example.com
```

Admins can access statistics and manage other users. The configured `ADMIN_EMAIL` owner account and the acting admin are protected against deletion/demotion. `ADMIN_EMAIL` is now an owner-protection setting, not an automatic role grant.

Profile name/picture updates are persisted on the server. Email changes are not offered because an email-verification flow is not implemented.

## Limits and processing

- Short-term chat limit: 30 requests per IP per 15 minutes, before uploads/authentication. Login and account actions have separate short-term limits.
- Durable daily attempted-work allowances, reset at UTC midnight: users 100, guests 20 per IP, deployment-wide 1,000. Configure `USER_DAILY_REQUESTS`, `GUEST_DAILY_REQUESTS`, `GLOBAL_DAILY_REQUESTS`. MongoDB atomic conditional upserts reserve attempts; requests fail closed if the check fails. Failed provider/document work consumes an allowance. Identity-only predefined replies do not consume the daily provider allowance.
- Short-term limiter state remains per process. Multiple replicas need a shared limiter store for an exact deployment-wide 15-minute limit; daily allowances are shared through MongoDB.
- One PDF/DOCX, at most 10 MB, with filename/MIME/signature checks. Extraction runs in a separate child process with a 15-second deadline, 192 MB JS heap setting and two concurrent workers per API process. This is not antivirus or a hard native-memory sandbox.
- Messages: 10,000 characters; document text: 30,000 characters. Scanned/image-only PDFs require OCR, which is not implemented.
- Conversation context: at most 20 previous turns, 10,000 characters each, 40,000 total. Client-provided system roles are rejected. Document text is treated as reference data, though prompt-injection resistance cannot be guaranteed.
- Each provider request has a 45-second timeout and a 2,048-output-token limit. Models are configurable using `OPENAI_MODEL` and `GEMINI_MODEL`. Check availability and account quotas with the providers.
- Cost estimates cover recorded OpenAI GPT-4o mini requests only, at illustrative $0.15/$0.60 per million input/output tokens. Gemini/other models are excluded; this is not an invoice.

## Browser history and settings

History and document context are local to this browser, separated by account ID or guest. Clearing browser data still removes them; this is not cloud synchronization or protection against somebody with access to your browser profile. Existing unscoped `ateelabo_chats` data is preserved, not automatically assigned to any account. Settings provides an explicit legacy backup download.

Disabling history stops future disk writes; it does not erase old saves. Unsupported speech recognition disables only voice input. Enter-to-send is persisted and honored. Unsupported streaming/model/theme controls no longer pretend to change server behavior. Reactions are stored locally, not sent as provider feedback.

## Verification

- `npm test`: backend/unit tests, mocked-provider/database API regression tests, real PDF/DOCX fixture extraction and jsdom UI tests.
- `npm run lint`: undefined identifiers, unreachable code and hook-order checks.
- `npm run check`: lint, all tests, production build and production HTTP smoke checks.
- `npm audit`: dependency advisory check.

Mocks and jsdom are not substitutes for a real MongoDB concurrency test, paid-provider test, browser voice/microphone test, or production hosting verification. See `BUG_HUNT_REPORT.md` for the completed pass and rollout checklist.
