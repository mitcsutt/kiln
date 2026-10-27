/**
 * Where a reader's saved choices live. These are Kiln's key names, so Kiln's readers keep their
 * choices; storage is per origin, so another site using the same names is harmless. They never
 * change (ADR 0046): a changed key resets every reader's choice, and a rollback can't bring it
 * back. Deriving them from a prefix is ruled out for the same reason, since it would rename the
 * colour mode's key.
 */

/** The theme a reader picked in the header. */
export const THEME_STORAGE_KEY = 'kiln-docs-theme'

/** The colour mode: kiln-ui's own key, so the docs and kiln-ui's `themeScript` agree. */
export const MODE_STORAGE_KEY = 'kiln-color-mode'

/** The value a reader picked for one axis of `<Variant>` blocks: one key per axis (ADR 0038). */
export const variantStorageKey = (axis: string) => `kiln-docs-variant-${axis}`
