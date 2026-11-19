# Miru Santali Translator

A real-time bidirectional translation and education platform for Santali and Hindi.

## Security

Read [docs/SECURITY.md](docs/SECURITY.md) before deploying. Summary:

- `GEMINI_API_KEY` is **server-side only**. Browser code calls `POST /api/gemini`
  (see `src/lib/aiClient.ts`); the key is never bundled.
- Users may supply their own key in Settings; it is kept in `sessionStorage`
  only and never sent to this server.
- Firestore access is deny-by-default and field-validated
  (`firestore.rules`). Admin is a custom claim, not an email address.
- `npm run test` covers the sanitiser, prompt-injection guards, key storage,
  rate limiter and AI routing.

## Quick start

```bash
npm install
cp .env.example .env      # add GEMINI_API_KEY
npm run dev               # http://localhost:3000
npm run typecheck && npm test && npm run build
NODE_ENV=production npm start   # serve the production bundle
```

## Project Structure
- `PDA/`: Personal Digital Assistant management/logs.
- `AI/`: AI-related orchestration logic.
- `knowledge/`: Domain-specific glossaries and Santali linguistic data.
- `docs/`: Technical and user documentation.
- `prompts/`: System prompt library.
- `agents/`: Agent configuration and instructions.
- `workflows/`: Task and process workflows.
