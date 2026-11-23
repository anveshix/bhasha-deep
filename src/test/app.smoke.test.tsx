import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// jsdom lacks these browser APIs the app touches on mount.
beforeAll(() => {
  (window as any).matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  (window as any).scrollIntoView = () => {};
  class FakeWS { onopen: any; onclose: any; onerror: any; onmessage: any; close() { this.onclose?.(); } constructor(_u: string) {} }
  (window as any).WebSocket = FakeWS;
});

describe('App smoke', () => {
  it('mounts and renders the translator shell', async () => {
    const { default: App } = await import('../App');
    render(React.createElement(App));
    // Header title from index.html/App.
    expect(await screen.findByText('भाषा दीप')).toBeTruthy();
  }, 20000);

  it('does not read a legacy local key', async () => {
    const { getByoGeminiKey } = await import('../lib/hostedKeys');
    localStorage.setItem('custom_gemini_key', 'AIza' + 'z'.repeat(35));
    expect(getByoGeminiKey()).toBe('');
  });
});
