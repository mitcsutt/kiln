import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { FormDateField } from '#components/fields/FormDateField'
import { defaultFields } from '#components/fields/defaultFields'
import { kit } from '#kit/defaultKit'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { runFieldConformance } from '#test/conformance'
import { pickerBox, pickerConformance } from '#test/pickers'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('date', {
  build: (props) => <FormDateField {...props} />,
  valid: '2026-06-11',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /2026/,
})

runFieldConformance<string>('date (calendar picker)', {
  build: (props) => <FormDateField {...props} picker="calendar" />,
  valid: '2026-06-11',
  invalid: '',
  ...pickerConformance('Day'),
  viewText: /2026/,
})

const part = (name: string) => screen.getByRole('spinbutton', { name })

describe('FormDateField picker', () => {
  it('renders the native date input unless a picker is chosen', () => {
    renderForm((f) => <f.DateField name="date" label="Travel date" />, {
      defaultValues: { date: '2026-10-15' },
    })
    expect(screen.getByLabelText('Travel date')).toHaveAttribute('type', 'date')
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('writes the typed parts to the form as an ISO date', async () => {
    const { form, user } = renderForm(
      (f) => <f.DateField name="date" label="Travel date" picker="calendar" />,
      { defaultValues: { date: '' } },
    )
    await user.click(part('Day'))
    await user.keyboard('15102026')
    expect(form.state.values.date).toBe('2026-10-15')
  })

  it('picks from the calendar without counting the trip into it as a blur', async () => {
    const { form, user } = renderForm(
      (f) => <f.DateField name="date" label="Travel date" picker="calendar" min="2026-10-10" />,
      { defaultValues: { date: '2026-10-15' } },
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    expect(within(dialog).getByRole('gridcell', { name: /\b9 October 2026/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.click(within(dialog).getByRole('gridcell', { name: /20 October 2026/ }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(form.state.values.date).toBe('2026-10-20')
    expect(form.getFieldMeta('date')?.isBlurred).toBe(false)
    await user.click(part('Day'))
    await user.click(document.body)
    expect(form.getFieldMeta('date')?.isBlurred).toBe(true)
  })

  it('types the parts without a calendar when segmented', () => {
    renderForm((f) => <f.DateField name="date" label="Travel date" picker="segmented" />, {
      defaultValues: { date: '2026-10-15' },
    })
    expect(part('Day')).toHaveTextContent('15')
    expect(screen.queryByRole('button', { name: 'Choose date' })).not.toBeInTheDocument()
  })

  it('follows the locale, and leaves the text input’s own props behind', () => {
    const { container } = renderForm(
      (f) => (
        <f.DateField
          name="date"
          label="Travel date"
          picker="calendar"
          locale="en-US"
          placeholder="Pick a date"
          data-testid="travel"
        />
      ),
      { defaultValues: { date: '' } },
    )
    const box = pickerBox(container)
    const parts = within(box)
      .getAllByRole('spinbutton')
      .map((element) => element.getAttribute('aria-label'))
    expect(parts).toEqual(['Month', 'Day', 'Year'])
    expect(box).toHaveAttribute('data-testid', 'travel')
    expect(container.querySelector('[placeholder]')).toBeNull()
  })

  it('renders the picker from a schema', () => {
    const schema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'date', name: 'date', label: 'Travel date', picker: 'calendar', clearable: true },
        ],
      },
    } as const
    expect(parseFormSchema(schema, { kinds: defaultFields }).ok).toBe(true)
    renderForm((form) => <kit.SchemaForm form={form} schema={schema} />, {
      defaultValues: { date: '2026-10-15' },
    })
    expect(part('Day')).toHaveTextContent('15')
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })
})
