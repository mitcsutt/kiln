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
          // Story files share one page per worker instead of a fresh one each. Storybook
          // unmounts the previous story before mounting the next, across files as within
          // them, and the per-file page startup was most of the run (ADR 0027).
          isolate: false,
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
