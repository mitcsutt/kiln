import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // kiln-ui's `theme-script` entry points Node at kiln-ui's dist/ (ADR 0023), which the tests
      // don't build. Inside the workspace it resolves the source, like every other kiln-ui entry.
      '@mitcsutt/kiln-ui/theme-script': fileURLToPath(
        new URL('../ui/src/theme/script.ts', import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
