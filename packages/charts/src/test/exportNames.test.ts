import * as ui from '@mitcsutt/kiln-ui'

import * as charts from '#index'

/** No export shares a name with a kiln-ui export, so an editor can't auto-import the wrong one. */
describe('export names', () => {
  it("don't clash with kiln-ui's", () => {
    const clashes = Object.keys(charts).filter((name) => name in ui)
    expect(clashes).toEqual([])
  })
})
