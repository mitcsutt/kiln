import type { ComponentType, ReactNode } from 'react'
import { act, screen, waitFor, type Matcher } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { evaluate } from '@tanstack/react-form'
import { SubmitButton } from '#components/form/SubmitButton'
import { expectNoAxeViolations } from '#test/a11y'
import { nextFrame } from '#runtime/focus'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

/**
 * `leaveControl` for a group with no single tab stop — every item (checkbox, chip, card, slider
 * thumb) is independently tabbable, unlike a Radix roving-tabindex group where one `Tab` already
 * leaves it. Tabs through `container` until focus lands outside it (capped, so a wiring bug
 * fails the test instead of hanging).
 */
export async function tabOutOfGroup(user: UserEvent, container: HTMLElement): Promise<void> {
  await user.tab()
  for (let guard = 0; guard < 20 && container.contains(document.activeElement); guard += 1)
    await user.tab()
}

/**
 * `describedByTarget` for a `Fieldset`-wrapped control: `Fieldset` renders its own error
 * paragraph and points its own `aria-describedby` at it — that id is never threaded down to the
 * group it wraps (a `RadioGroup`/`CheckboxGroup`/`ChoiceCards` root).
 */
export function fieldsetDescribedByTarget(container: HTMLElement): HTMLElement {
  return container.querySelector('fieldset') ?? container
}

/**
 * The default `control`: the element the label names. A group inside a `Fieldset` is named by
 * the fieldset's legend only (the inner radiogroup/group has no name of its own, so the name is
 * announced once),
 * so when no element is labelled by `label`, fall back to the bound group inside the fieldset
 * whose legend reads `label` (the element carrying `data-field`, else the fieldset itself).
 */
export function defaultControl(container: HTMLElement, label: string): HTMLElement {
  try {
    return screen.getByLabelText(label)
  } catch (error) {
    const legend = [...container.querySelectorAll('fieldset > legend')].find(
      (element) => element.textContent.replace(/\s+/g, ' ').trim() === label,
    )
    const fieldset = legend?.parentElement
    if (!fieldset) throw error
    return fieldset.querySelector<HTMLElement>('[data-field]') ?? fieldset
  }
}

/** The ten checks of §15.1. */
export type ConformanceCheck =
  | 'label'
  | 'blur'
  | 'submit'
  | 'focus'
  | 'reset'
  | 'interactivity'
  | 'formData'
  | 'view'
  | 'warning'
  | 'axe'

/** Props the suite passes to `build` (spread them onto the field). */
export interface ConformanceFieldProps {
  label: string
  disabled?: boolean
  readOnly?: boolean
  /** A warning callback (ignores the value, so it fits every field's `warn`). */
  warn?: () => string | undefined
}

export interface ConformanceOptions<V> {
  /** Renders the field component (it reads the field from context): `(p) => <FormTextField {...p} />`. */
  build: (props: ConformanceFieldProps) => ReactNode
  /** A value the suite's validator accepts. */
  valid: V
  /** A value the suite's validator rejects. */
  invalid: V
  /** Drives the control to `value` like a user would. */
  interact: (user: UserEvent, control: HTMLElement, value: V) => Promise<void> | void
  /** The value the control shows (default: its `value` property). */
  display?: (control: HTMLElement) => unknown
  /** What `display` returns for a value (default `String(value)`). */
  shown?: (value: V) => unknown
  /**
   * Text view mode renders for `valid` (default `String(valid)`). A function is a testing-library
   * matcher, for a display split over several text nodes (ui `Amount`/`Numeral` wrap separators
   * in their own spans).
   */
  viewText?: Matcher
  /** Finds the control (default: by its label). */
  control?: (container: HTMLElement, label: string) => HTMLElement
  /**
   * Moves focus off the control's whole control/group, for `blur` and `warning` (default: a
   * single `user.tab()` from wherever focus currently is). Override for a compound control
   * where one `Tab` only moves *within* it — e.g. an input and its own trailing toggle button,
   * or two inputs under one fieldset — to the sequence that actually leaves it.
   */
  leaveControl?: (user: UserEvent, container: HTMLElement) => Promise<void>
  /**
   * The element whose `aria-describedby` carries the error id, for `blur` (default: the
   * control itself). Override when that wiring lives on a surrounding group instead of the
   * control `blur` otherwise inspects (a fieldset's legend, a one-time-code group's root).
   */
  describedByTarget?: (container: HTMLElement) => HTMLElement
  /**
   * The element that actually receives focus — for `focus` (an invalid submit) and for
   * `interactivity`'s `readOnly` sub-test's "focusable" assertion (default: the control itself).
   * Override for a compound control where focus lands somewhere other than `control()`: a
   * Radix roving-tabindex group redirects a root-level focus to its checked/current item
   * (`within(container).getByRole('radio', { checked: true })`); a group with no roving focus
   * (every item its own tab stop) is focused, after an invalid submit, on its first focusable
   * descendant (`within(container).getAllByRole('checkbox')[0]`).
   */
  focusTarget?: (container: HTMLElement) => HTMLElement
  /**
   * Asserts the control is disabled, for `interactivity`'s `disabled` sub-test (default:
   * `expect(control()).toBeDisabled()`). Override when `control()` isn't itself a form tag
   * `toBeDisabled()` recognises (a `role="radiogroup"`/`"group"` `<div>`, a `role="slider"`
   * `<span>`) — assert against the real focusable descendants instead, e.g.
   * `within(container).getAllByRole('checkbox').forEach((c) => expect(c).toBeDisabled())`, or
   * `expect(within(container).getByRole('slider')).not.toHaveAttribute('tabindex')`.
   */
  isDisabled?: (container: HTMLElement) => void
  /** Checks that don't apply to this field (e.g. a hidden input has no label). */
  skip?: readonly ConformanceCheck[]
}

const LABEL = 'Conformance subject'
const MESSAGE = 'Check this answer'
const WARNING = 'Double-check this one'

type AppFieldLike = ComponentType<{ name: string; validators?: unknown; children: () => ReactNode }>

function defaultDisplay(control: HTMLElement): unknown {
  return (control as HTMLInputElement).value
}

/**
 * The field conformance suite (§15.1): run it for every registered field kind.
 *
 * runFieldConformance('text', { build: (p) => <FormTextField {...p} />, valid: 'Ada', invalid: '',
 *   interact: async (user, el, v) => { await user.clear(el); if (v) await user.type(el, v) } })
 */
export function runFieldConformance<V>(kind: string, options: ConformanceOptions<V>): void {
  const { build, valid, invalid, interact, skip = [] } = options
  const display = options.display ?? defaultDisplay
  const shown = options.shown ?? ((value: V) => String(value))
  const findControl = options.control ?? defaultControl
  const leaveControl =
    options.leaveControl ??
    (async (user: UserEvent) => {
      await user.tab()
    })
  const describedByTarget =
    options.describedByTarget ?? ((container: HTMLElement) => findControl(container, LABEL))
  const focusTarget =
    options.focusTarget ?? ((container: HTMLElement) => findControl(container, LABEL))
  const isDisabled =
    options.isDisabled ??
    ((container: HTMLElement) => {
      expect(findControl(container, LABEL)).toBeDisabled()
    })
  const run = (check: ConformanceCheck, title: string, fn: () => Promise<void> | void) => {
    if (skip.includes(check)) it.skip(`${check}: ${title}`, fn)
    else it(`${check}: ${title}`, fn)
  }

  const validate = ({ value }: { value: unknown }) =>
    evaluate(value, invalid) ? MESSAGE : undefined

  function setup(
    initial: V,
    props: Omit<ConformanceFieldProps, 'label'> = {},
    extra: { mode?: 'edit' | 'view'; onSubmit?: () => void } = {},
  ) {
    const onSubmit = vi.fn(extra.onSubmit)
    const result = renderForm<{ subject: V }>(
      (form) => {
        const AppField = form.AppField as unknown as AppFieldLike
        const field = (
          <AppField name="subject" validators={{ onDynamic: validate }}>
            {() => build({ label: LABEL, ...props })}
          </AppField>
        )
        return (
          <>
            {field}
            {extra.mode === 'view' ? null : <SubmitButton>Save</SubmitButton>}
          </>
        )
      },
      { defaultValues: { subject: initial }, onSubmit, formProps: { mode: extra.mode } },
    )
    const control = () => findControl(result.container, LABEL)
    return { ...result, onSubmit, control }
  }

  describe(`field conformance: ${kind}`, () => {
    run('label', 'the label names the control', () => {
      const { control } = setup(valid)
      expect(control()).toBeInTheDocument()
    })

    run('blur', 'no error before blur; after blur the error shows and is wired', async () => {
      const { control, user, container } = setup(invalid)
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()
      expect(control()).not.toHaveAttribute('aria-invalid', 'true')
      act(() => {
        control().focus()
      })
      await leaveControl(user, container)
      const message = await screen.findByText(MESSAGE)
      expect(control()).toHaveAttribute('aria-invalid', 'true')
      const errorId = message.closest('[id]')?.id
      expect(errorId).toBeTruthy()
      expect(describedByTarget(container).getAttribute('aria-describedby') ?? '').toContain(errorId)
    })

    run('submit', 'the error shows after a submit without a blur', async () => {
      const { user, onSubmit } = setup(invalid)
      await user.click(screen.getByRole('button', { name: 'Save' }))
      expect(await screen.findByText(MESSAGE)).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    run('focus', 'an invalid submit moves focus to the control', async () => {
      const { user, container } = setup(invalid)
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => expect(focusTarget(container)).toHaveFocus())
    })

    run('reset', 'form.reset() restores the default in the DOM', async () => {
      const { user, control, form } = setup(valid)
      await interact(user, control(), invalid)
      await waitFor(() => {
        expect(display(control())).toEqual(shown(invalid))
      })
      act(() => {
        form.reset()
      })
      await waitFor(() => {
        expect(display(control())).toEqual(shown(valid))
      })
    })

    run('interactivity', 'disabled: not focusable, not validated', async () => {
      const { user, container, onSubmit } = setup(invalid, { disabled: true })
      isDisabled(container)
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()
    })

    run('interactivity', 'readOnly: focusable, not editable, not validated', async () => {
      const editable = setup(valid, { readOnly: true })
      act(() => {
        focusTarget(editable.container).focus()
      })
      expect(focusTarget(editable.container)).toHaveFocus()
      try {
        await interact(editable.user, editable.control(), invalid)
      } catch {
        // A read-only control may refuse the edit; the value check below is the test.
      }
      expect(editable.form.state.values.subject).toEqual(valid)
      editable.unmount()

      const { user, onSubmit } = setup(invalid, { readOnly: true })
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()
    })

    run('formData', 'the native name carries the value into FormData', () => {
      const { container } = setup(valid)
      const formElement = container.querySelector('form')
      expect(formElement).not.toBeNull()
      expect(new FormData(must(formElement)).has('subject')).toBe(true)
    })

    run('view', 'view mode renders the display value and no control', () => {
      setup(valid, {}, { mode: 'view' })
      expect(screen.queryByLabelText(LABEL)).not.toBeInTheDocument()
      expect(screen.getByText(options.viewText ?? String(valid))).toBeInTheDocument()
    })

    run('warning', 'a warning shows after blur and does not block submit', async () => {
      const { control, user, container, onSubmit } = setup(valid, { warn: () => WARNING })
      act(() => {
        control().focus()
      })
      await leaveControl(user, container)
      expect(await screen.findByText(WARNING)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
    })

    run('axe', 'no axe violations, valid and invalid', async () => {
      const first = setup(valid)
      await expectNoAxeViolations(first.container)
      first.unmount()
      // The invalid state needs a visible error (fields without one skip `submit`).
      if (skip.includes('submit')) return
      const second = setup(invalid)
      await second.user.click(screen.getByRole('button', { name: 'Save' }))
      await screen.findByText(MESSAGE)
      // An invalid submit focuses the field a frame later (`focusOnInvalidSubmit` ->
      // `nextFrame()` -> `.focus()`), which can trigger a focus-driven `setState` in the
      // control (e.g. NumberInput/AmountInput's own `onFocus`) after this test's synchronous
      // phase. Flush that frame inside `act()` so it settles before axe inspects the DOM.
      await act(async () => {
        await nextFrame()
      })
      await expectNoAxeViolations(second.container)
    })
  })
}
