import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormSegmentedField } from '#components/fields/FormSegmentedField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const periods: { value: 1 | 3 | 12; label: string }[] = [
  { value: 1, label: 'Monthly' },
  { value: 3, label: 'Quarterly' },
  { value: 12, label: 'Yearly' },
]

const labelOf = (value: unknown) => periods.find((p) => p.value === value)?.label ?? ''

const displayRadio = (control: HTMLElement) => {
  const checked = within(control).queryByRole('radio', { checked: true })
  return checked?.textContent
}

// `FormSegmentedField` wraps in `Field` (not `Fieldset`), which wires `aria-describedby` onto the
// control itself, so `blur` passes unaided. It's still a Radix roving-tabindex group, so
// `focusTarget`/`isDisabled` point at the current segment / every segment, same as FormRadioField.
const focusTarget = (container: HTMLElement) =>
  within(container).queryByRole('radio', { checked: true }) ??
  must(within(container).getAllByRole('radio')[0])
const isDisabled = (container: HTMLElement) => {
  for (const radio of within(container).getAllByRole('radio')) expect(radio).toBeDisabled()
}

runFieldConformance<number | null>('segmented (number options)', {
  build: (props) => <FormSegmentedField {...props} options={periods} />,
  valid: 3,
  invalid: 12,
  interact: async (user, control, value) => {
    await user.click(within(control).getByRole('radio', { name: labelOf(value) }))
  },
  display: displayRadio,
  shown: labelOf,
  viewText: 'Quarterly',
  focusTarget,
  isDisabled,
})

describe('FormSegmentedField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="period">
            {() => <FormSegmentedField label="Period" options={periods} />}
          </AppField>
        )
      },
      { defaultValues: { period: 1 } },
    )
    await user.click(screen.getByRole('radio', { name: 'Yearly' }))
    expect(form.state.values.period).toBe(12)
  })

  it('renders the option label in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="period">
            {() => <FormSegmentedField label="Period" options={periods} />}
          </AppField>
        )
      },
      { defaultValues: { period: 12 }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Yearly')).toBeInTheDocument()
    expect(screen.getByText('Yearly').closest('dl')).not.toBeNull()
  })
})
