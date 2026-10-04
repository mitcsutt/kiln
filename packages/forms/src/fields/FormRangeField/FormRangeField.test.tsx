import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormRangeField } from '#fields/FormRangeField'
import { runFieldConformance, tabOutOfGroup } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const displayRange = (control: HTMLElement): [number, number] => {
  const [min, max] = within(control).getAllByRole('slider')
  return [Number(min?.getAttribute('aria-valuenow')), Number(max?.getAttribute('aria-valuenow'))]
}

// Radix's Home/End keys always target the first/last thumb by index, not "whichever thumb has
// focus" — so stepping is the only reliable way to drive an arbitrary thumb. `step={100}` (full
// range in one key press) keeps this a single `ArrowLeft`/`ArrowRight` per thumb.
const interactRange = async (user: UserEvent, control: HTMLElement, value: [number, number]) => {
  const thumbs = within(control).getAllByRole('slider')
  for (let i = 0; i < thumbs.length; i += 1) {
    const thumb = thumbs[i]
    if (!thumb) continue
    const current = Number(thumb.getAttribute('aria-valuenow'))
    const target = value[i] ?? current
    if (target === current) continue
    thumb.focus()
    await user.keyboard(target > current ? '{ArrowRight}' : '{ArrowLeft}')
  }
}

// The group (role="group") already carries the error's `aria-describedby` directly (`Field`,
// not `Fieldset`), but it has no tabIndex of its own (it's a plain wrapper `<span>`), and Tab
// moves between the two thumbs without leaving the group — `leaveControl` tabs past both.
// After an invalid submit, focus lands on the first focusable descendant (the min thumb, not
// the group) — `focusTarget` points there. Each thumb is a `<span>`, which `toBeDisabled()`
// never matches (see FormSliderField's test) — `isDisabled` checks both drop out of the tab order.
const focusTarget = (container: HTMLElement) => must(within(container).getAllByRole('slider')[0])
const isDisabled = (container: HTMLElement) => {
  for (const thumb of within(container).getAllByRole('slider'))
    expect(thumb).not.toHaveAttribute('tabindex')
}

runFieldConformance<[number, number]>('range', {
  build: (props) => <FormRangeField {...props} min={0} max={100} step={100} />,
  valid: [0, 100],
  invalid: [0, 0],
  interact: interactRange,
  display: displayRange,
  shown: (value) => value,
  viewText: '0',
  leaveControl: tabOutOfGroup,
  focusTarget,
  isDisabled,
})

describe('FormRangeField', () => {
  it('emits a tuple', async () => {
    const { form, user } = renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="price">
            {() => <FormRangeField label="Price range" min={0} max={100} />}
          </AppField>
        )
      },
      { defaultValues: { price: [0, 100] as [number, number] } },
    )
    const [min] = screen.getAllByRole('slider')
    min?.focus()
    await user.keyboard('{ArrowRight}')
    expect(form.state.values.price).toEqual([1, 100])
  })

  it('renders both bounds in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="price">
            {() => <FormRangeField label="Price range" min={0} max={5000} />}
          </AppField>
        )
      },
      { defaultValues: { price: [500, 900] }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('900')).toBeInTheDocument()
  })
})
