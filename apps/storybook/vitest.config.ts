import { join } from 'node:path'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// Every story is a test: it must render, its `play` function (if any) must pass,
// and axe must find no violations (`a11y.test: 'error'` in the preview).
// `tree.test.ts` checks the story titles against the ADR 0010 tree, in Node.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'tree',
          include: ['tree.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: join(import.meta.dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
