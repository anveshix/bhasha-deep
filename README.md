# Miru Santali Translator

A real-time bidirectional translation and education platform for Santali and Hindi.

> **Live demo:** not published. The app needs its Node server and a Gemini API key, so run it locally (see Quick start).

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

## Folder structure

```
.
├── src/                  # React + TypeScript frontend (App.tsx, components, lib, data)
├── server.ts             # Express server: serves the app and POST /api/gemini
├── docs/                 # SECURITY, changelog, project memory and handoff notes
├── firestore.rules       # Firestore security rules (deny by default)
├── firebase*.json        # Firebase project config (rules, indexes, blueprint)
├── public/               # Static assets served as-is
├── AI/ PDA/ agents/ knowledge/ prompts/ workflows/
│                         # Domain knowledge, prompt library and agent notes
└── .github/workflows/    # CI
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 anveshix

## Author

**anveshix** — [github.com/anveshix](https://github.com/anveshix)
