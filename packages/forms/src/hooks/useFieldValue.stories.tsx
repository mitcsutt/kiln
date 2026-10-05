import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Stack, Amount, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Hooks/useFieldValue',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const PLANS = [
  { value: 'solo', label: 'Solo', price: 6 },
  { value: 'team', label: 'Team, up to 10 people', price: 24 },
  { value: 'studio', label: 'Studio, unlimited people', price: 60 },
] as const

function PlanPicker() {
  const form = kit.useAppForm({ defaultValues: { plan: 'solo' } })
  const plan = useFieldValue(form, 'plan')
  const price = PLANS.find((p) => p.value === plan)?.price ?? 0
  return (
    <Form form={form} aria-label="Choose a plan">
      <Stack gap={5}>
        <form.RadioField
          name="plan"
          label="Plan"
          options={PLANS.map(({ value, label }) => ({ value, label }))}
        />
        <Text aria-live="polite">
          You pay <Amount value={price} currency="GBP" precision={0} /> a month.
        </Text>
      </Stack>
    </Form>
  )
}

/** One field's value, for rendering that depends on it. Only a change to `plan` re-renders. */
export const Playground: Story = {
  render: () => <PlanPicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByText(/a month/)).toHaveTextContent('£6')
    await userEvent.click(canvas.getByRole('radio', { name: 'Team, up to 10 people' }))
    await expect(canvas.getByText(/a month/)).toHaveTextContent('£24')
  },
}

const POSTCODES: Record<string, string> = { GB: 'KB4 2PQ', IE: 'D02 X285' }

/**
 * To reset a dependent field when its parent changes, use a field listener, as the country field
 * above does with `form.resetField('postcode')`. In schema mode the same thing is `resets:
 * ['postcode']`.
 *
 * Read values where they're used: a small component that calls `useFieldValue` re-renders alone,
 * while calling it at the top of a big form re-renders the whole form on each change.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { country: 'GB', postcode: '' } })
    const country = useFieldValue(form, 'country')
    return (
      <Form form={form} aria-label="Address">
        <Stack gap={5}>
          <form.SelectField
            name="country"
            label="Country"
            options={[
              { value: 'GB', label: 'United Kingdom' },
              { value: 'IE', label: 'Ireland' },
            ]}
            listeners={{
              onChange: () => {
                form.resetField('postcode')
              },
            }}
          />
          <form.TextField
            name="postcode"
            label={country === 'IE' ? 'Eircode' : 'Postcode'}
            placeholder={POSTCODES[country === 'IE' ? 'IE' : 'GB']}
          />
        </Stack>
      </Form>
    )
  },
}
