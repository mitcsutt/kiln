import { THEMES } from '@mitcsutt/kiln-ui'
import { KILN_UI_THEMES } from './themes.ts'

describe("kiln-ui's themes", () => {
  it("are the ones kiln-ui's THEMES lists", () => {
    expect(KILN_UI_THEMES).toEqual(THEMES)
  })
})
