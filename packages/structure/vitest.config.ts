import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The fixture apps hold test files of their own, which are lint input, not tests.
    include: ['test/*.test.ts'],
  },
})
