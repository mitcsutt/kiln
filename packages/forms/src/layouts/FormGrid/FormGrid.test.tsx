import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'
import { FormGrid } from './FormGrid'

describe('FormGrid', () => {
  it('lays fields out in a grid with spanning items and no extra semantics', () => {
    const { container } = renderForm(
      (f) => (
        <FormGrid columns={{ base: 1, md: 3 }}>
          <f.TextField name="first" label="First name" />
          <FormGrid.Item span={2}>
            <f.TextField name="last" label="Last name" />
          </FormGrid.Item>
        </FormGrid>
      ),
      { defaultValues: { first: '', last: '' } },
    )
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(container.querySelector('fieldset, section')).toBeNull()
  })
})
