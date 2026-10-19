import { fireEvent, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { tabOutOfGroup, type ConformanceOptions } from '#test/conformance'
import { must } from '#test/must'

/** The bound picker's box: the `role="group"` that carries `data-field` and its hidden input. */
export function pickerBox(container: HTMLElement): HTMLElement {
  return must(container.querySelector<HTMLElement>('[role="group"][data-field]'))
}

/**
 * `runFieldConformance` options for a field rendered as a kiln-ui date or time picker, a group of
 * `role="spinbutton"` parts: `first` names the first part (`'Day'`, `'Hour'`), which takes the
 * field's id and focus. The value is read from the picker's hidden input, typed by pasting it
 * into the first part, and cleared with Backspace there.
 */
export function pickerConformance(
  first: string,
): Pick<
  ConformanceOptions<string>,
  'control' | 'display' | 'interact' | 'leaveControl' | 'describedByTarget' | 'isDisabled'
> {
  return {
    control: (container) => within(pickerBox(container)).getByRole('spinbutton', { name: first }),
    display: (control) =>
      must(control.closest('[data-field]')?.querySelector<HTMLInputElement>('input[type="hidden"]'))
        .value,
    interact: async (user: UserEvent, control, value) => {
      if (value === '') {
        await user.click(control)
        await user.keyboard('{Backspace}')
      } else fireEvent.paste(control, { clipboardData: { getData: () => value } })
    },
    // Every part, and the calendar and clear buttons, is its own tab stop.
    leaveControl: async (user, container) => {
      await tabOutOfGroup(user, pickerBox(container))
    },
    describedByTarget: pickerBox,
    isDisabled: (container) => {
      for (const part of within(pickerBox(container)).getAllByRole('spinbutton'))
        expect(part).toHaveAttribute('aria-disabled', 'true')
    },
  }
}
