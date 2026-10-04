import { Amount, Stack, Text } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Form } from '#components/Form'
import { useFieldValue } from '#core/hooks'
import { kit } from '#kit'

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
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/a month/)).toHaveTextContent('£6')
    await userEvent.click(canvas.getByRole('radio', { name: 'Team, up to 10 people' }))
    await expect(canvas.getByText(/a month/)).toHaveTextContent('£24')
  },
}
