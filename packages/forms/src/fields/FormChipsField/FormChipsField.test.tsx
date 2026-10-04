import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormChipsField } from '#fields/FormChipsField'
import { fieldsetDescribedByTarget, runFieldConformance, tabOutOfGroup } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const interests: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Hiking' },
  { value: 2, label: 'Cooking' },
  { value: 3, label: 'Photography' },
]

const labelOf = (value: number) => interests.find((i) => i.value === value)?.label ?? ''
const shownLabels = (values: readonly number[]) => values.map(labelOf).join(', ')

const setPressed = async (user: UserEvent, control: HTMLElement, values: readonly number[]) => {
  for (const interest of interests) {
    const chip = within(control).getByRole('button', { name: interest.label })
    const shouldBePressed = values.includes(interest.value)
    const isPressed = chip.getAttribute('aria-pressed') === 'true'
    if (isPressed !== shouldBePressed) await user.click(chip)
  }
}

const displayPressed = (control: HTMLElement) =>
  within(control)
    .getAllByRole('button')
    .filter((chip) => chip.getAttribute('aria-pressed') === 'true')
    .map((chip) => chip.textContent)
    .join(', ')

// `ChipGroup` (multiple) has no single tab stop (every chip is independently focusable, unlike
// Radio's roving-tabindex) and its error lives on the fieldset, not the group `<div>`:
// `leaveControl` tabs past every chip to actually leave the group, `describedByTarget` points
// `blur` at the fieldset, `focusTarget` points the focus checks at the first chip, and
// `isDisabled` asserts on every one. Chips are `role="button"` (same as the conformance
// harness's own Save button), so these scope to the fieldset rather than the whole container.
const chips = (container: HTMLElement) =>
  within(fieldsetDescribedByTarget(container)).getAllByRole('button')
const focusTarget = (container: HTMLElement) => must(chips(container)[0])
const isDisabled = (container: HTMLElement) => {
  for (const chip of chips(container)) expect(chip).toBeDisabled()
}

runFieldConformance<readonly number[]>('chips (number options)', {
  build: (props) => <FormChipsField {...props} options={interests} />,
  valid: [1],
  invalid: [],
  interact: setPressed,
  display: displayPressed,
  shown: shownLabels,
  viewText: 'Hiking',
  leaveControl: tabOutOfGroup,
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

describe('FormChipsField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="interests">
            {() => <FormChipsField label="Interests" options={interests} />}
          </AppField>
        )
      },
      { defaultValues: { interests: [] as number[] } },
    )
    await user.click(screen.getByRole('button', { name: 'Photography' }))
    expect(form.state.values.interests).toEqual([3])
  })

  it('renders chosen labels in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="interests">
            {() => <FormChipsField label="Interests" options={interests} />}
          </AppField>
        )
      },
      { defaultValues: { interests: [2] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Cooking')).toBeInTheDocument()
  })
})
