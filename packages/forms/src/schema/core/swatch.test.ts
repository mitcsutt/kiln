import { describe, expect, it } from 'vitest'
import { fieldNodeProps } from '#schema/core/nodes'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { isSchemaSwatch } from '#schema/core/swatch'
import type { UntypedFieldNode } from '#schema/core/types'

const chips = (swatches: unknown[]): UntypedFieldNode => ({
  kind: 'chips',
  name: 'teams',
  label: 'Teams',
  options: swatches.map((swatch, index) => ({
    value: `t${String(index)}`,
    label: `Team ${String(index)}`,
    swatch,
  })),
})

describe('option swatches in a schema', () => {
  it('accepts categorical slots and plain colours', () => {
    for (const swatch of [
      1,
      8,
      '#7c3aed',
      '#fff',
      '#7c3aedcc',
      'teal',
      'rgb(12 34 56)',
      'rgba(12, 34, 56, 0.5)',
      'hsl(210deg 40% 50%)',
      'oklch(62% 0.19 264)',
      'color(display-p3 1 0.5 0)',
    ])
      expect(isSchemaSwatch(swatch), String(swatch)).toBe(true)
  })

  it('rejects anything else a style could do something with', () => {
    for (const swatch of [
      0,
      9,
      2.5,
      true,
      null,
      '',
      '#12',
      'url(https://example.com/pixel.png)',
      'var(--brand)',
      'red; background: url(x)',
      'rgb(calc(1 + 1) 0 0)',
      'oklch(62% 0.19 264) url(x)',
      '"red"',
      `rgb(${'1 '.repeat(60)})`,
    ])
      expect(isSchemaSwatch(swatch), String(swatch)).toBe(false)
  })

  it('parseFormSchema reports a bad swatch at its path', () => {
    const result = parseFormSchema(
      { version: 1, root: chips([3, 'url(https://example.com/pixel.png)']) },
      { kinds: ['chips'] },
    )
    expect(result.ok).toBe(false)
    expect(!result.ok && result.issues).toEqual([
      {
        path: 'root.options[1].swatch',
        message: 'Expected a categorical slot 1 to 8, or a plain CSS colour',
      },
    ])
    expect(
      parseFormSchema({ version: 1, root: chips([3, '#7c3aed']) }, { kinds: ['chips'] }).ok,
    ).toBe(true)
  })

  it('the renderer drops a swatch the parser would reject, and keeps the option', () => {
    expect(fieldNodeProps(chips([2, 'var(--brand)'])).options).toEqual([
      { value: 't0', label: 'Team 0', swatch: 2 },
      { value: 't1', label: 'Team 1' },
    ])
  })
})
