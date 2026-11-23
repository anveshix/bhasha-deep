# Security Policy

Full threat model, fixes and operator steps are in [docs/SECURITY.md](docs/SECURITY.md). Read it before deploying.

## Reporting a vulnerability

Do **not** open a public issue. Use **Security → Advisories → Report a vulnerability** on this repository and include the affected file, reproduction steps and impact. Never include a live API key in a report; rotate any exposed key first.

## Keys in this repo

- `GEMINI_API_KEY` must stay on the server (`.env`, never committed). Only `.env.example` is tracked.
- `firebase-applet-config.json` contains a Firebase *web* API key. It identifies the project and is not a secret, but restrict it to your domains in Google Cloud Console (API key → Website restrictions).
