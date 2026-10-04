/**
 * Parity stories render a component-mode and a schema-mode `<form>` side by side. Each landmark
 * needs its own accessible name, or axe's `landmark-unique` rule fails, so `defineParity` labels the
 * two sides apart (`${name} (component mode)` / `(schema mode)`) and no story switches the rule
 * off.
 */
import axe from 'axe-core'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { parityFixtures } from '#stories/fixtures'

describe('parity pairs have unique form landmarks', () => {
  it('the component-mode and schema-mode forms of a fixture have different accessible names', async () => {
    const fixture = parityFixtures[0]
    if (!fixture) throw new Error('no parity fixtures')
    const { ComponentMode, SchemaMode } = fixture
    const { container } = render(
      <>
        <ComponentMode />
        <SchemaMode />
      </>,
    )
    const results = await axe.run(container, { runOnly: ['landmark-unique'] })
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
})
