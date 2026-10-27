import { MODE_STORAGE_KEY, THEME_STORAGE_KEY, variantStorageKey } from './storage.ts'

// ADR 0046: the keys a reader's saved choices live under never change. A changed key resets
// every reader's choice, and a rollback can't bring it back.
describe("the reader's saved state", () => {
  it('keeps the theme and colour mode keys', () => {
    expect(THEME_STORAGE_KEY).toBe('kiln-docs-theme')
    expect(MODE_STORAGE_KEY).toBe('kiln-color-mode')
  })

  it("keeps Kiln's variant keys", () => {
    expect(variantStorageKey('router')).toBe('kiln-docs-variant-router')
    expect(variantStorageKey('data')).toBe('kiln-docs-variant-data')
  })
})
