#!/bin/bash
set -euo pipefail

# Bhasha Deep — production start script.
#
# Previously this ran `npm run dev` (tsx server.ts with NODE_ENV unset), which
# kept the Vite dev server alive in "production" and served source instead of
# the built bundle. It now builds first, fails fast on a missing key, and
# boots the Express server in production mode.

echo "🚀 Bhasha Deep deployment starting..."

# 1. Install dependencies (npm ci is reproducible and respects the lockfile)
echo "📦 Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# 2. Fail fast: the Gemini key is server-side only. It is never bundled into the
#    client, so a missing key must stop the deploy instead of shipping a UI that
#    silently 503s on every AI action.
if [ -z "${GEMINI_API_KEY:-}" ]; then
  if [ -f .env ] && grep -q '^GEMINI_API_KEY=.\+' .env; then
    echo "🔑 GEMINI_API_KEY found in .env"
  else
    echo "❌ GEMINI_API_KEY is not set. Export it or add it to .env." >&2
    echo "   (The frontend never receives this key; the /api/gemini proxy uses it.)" >&2
    exit 1
  fi
else
  echo "🔑 GEMINI_API_KEY is set in the environment"
fi

# 3. Type-check before building so a type error cannot reach production.
echo "🔎 Type-checking..."
npm run typecheck

# 4. Build the frontend
echo "🏗️ Building the frontend..."
npm run build

# 5. Start the production server
echo "⚡ Starting server..."
export NODE_ENV=production
exec npm run start
