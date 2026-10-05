import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  FieldPresentation,
  mergePresentation,
  useFieldPresentation,
} from '#components/fields/FieldPresentation'

function Probe() {
  const p = useFieldPresentation()
  return (
    <output>
      {JSON.stringify({
        layout: p.layout,
        disabled: p.disabled,
        readOnly: p.readOnly,
        mode: p.mode,
      })}
    </output>
  )
}

describe('FieldPresentation', () => {
  it('merges with the parent: inner wins, disabled/readOnly only add', () => {
    render(
      <FieldPresentation layout="horizontal" disabled readOnly>
        <FieldPresentation layout="inline" disabled={false} readOnly={false} mode="view">
          <Probe />
        </FieldPresentation>
      </FieldPresentation>,
    )
    expect(JSON.parse(screen.getByRole('status').textContent)).toEqual({
      layout: 'inline',
      disabled: true,
      readOnly: true,
      mode: 'view',
    })
  })

  it('mergePresentation ignores undefined values', () => {
    expect(mergePresentation({ layout: 'horizontal' }, { layout: undefined })).toEqual({
      layout: 'horizontal',
    })
  })
})
