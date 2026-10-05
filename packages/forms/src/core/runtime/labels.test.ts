import { readFieldLabel, readLegend, visibleText } from '#core/runtime/labels'
import { must } from '#test/must'

function dom(html: string): HTMLElement {
  document.body.innerHTML = html
  return document.body
}

describe('labels', () => {
  it('visibleText drops aria-hidden marks and collapses whitespace', () => {
    const root = dom('<label id="l">Town <span aria-hidden="true">*</span>\n  name</label>')
    expect(visibleText(must(root.querySelector('#l')))).toBe('Town name')
  })

  it("reads a control's own label: aria-labelledby, then `${id}-label`, then label[for]", () => {
    dom(`
      <span id="a">Postcode</span><input id="c1" aria-labelledby="missing a" data-field="postcode" />
      <span id="c2-label">Street</span><input id="c2" data-field="street" />
      <label for="c3">Town</label><input id="c3" data-field="town" />
    `)
    expect(readFieldLabel(document.getElementById('c1'), 'postcode', 'postcode')).toBe('Postcode')
    expect(readFieldLabel(document.getElementById('c2'), 'street', 'street')).toBe('Street')
    expect(readFieldLabel(document.getElementById('c3'), 'town', 'town')).toBe('Town')
  })

  it("names a group field by its root fieldset's legend, even when the control has a label", () => {
    dom(`
      <fieldset data-field="stay"><legend>Dates of stay</legend>
        <label for="start">Start date</label><input id="start" />
      </fieldset>
    `)
    expect(readFieldLabel(document.getElementById('start'), 'stay', 'stay')).toBe('Dates of stay')
  })

  it('falls back to the enclosing fieldset, then to the path', () => {
    dom(`
      <fieldset><legend>Seat</legend><div role="radiogroup" id="seat" data-field="seat"></div></fieldset>
      <div id="bare" data-field="bare"></div>
    `)
    expect(readFieldLabel(document.getElementById('seat'), 'seat', 'seat')).toBe('Seat')
    expect(readFieldLabel(document.getElementById('bare'), 'bare', 'bare')).toBe('bare')
    expect(readFieldLabel(null, 'gone', 'gone')).toBe('gone')
  })

  it("readLegend reads a group's first legend, or the fallback", () => {
    const root = dom(
      '<fieldset id="g"><legend>Guests <span aria-hidden="true">*</span></legend></fieldset>',
    )
    expect(readLegend(must(root.querySelector<HTMLElement>('#g')), 'guests')).toBe('Guests')
    expect(readLegend(null, 'guests')).toBe('guests')
  })
})
