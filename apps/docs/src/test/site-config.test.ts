import { THEMES } from '@mitcsutt/kiln-ui'
import config from '../../site.config'

// site.config.ts is Node-loadable (ADR 0045), so it can't import `THEMES` from kiln-ui's root
// entry, which imports CSS. It writes the list out instead, and this keeps the two the same: the
// picker offers exactly kiln-ui's built-in themes, and Harbour is styled but not offered.
describe("Kiln's site config", () => {
  it("offers kiln-ui's built-in themes in the picker, starting on Paper", () => {
    expect(config.theme.picker).toEqual(THEMES)
    expect(config.theme.default).toBe('paper')
  })
})
