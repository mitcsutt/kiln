import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { FormDateTimeField } from '#components/fields/FormDateTimeField'
import { defaultFields } from '#components/fields/defaultFields'
import { kit } from '#kit/defaultKit'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { runFieldConformance } from '#test/conformance'
import { pickerConformance } from '#test/pickers'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('dateTime', {
  build: (props) => <FormDateTimeField {...props} />,
  valid: '2026-06-11T14:30',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /2026/,
})

runFieldConformance<string>('dateTime (calendar picker)', {
  build: (props) => <FormDateTimeField {...props} picker="calendar" hourCycle={24} />,
  valid: '2026-06-11T14:30',
  invalid: '',
  ...pickerConformance('Day'),
  viewText: /2026/,
})

const part = (name: string) => screen.getByRole('spinbutton', { name })

describe('FormDateTimeField picker', () => {
  it('renders the native date-time input unless a picker is chosen', () => {
    renderForm((f) => <f.DateTimeField name="pickup" label="Pick-up time" />, {
      defaultValues: { pickup: '2026-10-15T09:30' },
    })
    expect(screen.getByLabelText('Pick-up time')).toHaveAttribute('type', 'datetime-local')
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('writes the typed parts to the form as a wall-clock date-time', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.DateTimeField name="pickup" label="Pick-up time" picker="calendar" hourCycle={24} />
      ),
      { defaultValues: { pickup: '' } },
    )
    await user.click(part('Day'))
    await user.keyboard('151020260930')
    expect(form.state.values.pickup).toBe('2026-10-15T09:30')
  })

  it('picks a day from the calendar and keeps the time', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.DateTimeField name="pickup" label="Pick-up time" picker="calendar" hourCycle={24} />
      ),
      { defaultValues: { pickup: '2026-10-15T09:30' } },
    )
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    await user.click(within(dialog).getByRole('gridcell', { name: /20 October 2026/ }))
    await waitFor(() => {
      expect(form.state.values.pickup).toBe('2026-10-20T09:30')
    })
  })

  it('types the parts without a calendar when segmented', () => {
    renderForm(
      (f) => (
        <f.DateTimeField name="pickup" label="Pick-up time" picker="segmented" hourCycle={24} />
      ),
      { defaultValues: { pickup: '2026-10-15T09:30' } },
    )
    expect(part('Hour')).toHaveTextContent('09')
    expect(screen.queryByRole('button', { name: 'Choose date' })).not.toBeInTheDocument()
  })

  it('renders the picker from a schema', () => {
    const schema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'dateTime',
            name: 'pickup',
            label: 'Pick-up time',
            picker: 'calendar',
            hourCycle: 24,
          },
        ],
      },
    } as const
    expect(parseFormSchema(schema, { kinds: defaultFields }).ok).toBe(true)
    renderForm((form) => <kit.SchemaForm form={form} schema={schema} />, {
      defaultValues: { pickup: '2026-10-15T09:30' },
    })
    expect(part('Day')).toHaveTextContent('15')
    expect(part('Minute')).toHaveTextContent('30')
  })
})
