/**
 * Browser-side AI client.
 *
 * Two routes, in order of preference:
 *  1. The user's own key (sessionStorage) → calls Google directly, which is what
 *     "bring your own key" means and keeps the deployment quota free.
 *  2. Otherwise → POST /api/gemini, a server-side proxy. The deployment's
 *     GEMINI_API_KEY never leaves the server process.
 *
 * The returned object intentionally mimics the small slice of the
 * `@google/genai` client that the app uses (`models.generateContent`,
 * `models.generateContentStream`) so call sites do not have to change, and
 * errors keep a numeric `.status` so the existing 429 backoff still works.
 */
import { getByoGeminiKey } from './hostedKeys';

export interface AiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export interface AiContent {
  role?: 'user' | 'model';
  parts: AiPart[];
}

export interface GenerateParams {
  model: string;
  contents: string | AiContent[] | AiContent;
  config?: {
    systemInstruction?: string;
    temperature?: number;
  };
}

export interface GenerateResult {
  text: string;
}

export class AiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AiRequestError';
    this.status = status;
  }
}

const GOOGLE_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

function normalizeContents(contents: GenerateParams['contents']): AiContent[] {
  if (typeof contents === 'string') return [{ role: 'user', parts: [{ text: contents }] }];
  return Array.isArray(contents) ? contents : [contents];
}

function extractText(json: any): string {
  const candidate = json?.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p: AiPart) => p.text || '').join('');
  }
  const blocked = json?.promptFeedback?.blockReason;
  if (blocked) throw new AiRequestError(`Prompt blocked by safety filters (${blocked}).`, 400);
  return '';
}

async function readErrorMessage(response: Response): Promise<string> {
  const raw = await response.text().catch(() => '');
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.error || raw.slice(0, 300);
  } catch {
    return raw.slice(0, 300);
  }
}

/** POST /api/gemini — the key-less path. */
async function callProxy(path: 'generate' | 'stream', params: GenerateParams, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(`/api/gemini${path === 'stream' ? '?stream=1' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model,
      contents: normalizeContents(params.contents),
      systemInstruction: params.config?.systemInstruction,
      temperature: params.config?.temperature,
      stream: path === 'stream',
    }),
    signal,
  });

  if (!response.ok) {
    throw new AiRequestError(await readErrorMessage(response), response.status);
  }
  return response;
}

/** Direct call with the user's own key. */
async function callGoogle(path: 'generate' | 'stream', params: GenerateParams, key: string, signal?: AbortSignal): Promise<Response> {
  const action = path === 'stream' ? 'streamGenerateContent?alt=sse' : 'generateContent';
  const body: Record<string, unknown> = { contents: normalizeContents(params.contents) };
  if (params.config?.systemInstruction) {
    body.systemInstruction = { parts: [{ text: params.config.systemInstruction }] };
  }
  if (typeof params.config?.temperature === 'number') {
    body.generationConfig = { temperature: params.config.temperature };
  }

  const response = await fetch(`${GOOGLE_ENDPOINT}/${encodeURIComponent(params.model)}:${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new AiRequestError(await readErrorMessage(response), response.status);
  }
  return response;
}

function dispatch(path: 'generate' | 'stream', params: GenerateParams, signal?: AbortSignal): Promise<Response> {
  const byoKey = getByoGeminiKey();
  return byoKey ? callGoogle(path, params, byoKey, signal) : callProxy(path, params, signal);
}

/** Parses an SSE stream into successive text chunks. */
async function* iterateSseText(body: ReadableStream<Uint8Array>): AsyncGenerator<GenerateResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');

      for (const line of rawEvent.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const text = extractText(JSON.parse(payload));
          if (text) yield { text };
        } catch (error) {
          if (error instanceof AiRequestError) throw error;
          // Partial/invalid JSON in a keep-alive frame: ignore and continue.
        }
      }
    }
  }
}

const models = {
  async generateContent(params: GenerateParams): Promise<GenerateResult> {
    const response = await dispatch('generate', params);
    return { text: extractText(await response.json()) };
  },

  async generateContentStream(params: GenerateParams): Promise<AsyncGenerator<GenerateResult>> {
    const response = await dispatch('stream', params);
    if (!response.body) throw new AiRequestError('Empty stream from model.', 502);
    return iterateSseText(response.body);
  },
};

export const aiClient = { models };
export type AiClient = typeof aiClient;

/** Mirrors the old `getAI()` signature so existing call sites keep working. */
export function getAI(): AiClient {
  return aiClient;
}
