import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          navigateFallbackDenylist: [/^\/api/, /^\/stream/],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'documents-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 3600,
                },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.pathname.startsWith('/stream'),
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: {
          name: 'Miru Santali Translator',
          short_name: 'Miru',
          description: 'A Santali translation and education app',
          theme_color: '#0891b2',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    // NOTE: no `define` for process.env.GEMINI_API_KEY. Doing that inlined the
    // deployment secret into a public JS asset. The key now lives only in the
    // server process and is reached through the /api/gemini proxy.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('marked') || id.includes('react-markdown')) {
                return 'vendor-markdown';
              }
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      // The app is served by Express (server.ts) with Vite in middlewareMode,
      // so the HMR socket must stay on the same origin/port Express listens on.
      // Without clientPort, Vite advertises its own port, which is not proxied
      // to the user's browser.
      hmr: { clientPort: Number(process.env.PORT) || 3000 },
      // The sandbox proxies the dev server under a per-session preview host
      // (e.g. https://<port>-<id>.e2b.app). Vite 6 rejects unknown Host headers
      // by default, which surfaced as "Blocked request. This host is not allowed."
      // Allow the preview host family plus localhost; operators can extend it.
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.e2b.app',
        '.github.dev',
        ...(process.env.VITE_ALLOWED_HOSTS?.split(',').map(h => h.trim()).filter(Boolean) ?? []),
      ],
    },
  };
});
