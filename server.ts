import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { FixedWindowRateLimiter } from './src/lib/rateLimiter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Models the proxy is willing to forward. An explicit allowlist stops the
 * endpoint being used as an open relay for arbitrary/expensive models.
 */
const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
]);

const MAX_PROMPT_CHARS = 60_000;
const MAX_REQUEST_BYTES = 1_000_000; // 1 MB, generous for inline base64 docs
const UPSTREAM_TIMEOUT_MS = 60_000;

const apiLimiter = new FixedWindowRateLimiter({ limit: 30, windowMs: 60_000 });

function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=()');

  if (IS_PROD) {
    // The app talks to Firestore, Google Identity and the Generative Language
    // API directly, so those origins must stay reachable. Inline styles are
    // required by the Tailwind/motion bundle.
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.googleapis.com https://generativelanguage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss:",
        "frame-src 'self' https://*.firebaseapp.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
      ].join('; '),
    );
  }
  next();
}

/** Best-effort client identity for rate limiting (proxy aware). */
function clientKey(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.socket.remoteAddress;
  return (ip || 'unknown').trim();
}

interface GeminiProxyBody {
  model?: unknown;
  contents?: unknown;
  systemInstruction?: unknown;
  temperature?: unknown;
  stream?: unknown;
}

function validateProxyBody(body: GeminiProxyBody): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  const model = typeof body.model === 'string' ? body.model : '';
  if (!ALLOWED_MODELS.has(model)) {
    return { ok: false, error: 'Unsupported model.' };
  }

  const contents = body.contents;
  if (!Array.isArray(contents) || contents.length === 0) {
    return { ok: false, error: 'contents must be a non-empty array.' };
  }

  const serialized = JSON.stringify(contents);
  if (serialized.length > MAX_PROMPT_CHARS) {
    return { ok: false, error: `Request too large (max ${MAX_PROMPT_CHARS} characters of content).` };
  }

  if (body.systemInstruction !== undefined && typeof body.systemInstruction !== 'string') {
    return { ok: false, error: 'systemInstruction must be a string.' };
  }
  if (body.systemInstruction && String(body.systemInstruction).length > MAX_PROMPT_CHARS) {
    return { ok: false, error: 'systemInstruction too large.' };
  }
  if (body.temperature !== undefined && (typeof body.temperature !== 'number' || body.temperature < 0 || body.temperature > 2)) {
    return { ok: false, error: 'temperature must be a number between 0 and 2.' };
  }

  return {
    ok: true,
    value: {
      model,
      contents,
      systemInstruction: body.systemInstruction,
      temperature: body.temperature,
      stream: body.stream === true,
    },
  };
}

/**
 * Strips anything key-shaped before an upstream error reaches the browser,
 * so a misconfigured upstream can never echo the deployment credential back.
 */
function redactSecrets(text: string): string {
  return text
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, '[redacted-key]')
    .replace(/key=[^&\s"']+/gi, 'key=[redacted]');
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // required for correct client IPs behind the preview proxy
  app.use(securityHeaders);
  app.use(express.json({ limit: MAX_REQUEST_BYTES }));

  // API Endpoints
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', engine: 'Santali Pro Max Real-Time', proxy: Boolean(process.env.GEMINI_API_KEY) });
  });

  /**
   * Server-side Gemini proxy.
   *
   * Why this exists: building the frontend with `define: { 'process.env.GEMINI_API_KEY': ... }`
   * inlined the deployment key into a public JS asset. The key now stays in the
   * server process and the browser only ever talks to this endpoint.
   *
   * Anonymous use is allowed (it is a public demo app) but rate limited; the
   * endpoint is not an open relay because model, size and shape are pinned.
   */
  app.post('/api/gemini', async (req, res) => {
    const gate = apiLimiter.consume(clientKey(req));
    res.setHeader('X-RateLimit-Remaining', String(gate.remaining));
    if (!gate.allowed) {
      res.setHeader('Retry-After', String(Math.ceil(gate.retryAfterMs / 1000)));
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: 'Server is not configured with a Gemini API key.' });
      return;
    }

    const parsed = validateProxyBody(req.body ?? {});
    if (parsed.ok === false) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const { model, contents, systemInstruction, temperature, stream } = parsed.value as {
      model: string;
      contents: unknown;
      systemInstruction?: string;
      temperature?: number;
      stream: boolean;
    };

    const payload: Record<string, unknown> = { contents };
    if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    if (typeof temperature === 'number') payload.generationConfig = { temperature };

    const upstreamUrl = stream
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`
      : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    // Abort only when the *response* closes before we finished writing it
    // (client went away). Listening on `req`'s 'close' fires as soon as the
    // request body has been consumed, which killed every upstream call.
    res.on('close', () => {
      if (!res.writableEnded) controller.abort();
    });

    try {
      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!upstream.ok) {
        const detail = redactSecrets(await upstream.text().catch(() => ''));
        // 429/503 are meaningful to the client (it backs off); everything else
        // is reported without upstream internals.
        res.status(upstream.status === 429 ? 429 : 502).json({
          error: upstream.status === 429 ? 'Upstream rate limit reached.' : 'Upstream model error.',
          detail: redactSecrets(detail).slice(0, 500),
        });
        return;
      }

      if (stream) {
        res.status(200);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Connection', 'keep-alive');
        if (!upstream.body) {
          res.end();
          return;
        }
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
        return;
      }

      const json = (await upstream.json()) as Record<string, unknown>;
      res.json(json);
    } catch (error) {
      const aborted = (error as Error)?.name === 'AbortError';
      if (!res.headersSent) {
        res.status(aborted ? 504 : 502).json({ error: aborted ? 'Upstream timed out.' : 'Upstream request failed.' });
      } else {
        res.end();
      }
    } finally {
      clearTimeout(timeout);
    }
  });

  /**
   * JSON error handler: Express's default handler renders the stack trace in
   * the response body, which leaks file paths and internals. Errors are
   * normalised here and the client only ever sees a short message.
   */
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    const isBodyLimit = err?.type === 'entity.too.large';
    const message = isBodyLimit ? 'Request body too large.' : status === 500 ? 'Internal server error.' : err.message;
    if (status >= 500) console.error('Unhandled server error:', err?.message);
    res.status(isBodyLimit ? 413 : status).json({ error: message });
  });

  // WebSocket Server for Real-Time Streaming
  const wss = new WebSocketServer({ server, path: '/stream', maxPayload: 64 * 1024 });

  wss.on('connection', (ws: WebSocket) => {
    console.log('📡 Voice Stream Client Connected');
    // Backend Gemini usage is deprecated; the channel is kept for future
    // non-LLM streaming/signalling. Bound the payload above and ignore data.
    ws.on('message', () => {});
    ws.on('close', () => console.log('📡 Voice Stream Client Disconnected'));
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false, maxAge: '1y', immutable: true }));
    // SPA fallback: index.html is never cached so redeploys take effect.
    app.get(/^(?!\/api|\/stream).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Santali Pro Max Server running on http://localhost:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down: closing HTTP server');
    wss.close();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
