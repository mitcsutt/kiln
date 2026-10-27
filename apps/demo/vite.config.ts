import { basename } from 'node:path'

import { themeScript } from '@mitcsutt/kiln-ui/theme-script'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Slipcast, the Kiln demo app. It's a static single-page app: hash routing and a relative base,
 * so the same build runs at any path, including `/demo-app/` on the docs site (ADR 0046).
 */
export default defineConfig({
  base: './',
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    {
      // The stored mode lands on <html> before the first paint (kiln-ui's setup guide).
      name: 'kiln-theme-script',
      transformIndexHtml: () => [
        {
          tag: 'script',
          children: themeScript('paper', 'system', { storageKey: 'slipcast:color-mode' }),
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
  css: {
    modules: {
      // The class names the published packages use (vite.library.ts), as in Storybook.
      generateScopedName: (local: string, file: string) =>
        `kiln-${basename(file).replace(/\.module\.css$/, '')}__${local}`,
    },
  },
})
