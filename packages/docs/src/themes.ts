/**
 * kiln-ui's built-in themes, as its `THEMES` lists them. kiln-docs' Node entries import nothing
 * from kiln-ui at runtime (ADR 0045), so they're written out here; `src/themes.test.ts` fails
 * when they differ from `THEMES`.
 */
export const KILN_UI_THEMES = ['paper', 'monograph', 'ledger', 'fiesta', 'flightdeck', 'riso']
