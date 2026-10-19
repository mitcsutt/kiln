import type { ReactNode } from 'react'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormDateRangeField } from '#components/fields/FormDateRangeField'
import { defaultFields } from '#components/fields/defaultFields'
import { kit } from '#kit/defaultKit'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { fieldsetDescribedByTarget, runFieldConformance, tabOutOfGroup } from '#test/conformance'
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

/** The first part of one end in the calendar picker: `Start date` or `End date`. */
const endPart = (end: string, name = 'Day') =>
  within(screen.getByRole('group', { name: end })).getByRole('spinbutton', { name })

runFieldConformance<{ start: string; end: string }>('dateRange (calendar picker)', {
  build: (props) => <FormDateRangeField {...props} picker="calendar" />,
  valid: { start: '2026-01-01', end: '2026-01-10' },
  invalid: { start: '', end: '' },
  control: () => endPart('Start date'),
  interact: async (user, _control, value) => {
    for (const [end, text] of [
      ['Start date', value.start],
      ['End date', value.end],
    ] as const) {
      if (text === '') {
        await user.click(endPart(end))
        await user.keyboard('{Backspace}')
      } else fireEvent.paste(endPart(end), { clipboardData: { getData: () => text } })
    }
  },
  display: () =>
    [...document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')]
      .map((input) => input.value)
      .join('|'),
  shown: (value) => `${value.start}|${value.end}`,
  viewText: /2026/,
  leaveControl: async (user, container) => {
    await tabOutOfGroup(user, must(container.querySelector('fieldset')))
  },
  describedByTarget: fieldsetDescribedByTarget,
  isDisabled: () => {
    for (const part of screen.getAllByRole('spinbutton'))
      expect(part).toHaveAttribute('aria-disabled', 'true')
  },
  // Like the native picker, it submits `name.start`/`name.end`; the test below checks them.
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

  it('picks the range from one calendar and submits both ends', async () => {
    const { form, user, container } = renderForm(
      (f) => (
        <f.AppField name="trip">
          {() => (
            <FormDateRangeField
              label="Trip dates"
              picker="calendar"
              min="2026-10-01"
              max="2026-11-30"
            />
          )}
        </f.AppField>
      ),
      { defaultValues: { trip: { start: '', end: '' } } },
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    await user.click(within(dialog).getByRole('gridcell', { name: /\b4 October 2026/ }))
    await user.click(within(dialog).getByRole('gridcell', { name: /\b11 October 2026/ }))
    await waitFor(() => {
      expect(form.state.values.trip).toEqual({ start: '2026-10-04', end: '2026-10-11' })
    })
    const data = new FormData(must(container.querySelector('form')))
    expect(data.get('trip.start')).toBe('2026-10-04')
    expect(data.get('trip.end')).toBe('2026-10-11')
  })

  it('reads an end with a time as a date and time in view mode', () => {
    renderForm(
      (f) => (
        <f.AppField name="window">
          {() => (
            <FormDateRangeField label="Maintenance window" granularity="minute" locale="en-GB" />
          )}
        </f.AppField>
      ),
      {
        defaultValues: { window: { start: '2026-10-08T22:00', end: '2026-10-09T02:30' } },
        formProps: { mode: 'view' },
      },
    )
    expect(screen.queryByText(/T22:00/)).not.toBeInTheDocument()
    expect(screen.getByText(/8 Oct 2026.*–.*9 Oct 2026/)).toBeInTheDocument()
  })

  it('reads instants on the field’s time zone in view mode', () => {
    renderForm(
      (f) => (
        <f.AppField name="window">
          {() => (
            <FormDateRangeField
              label="Maintenance window"
              granularity="minute"
              timeZone="Australia/Perth"
              locale="en-GB"
            />
          )}
        </f.AppField>
      ),
      {
        // 22:00 UTC on the 8th is 06:00 on the 9th in Perth (UTC+8).
        defaultValues: { window: { start: '2026-10-08T22:00:00Z', end: '2026-10-09T02:30:00Z' } },
        formProps: { mode: 'view' },
      },
    )
    const text = must(screen.getByText(/9 Oct 2026/).textContent)
    expect(text).not.toMatch(/8 Oct/)
    expect(text).toMatch(/6:00|06:00/)
    expect(text).toMatch(/10:30/)
  })

  it('renders the calendar picker and presets from a schema', async () => {
    const schema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'dateRange',
            name: 'period',
            label: 'Report period',
            picker: 'calendar',
            presets: [{ label: 'September', value: { start: '2026-09-01', end: '2026-09-30' } }],
          },
        ],
      },
    } as const
    expect(parseFormSchema(schema, { kinds: defaultFields }).ok).toBe(true)
    const { form, user } = renderForm((f) => <kit.SchemaForm form={f} schema={schema} />, {
      defaultValues: { period: { start: '', end: '' } },
    })
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    await user.click(await screen.findByRole('button', { name: 'September' }))
    await waitFor(() => {
      expect(form.state.values.period).toEqual({ start: '2026-09-01', end: '2026-09-30' })
    })
    expect(endPart('End date')).toHaveTextContent('30')
  })
})

describe('FormDateRangeField view locale', () => {
  const view = (field: ReactNode, value: { start: string; end: string }) =>
    renderForm((f) => <f.AppField name="trip">{() => field}</f.AppField>, {
      defaultValues: { trip: value },
      formProps: { mode: 'view' },
    })

  it('reads dates in the field’s locale when it sets one', () => {
    view(<FormDateRangeField label="Trip" picker="calendar" locale="de-DE" />, {
      start: '2026-10-03',
      end: '2026-10-10',
    })
    expect(screen.getByText('03.10.2026 – 10.10.2026')).toBeInTheDocument()
  })

  it('reads times in the field’s locale and on its clock when it sets them', () => {
    view(
      <FormDateRangeField
        label="Trip"
        granularity="minute"
        locale="de-DE"
        hourCycle={12}
        timeZone="UTC"
      />,
      { start: '2026-10-03T14:30:00Z', end: '2026-10-03T16:00:00Z' },
    )
    expect(
      screen.getByText(/^03\.10\.2026, 0?2:30\sPM – 03\.10\.2026, 0?4:00\sPM$/),
    ).toBeInTheDocument()
  })

  it('reads dates and times in the device’s locale and clock without them', () => {
    view(<FormDateRangeField label="Trip" granularity="minute" timeZone="UTC" />, {
      start: '2026-10-03',
      end: '2026-10-03T16:00:00Z',
    })
    const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
    const time = new Intl.DateTimeFormat(undefined, { timeStyle: 'short', timeZone: 'UTC' })
    const day = date.format(new Date(Date.UTC(2026, 9, 3)))
    const expected = `${day} – ${day}, ${time.format(new Date(Date.UTC(1970, 0, 1, 16)))}`
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
