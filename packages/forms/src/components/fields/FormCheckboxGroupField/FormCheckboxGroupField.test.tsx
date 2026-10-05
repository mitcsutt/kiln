import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormCheckboxGroupField } from '#components/fields/FormCheckboxGroupField'
import { fieldsetDescribedByTarget, runFieldConformance, tabOutOfGroup } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const topics: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'New comments' },
  { value: 2, label: 'Mentions' },
  { value: 3, label: 'Weekly digest' },
]

const labelOf = (value: number) => topics.find((t) => t.value === value)?.label ?? ''
const shownLabels = (values: readonly number[]) => values.map(labelOf).join(', ')

const setChecked = async (user: UserEvent, control: HTMLElement, values: readonly number[]) => {
  for (const topic of topics) {
    const checkbox = within(control).getByRole('checkbox', { name: topic.label })
    const shouldBeChecked = values.includes(topic.value)
    if (checkbox.getAttribute('aria-checked') !== String(shouldBeChecked)) {
      const isChecked =
        checkbox instanceof HTMLInputElement
          ? checkbox.checked
          : checkbox.getAttribute('aria-checked') === 'true'
      if (isChecked !== shouldBeChecked) await user.click(checkbox)
    }
  }
}

const displayChecked = (control: HTMLElement) =>
  within(control)
    .getAllByRole('checkbox')
    .filter(
      (checkbox) =>
        (checkbox as HTMLInputElement).checked || checkbox.getAttribute('aria-checked') === 'true',
    )
    .map(
      (checkbox) =>
        checkbox.getAttribute('aria-label') ??
        document.querySelector(`label[for="${checkbox.id}"]`)?.textContent,
    )
    .join(', ')

// `CheckboxGroup` has no single tab stop (every box is independently focusable, unlike Radio's
// roving-tabindex) and its error lives on the fieldset, not the group `<div>`: `leaveControl`
// tabs past every box to actually leave the group, `describedByTarget` points `blur` at the
// fieldset, `focusTarget` points the focus checks at the first box, and `isDisabled` asserts on
// every one.
const focusTarget = (container: HTMLElement) => must(within(container).getAllByRole('checkbox')[0])
const isDisabled = (container: HTMLElement) => {
  for (const checkbox of within(container).getAllByRole('checkbox')) expect(checkbox).toBeDisabled()
}

runFieldConformance<readonly number[]>('checkboxGroup (number options)', {
  build: (props) => <FormCheckboxGroupField {...props} options={topics} />,
  valid: [1, 2],
  invalid: [],
  interact: setChecked,
  display: displayChecked,
  shown: shownLabels,
  viewText: 'New comments',
  leaveControl: tabOutOfGroup,
  describedByTarget: fieldsetDescribedByTarget,
  focusTarget,
  isDisabled,
})

describe('FormCheckboxGroupField', () => {
  it('keeps the option value type (no string coercion)', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="notify">
            {() => <FormCheckboxGroupField label="Notify me about" options={topics} />}
          </AppField>
        )
      },
      { defaultValues: { notify: [] as number[] } },
    )
    await user.click(screen.getByRole('checkbox', { name: 'New comments' }))
    await user.click(screen.getByRole('checkbox', { name: 'Weekly digest' }))
    expect(form.state.values.notify).toEqual([1, 3])
  })

  it('renders chosen labels in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="notify">
            {() => <FormCheckboxGroupField label="Notify me about" options={topics} />}
          </AppField>
        )
      },
      { defaultValues: { notify: [2, 3] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Mentions')).toBeInTheDocument()
    expect(screen.getByText('Weekly digest')).toBeInTheDocument()
  })
})
