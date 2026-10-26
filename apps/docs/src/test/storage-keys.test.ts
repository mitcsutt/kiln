import { docsThemeScript, MODE_STORAGE_KEY, THEME_STORAGE_KEY } from '@/lib/theme'
import { variantStorageKey } from '@/lib/variants'

// ADR 0045: the keys a reader's saved choices live under never change. A changed key resets
// every reader's choice, and a rollback can't bring it back. Renames leave these strings alone,
// along with `kiln-docs`, the name of the Worker that serves the site (wrangler.jsonc).
describe("the reader's saved state", () => {
  it('keeps the theme and colour mode keys', () => {
    expect(THEME_STORAGE_KEY).toBe('kiln-docs-theme')
    expect(MODE_STORAGE_KEY).toBe('kiln-color-mode')
    expect(docsThemeScript).toContain('localStorage.getItem("kiln-docs-theme")')
    expect(docsThemeScript).toContain('localStorage.getItem("kiln-color-mode")')
  })

  it('keeps the variant keys', () => {
    expect(variantStorageKey('router')).toBe('kiln-docs-variant-router')
    expect(variantStorageKey('data')).toBe('kiln-docs-variant-data')
  })
})
