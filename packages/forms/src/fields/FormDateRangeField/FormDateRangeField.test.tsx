import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormDateRangeField } from '#fields/FormDateRangeField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

runFieldConformance<{ start: string; end: string }>('dateRange', {
  build: (props) => <FormDateRangeField {...props} />,
  valid: { start: '2026-01-01', end: '2026-01-10' },
  invalid: { start: '', end: '' },
  // Both native date inputs sit under one legend; the suite's single `label` only names the
  // group (the legend), not either input, so each check targets "Start date" directly.
  control: () => screen.getByLabelText('Start date'),
  interact: (_user, _control, value) => {
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: value.start } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: value.end } })
  },
  display: () =>
    `${screen.getByLabelText<HTMLInputElement>('Start date').value}|${screen.getByLabelText<HTMLInputElement>('End date').value}`,
  shown: (value) => `${value.start}|${value.end}`,
  viewText: /2026/,
  // Blur fires on the whole fieldset, not when tabbing between its own two inputs — one Tab
  // from "Start date" only reaches "End date" (still inside the group), so a second Tab is
  // what actually leaves it. `aria-describedby` for the error is wired to the fieldset too.
  leaveControl: async (user) => {
    await user.tab()
    await user.tab()
  },
  describedByTarget: (container) => within(container).getByRole('group'),
  // `formData`'s native keys are `name.start`/`name.end`, never the bare path name — see the
  // dedicated test below for the equivalent check.
  skip: ['formData'],
})

// These bind through the canonical `form.AppField` path — the same binding the typed
// `f.DateRangeField` shorthand uses.
describe('FormDateRangeField', () => {
  it('binds through the canonical field path', () => {
    const { form } = renderForm(
      (f) => <f.AppField name="trip">{() => <FormDateRangeField label="Trip dates" />}</f.AppField>,
      { defaultValues: { trip: { start: '', end: '' } } },
    )
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-06-01' } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-06-08' } })
    expect(form.state.values.trip).toEqual({ start: '2026-06-01', end: '2026-06-08' })
  })

  it('submits both parts under `name.start` / `name.end`', () => {
    const { container } = renderForm(
      (f) => <f.AppField name="trip">{() => <FormDateRangeField label="Trip dates" />}</f.AppField>,
      { defaultValues: { trip: { start: '2026-06-01', end: '2026-06-08' } } },
    )
    const formElement = container.querySelector('form')
    const data = new FormData(must(formElement))
    expect(data.get('trip.start')).toBe('2026-06-01')
    expect(data.get('trip.end')).toBe('2026-06-08')
  })

  it('renders the formatted range in view mode, and nothing when empty', () => {
    renderForm(
      (f) => <f.AppField name="trip">{() => <FormDateRangeField label="Trip dates" />}</f.AppField>,
      {
        defaultValues: { trip: { start: '2026-06-01', end: '2026-06-08' } },
        formProps: { mode: 'view' },
      },
    )
    expect(screen.getByText(/2026/)).toBeInTheDocument()

    renderForm(
      (f) => <f.AppField name="trip">{() => <FormDateRangeField label="Other trip" />}</f.AppField>,
      { defaultValues: { trip: { start: '', end: '' } }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
