import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'
import { FormAside } from './FormAside'

describe('FormAside', () => {
  it('is a section labelled by its heading, with the fields in a group named the same', () => {
    renderForm(
      (f) => (
        <FormAside
          title="Notifications"
          description="Choose what we email you about."
          headingLevel={2}
        >
          <f.CheckboxField name="weekly" label="Weekly summary" />
        </FormAside>
      ),
      { defaultValues: { weekly: false } },
    )
    expect(screen.getByRole('region', { name: 'Notifications' }).tagName).toBe('SECTION')
    expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument()
    const group = screen.getByRole('group', { name: 'Notifications' })
    expect(group).toContainElement(screen.getByLabelText('Weekly summary'))
    expect(screen.getByText('Choose what we email you about.')).toBeInTheDocument()
  })
})
