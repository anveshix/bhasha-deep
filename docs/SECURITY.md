# Security

This document records the threat model, the fixes applied, and the deployment
steps that must be run **outside** the repository. Anything marked ⚠️ is an
operator action; the code cannot do it for you.

## Threat model

| Asset | Who could attack it | Impact if broken |
| --- | --- | --- |
| Deployment `GEMINI_API_KEY` | Anyone who can read the built JS bundle | Cost abuse, key revocation, quota denial for real users |
| User's personal Gemini key | XSS, extensions, shared device | Leaked credential becomes a bill someone else pays |
| Firestore records | Any signed-in user of a public web app | Impersonation, backdated/spam records, data loss |
| Translation output pane / print document | Model output, uploaded files | Stored XSS in a same-origin document |
| Model behaviour | Uploaded `.txt`/`.md` "ground truth" | Prompt injection, data exfiltration, wrong translations |

## What was fixed

### 1. API key never reaches the browser
- `vite.config.ts` previously had
  `define: { 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY) }`.
  That inlined the secret into a public asset (verified: a canary string
  appeared verbatim in `dist/assets/index-*.js`).
- The `define` block is gone. All model calls now go through
  `POST /api/gemini` in `server.ts`, which holds the key in the server process.
- `src/lib/aiClient.ts` is the only browser-facing entry point. Regression
  test: `src/lib/aiClient.test.ts` asserts the request contains no `AIza…`
  string and no `x-goog-api-key` header when running key-less.

### 2. Bring-your-own-key works, and is stored safely
- The old `getApiKey()` returned `process.env… || import.meta…`; after the
  `define` substitution the first term was `undefined`, so the user's key in
  `localStorage` was ignored and the feature silently did nothing.
- Keys now live in **`sessionStorage`** (`src/lib/hostedKeys.ts`) — tab-scoped,
  cleared on close, not readable from other tabs.
- `purgeLegacyLocalKey()` deletes `custom_gemini_key` left behind by older
  builds on first mount.
- Users can clear the key from Settings; when absent, traffic uses the proxy.

### 3. Proxy is not an open relay
`server.ts` enforces, before any upstream call:
- model allowlist (`gemini-2.5-flash`, `-flash-lite`, `-pro`),
- `contents` must be a non-empty array, ≤ 60 000 characters,
- `systemInstruction` type/size limits, `temperature` bounded to 0–2,
- request body capped at 1 MB (`express.json({ limit })` → clean 413),
- 30 requests/minute per client IP (fixed window, `src/lib/rateLimiter.ts`),
  answered with `429` + `Retry-After`,
- upstream timeout (60 s) and client-disconnect abort,
- upstream error bodies are passed through `redactSecrets()` so a
  misconfigured upstream cannot echo the key back.

### 4. Firestore rules hardened
`firestore.rules` changes:
- **Admin is a custom claim** (`request.auth.token.admin == true`) instead of a
  hardcoded personal email address. ⚠️ See "Operator steps" below.
- **Timestamps are bounded** (`isPlausibleTimestamp`): a client can no longer
  set a far-future timestamp to pin a record to the top of a feed forever.
- **`contributions` attribution cannot be spoofed**: `contributed_by` must equal
  the caller's uid or the `name` claim in their verified token. All writers now
  go through `src/lib/attribution.ts`.
- **`feedback` requires sign-in** and a valid `rating` (`up`/`down`); the client
  used to post `user_id: 'anonymous'`, which no rule could ever accept.
- **`user_md_documents` now has a rule.** Uploads were written to a collection
  with no rule at all: every write was denied, the error was swallowed, and the
  UI still showed a success toast. The client now reports "saved on this device
  only" when the cloud write fails.
- `list` rules bound `request.query.limit` so a hostile query cannot force a
  full-collection scan.
- `santali_dataset.confidence` is range-checked (0–1), contribution field count
  is bounded, and empty `hindi`/`santali_deva` values are rejected.

### 5. XSS / injection into the print document
- `sanitizeHtmlForPrint` was a denylist (`on*`, literal `javascript:`) — beaten
  by `java\tscript:`, entity encoding, `data:image/svg+xml`, `srcset`,
  `xlink:href`, `<base>`, `<meta refresh>`.
- Replaced with `src/lib/sanitizeHtml.ts`: a strict tag/attribute allowlist,
  inert `DOMParser` parsing, scheme normalisation (control/zero-width chars
  stripped before inspection), base64 raster-only image data URIs, and
  `rel="noopener noreferrer nofollow"` on links.
- `window.open` now passes `_blank` and `noopener,noreferrer` before any
  `document.write`, and `opener` is nulled immediately.

### 6. Prompt injection and sentinel forgery
- Uploaded `.txt`/`.md` content was concatenated straight into the **system
  instruction**. It is now neutralised and fenced by
  `src/lib/untrustedContent.ts` (`wrapUntrustedData`) and labelled as data.
- `[END_OF_TRANSLATION]` is a protocol marker: user text containing it could
  end a translation early or smuggle text past the marker. It is stripped from
  input (`neutralizePromptControl`), and output rendering uses
  `stripSentinel` / `stripPartialSentinel` so a partially streamed marker never
  appears.

### 7. Resource-exhaustion guards
- Uploads: 10 MB/file, 25 MB total, 5 attachments, 200 000 characters of text
  ingestion — with user-facing messages instead of `alert()`.
- WebSocket: `maxPayload` 64 KB.
- `ResizeObserver`-free code paths are unaffected; no unbounded retention added.

### 8. Transport / response hygiene
- `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy` on every response.
- A strict `Content-Security-Policy` in production only (it would break the Vite
  dev client). Review `connect-src` if you add a new backend host.
- `x-powered-by` disabled.
- A JSON error handler replaces Express's default HTML/stack renderer, so
  body-parser failures no longer print file paths (`node_modules/raw-body/...`)
  to the client.

## Operator steps (required, once per environment)

1. **Rotate the Gemini key.** It was previously inlinable into the bundle, so
   any build made before this change may have shipped it. Create a new key,
   restrict it to the Generative Language API, and delete the old one.
2. **Set the key server-side only**: `GEMINI_API_KEY=…` in the host's secret
   store or `.env`. Never expose it as `VITE_*` (Vite inlines those).
3. **Grant admin via a custom claim**, then redeploy rules:
   ```bash
   # one-off, using a service-account key (never from the browser)
   node -e '
     const admin = require("firebase-admin");
     admin.initializeApp({ credential: admin.credential.applicationDefault() });
     admin.auth().setCustomUserClaims("<ADMIN_UID>", { admin: true });
   '
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   To revoke: `setCustomUserClaims(uid, { admin: false })` (or `null`).
   The user must sign out/in (or wait up to an hour) for the claim to refresh.
4. **Deploy indexes** from `firestore.indexes.json`. Without the
   `translations(user_id, timestamp)` composite index, the history listener
   fails with `failed-precondition` on sign-in.
5. **Enable Firebase Auth email/password + Google**, and add your production
   domain to Authorized domains.
6. Serve over HTTPS. The app requests microphone access; browsers only grant it
   on secure origins.

## Known residual risks

- **Firebase web config in `firebase-applet-config.json`** is public by design
  (project id, web API key). Security rests entirely on the rules — keep them
  deployed and tested. Add App Check if you see abuse.
- **Anonymous proxy use is allowed** so the public demo keeps working. The rate
  limit is per IP and in-memory, so it resets on restart and is not shared
  between instances. For a multi-instance deployment, back
  `FixedWindowRateLimiter` with Redis, or require sign-in for `/api/gemini`.
- **Bhashini credentials** (`bhashini_config`) are stored in `localStorage` and
  sent from the browser to `dhruva-api.bhashini.gov.in`. This is a third-party
  credential the user owns; moving it server-side is the next hardening step
  but changes the feature's UX (it is currently per-user, not per-deployment).
- **Model output is untrusted text.** It is rendered through `react-markdown`
  (no `rehype-raw`, so no raw HTML) and sanitised before the print path. If you
  ever add `rehype-raw`, pass the output through `sanitizeHtml` first.

## Verifying the fixes

```bash
npm run typecheck      # tsc --noEmit
npm run test           # vitest: sanitizer, prompt fencing, key storage, rate limiter, ai routing
npm run build && grep -r "AIza" dist/ | grep -v "firebase-applet-config"   # must be empty
curl -s -X POST localhost:3000/api/gemini -H 'Content-Type: application/json' \
  -d '{"model":"evil","contents":[{"parts":[{"text":"hi"}]}]}'             # 400
```
