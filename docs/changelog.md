# Changelog

## Security hardening (unreleased)

- **Removed API-key inlining**: `vite.config.ts` no longer maps
  `process.env.GEMINI_API_KEY` into the bundle. All model traffic goes through
  the new `POST /api/gemini` proxy (`server.ts`); the key stays server-side.
- **New `src/lib/aiClient.ts`**: single browser entry point for model calls.
  Uses the user's own key when present, the proxy otherwise.
- **Bring-your-own-key fixed and re-scoped**: keys moved from `localStorage` to
  `sessionStorage` (`src/lib/hostedKeys.ts`), with a one-time purge of the legacy
  entry. The feature previously had no effect at all.
- **Proxy hardening**: model allowlist, payload size/shape validation, 1 MB body
  cap, 30 req/min per IP (`src/lib/rateLimiter.ts`), upstream timeout +
  disconnect abort, secret redaction on upstream errors.
- **XSS sink replaced**: `sanitizeHtmlForPrint` (denylist) → `src/lib/sanitizeHtml.ts`
  (strict allowlist, scheme normalisation, raster-only image data URIs).
- **Prompt-injection guards**: uploaded documents are neutralised and fenced
  (`src/lib/untrustedContent.ts`); the `[END_OF_TRANSLATION]` sentinel can no
  longer be forged by user input or leak mid-stream.
- **Firestore rules**: admin via custom claim (no hardcoded email), timestamp
  bounds, bounded field counts, non-spoofable `contributed_by`
  (`src/lib/attribution.ts`), sign-in required for feedback, and a rule for
  `user_md_documents` (uploads were silently denied before).
- **Server hygiene**: security headers incl. production CSP, `x-powered-by`
  off, JSON error handler (no stack traces), SPA fallback that does not swallow
  `/api`, immutable caching for hashed assets only.
- **Upload limits** (10 MB/file, 25 MB total, 5 files) and `alert()` removed.
- **Tooling**: `npm run typecheck` / `lint` / `test` split, Vitest suite (51
  tests), GitHub Actions CI with a build-output key leak check,
  `firebase.json` + `firestore.indexes.json`.

## 1.0.0 (2026-07-26)
- Initial structure setup for disaster recovery/context preservation.
