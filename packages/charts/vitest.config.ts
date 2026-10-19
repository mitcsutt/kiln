import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    env: { KILN_REACT_MAJOR: '19' },
    // CI runs every package's tests at once on a 2-core runner: keep the jsdom chart renders
    // from starving the other packages' suites.
    maxWorkers: 2,
  },
})
