/**
 * Fieldset-based group fields honour `layout="horizontal"` (A.5). `FormRows` / `FormAside` set
 * `layout: 'horizontal'` through FieldPresentation. Single-control fields render
 * `Field data-layout="horizontal"`; group fields render a ui `Fieldset`, and must sit label-left
 * too, so a radio group in a label-left form doesn't stack its legend above the options while
 * every other row is label-left.
 */
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormRows } from '#layouts/FormRows'
import { renderForm } from '#test/renderForm'

const plans = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function setup() {
  return renderForm(
    (f) => (
      <FormRows>
        <f.TextField name="name" label="Full name" />
        <f.RadioField name="plan" label="Plan" options={plans} />
        <f.CheckboxGroupField
          name="days"
          label="Days"
          options={[
            { value: 'mon', label: 'Monday' },
            { value: 'tue', label: 'Tuesday' },
          ]}
        />
      </FormRows>
    ),
    { defaultValues: { name: '', plan: 'monthly', days: [] as string[] } },
  )
}

describe('group fields in a horizontal (label-left) layout', () => {
  it('single-control fields render data-layout="horizontal" in FormRows (baseline)', () => {
    setup()
    expect(screen.getByLabelText('Full name').closest('[data-layout]')).toHaveAttribute(
      'data-layout',
      'horizontal',
    )
  })

  it('no stray `layout` attribute reaches the DOM from group fields', () => {
    const { container } = setup()
    expect(container.querySelector('[layout]')).toBeNull()
  })

  it('a FormRadioField in FormRows is laid out horizontally too', () => {
    setup()
    // The fieldset's legend names the group; the radiogroup inside is unnamed (see groupNames.test.tsx).
    const group = screen.getByRole('group', { name: 'Plan' })
    expect(group).toContainElement(screen.getByRole('radiogroup'))
    expect(group.closest('[data-layout="horizontal"]')).not.toBeNull()
  })

  it('a FormCheckboxGroupField in FormRows is laid out horizontally too', () => {
    setup()
    const group = screen.getByRole('group', { name: 'Days' })
    expect(group.closest('[data-layout="horizontal"]')).not.toBeNull()
  })
})
