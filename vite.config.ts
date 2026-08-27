/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// These two carry an explicit `.ts`, and the modules they import do too. Vite
// loads this config with Node rather than bundling it, and Node will not guess
// an extension - without them the config loader warns on every start and breaks
// outright when the native loader becomes the default.
import { applyPageMetadata } from './src/content/metadata.ts';
import { profile } from './src/content/profile.ts';

/**
 * Fills the `__PAGE_TITLE__` and `__PAGE_DESCRIPTION__` tokens in `index.html`
 * from `src/content/profile.ts`.
 *
 * Doing it here rather than with `document.title` in a component means the name
 * is correct in the HTML that is served: right in the browser tab before any
 * JavaScript runs, and right for the crawlers and link previews that never run
 * any. `index.html` stops being a second place your name is written down.
 */
function pageMetadata(): Plugin {
  return {
    name: 'portfolio-page-metadata',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => applyPageMetadata(html, profile),
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pageMetadata()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
