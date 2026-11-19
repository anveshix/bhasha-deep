import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { aiClient, AiRequestError } from './aiClient';
import { BYO_KEY_STORAGE } from './hostedKeys';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const params = { model: 'gemini-2.5-flash', contents: 'hello' };

describe('aiClient routing', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('uses the server proxy when no personal key is present', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ candidates: [{ content: { parts: [{ text: 'hi' }] } }] }));
    vi.stubGlobal('fetch', fetchSpy);

    const result = await aiClient.models.generateContent(params);

    expect(result.text).toBe('hi');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/gemini');
  });

  it('never sends a deployment key from the browser', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ candidates: [] }));
    vi.stubGlobal('fetch', fetchSpy);

    await aiClient.models.generateContent(params);

    const init = fetchSpy.mock.calls[0][1];
    expect(JSON.stringify(init)).not.toContain('x-goog-api-key');
    expect(JSON.stringify(init)).not.toContain('AIza');
  });

  it('calls Google directly when the user supplied their own key', async () => {
    sessionStorage.setItem(BYO_KEY_STORAGE, 'AIza' + 'a'.repeat(35));
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }));
    vi.stubGlobal('fetch', fetchSpy);

    const result = await aiClient.models.generateContent(params);

    expect(result.text).toBe('ok');
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect(init.headers['x-goog-api-key']).toContain('AIza');
  });

  it('surfaces HTTP status so the 429 backoff can work', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'rate limited' }, 429)));

    await expect(aiClient.models.generateContent(params)).rejects.toMatchObject({
      name: 'AiRequestError',
      status: 429,
    });
  });

  it('parses an SSE stream into text chunks', async () => {
    const sse = [
      'data: {"candidates":[{"content":{"parts":[{"text":"जोहार"}]}}]}',
      '',
      'data: {"candidates":[{"content":{"parts":[{"text":"!"}]}}]}',
      '',
      '',
    ].join('\n');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(sse, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })),
    );

    const stream = await aiClient.models.generateContentStream(params);
    let text = '';
    for await (const chunk of stream) text += chunk.text;

    expect(text).toBe('जोहार!');
  });

  it('falls back from session storage when a legacy localStorage key exists', async () => {
    // Old builds wrote the key to localStorage; it must no longer be used.
    localStorage.setItem('custom_gemini_key', 'AIza' + 'b'.repeat(35));
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ candidates: [] }));
    vi.stubGlobal('fetch', fetchSpy);

    await aiClient.models.generateContent(params);

    expect(fetchSpy.mock.calls[0][0]).toBe('/api/gemini');
    localStorage.clear();
  });

  it('exposes a numeric status on errors', () => {
    const error = new AiRequestError('nope', 502);
    expect(error.status).toBe(502);
    expect(error).toBeInstanceOf(Error);
  });
});
