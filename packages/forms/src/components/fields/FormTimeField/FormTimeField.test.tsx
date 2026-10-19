import { fireEvent, screen } from '@testing-library/react'
import { FormTimeField } from '#components/fields/FormTimeField'
import { defaultFields } from '#components/fields/defaultFields'
import { kit } from '#kit/defaultKit'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { runFieldConformance } from '#test/conformance'
import { pickerConformance } from '#test/pickers'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('time', {
  build: (props) => <FormTimeField {...props} />,
  valid: '14:30',
  invalid: '',
  interact: (_user, control, value) => {
    fireEvent.change(control, { target: { value } })
  },
  viewText: /30/,
})

runFieldConformance<string>('time (segmented picker)', {
  build: (props) => <FormTimeField {...props} picker="segmented" hourCycle={24} />,
  valid: '14:30',
  invalid: '',
  ...pickerConformance('Hour'),
  viewText: /30/,
})

const part = (name: string) => screen.getByRole('spinbutton', { name })

describe('FormTimeField picker', () => {
  it('renders the native time input unless a picker is chosen', () => {
    renderForm((f) => <f.TimeField name="departs" label="Departs" />, {
      defaultValues: { departs: '14:30' },
    })
    expect(screen.getByLabelText('Departs')).toHaveAttribute('type', 'time')
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('shows a 12-hour clock and keeps the value on the 24-hour one', async () => {
    const { form, user } = renderForm(
      (f) => <f.TimeField name="departs" label="Departs" picker="segmented" hourCycle={12} />,
      { defaultValues: { departs: '' } },
    )
    await user.click(part('Hour'))
    await user.keyboard('0715p')
    expect(form.state.values.departs).toBe('19:15')
    expect(part('Hour')).toHaveTextContent('07')
  })

  it('keeps seconds with granularity="second"', async () => {
    const { form, user } = renderForm(
      (f) => (
        <f.TimeField
          name="departs"
          label="Departs"
          picker="segmented"
          hourCycle={24}
          granularity="second"
        />
      ),
      { defaultValues: { departs: '' } },
    )
    await user.click(part('Hour'))
    await user.keyboard('091545')
    expect(form.state.values.departs).toBe('09:15:45')
  })

  it('renders the picker from a schema', () => {
    const schema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'time', name: 'departs', label: 'Departs', picker: 'segmented', hourCycle: 24 },
        ],
      },
    } as const
    expect(parseFormSchema(schema, { kinds: defaultFields }).ok).toBe(true)
    renderForm((form) => <kit.SchemaForm form={form} schema={schema} />, {
      defaultValues: { departs: '14:30' },
    })
    expect(part('Hour')).toHaveTextContent('14')
    expect(part('Minute')).toHaveTextContent('30')
  })
})
