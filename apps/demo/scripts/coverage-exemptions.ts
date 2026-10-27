/**
 * Exports the demo doesn't have to import, each with the reason. Keep this short: an exemption is
 * for an export an app never imports by name, not for one that's awkward to fit in. The coverage
 * check fails when an exempt export is used or removed, so this list can't go stale.
 */
export type Entry =
  | '@mitcsutt/kiln-ui'
  | '@mitcsutt/kiln-ui/highlight'
  | '@mitcsutt/kiln-forms'
  | '@mitcsutt/kiln-forms/dnd'
  | '@mitcsutt/kiln-dnd'
  | '@mitcsutt/kiln-charts'

export const EXEMPT: Partial<Record<Entry, Record<string, string>>> = {}
