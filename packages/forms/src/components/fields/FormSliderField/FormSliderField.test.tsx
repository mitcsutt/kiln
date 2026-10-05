import type { ComponentType, ReactNode } from 'react'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormSliderField } from '#components/fields/FormSliderField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

const displayValue = (control: HTMLElement) => Number(control.getAttribute('aria-valuenow'))

const interactSlider = async (user: UserEvent, control: HTMLElement, value: number) => {
  control.focus()
  await user.keyboard(value <= 0 ? '{Home}' : '{End}')
}

// `toBeDisabled()` only recognises native form tags (fieldset, input, select, button,
// textarea…) — a Radix `role="slider"` thumb is a `<span>`, so jest-dom can never report it as
// disabled even though `disabled` correctly removes it from the tab order and ignores input;
// `isDisabled` checks that instead. The thumb is `control()` itself, so `blur`/`focus`/
// `readOnly`'s "focusable" assertion all pass unaided (it carries every aria attribute the
// binding sets).
runFieldConformance<number>('slider', {
  build: (props) => <FormSliderField {...props} min={0} max={100} />,
  valid: 0,
  invalid: 100,
  interact: interactSlider,
  display: displayValue,
  shown: (value) => value,
  isDisabled: (container) => {
    expect(within(container).getByRole('slider')).not.toHaveAttribute('tabindex')
  },
})

describe('FormSliderField', () => {
  it('renders the formatted value in view mode', () => {
    renderForm(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <AppField name="rate">
            {() => (
              <FormSliderField
                label="Volume"
                min={0}
                max={100}
                formatOptions={{ style: 'percent' }}
              />
            )}
          </AppField>
        )
      },
      { defaultValues: { rate: 0.2 }, formProps: { mode: 'view' } },
    )
    const value = screen.getByText('20')
    expect(value.closest('data')).toHaveTextContent('20%')
    expect(value.closest('dl')).not.toBeNull()
  })
})
