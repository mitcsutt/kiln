import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroupField } from '@mitcsutt/kiln-ui'

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly', description: 'Every second Thursday' },
  { value: 'monthly', label: 'Monthly', description: 'On the 15th' },
]

const meta = {
  title: 'UI/Inputs/RadioGroupField',
  component: RadioGroupField,
  args: {
    label: 'Billing period',
    description: 'Invoices go out at the start of each period',
    options: periods,
    name: 'period',
    defaultValue: 'fortnightly',
    orientation: 'vertical',
    required: false,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof RadioGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    options: periods.map(({ value, label }) => ({ value, label })),
  },
}

export const WithError: Story = {
  args: { defaultValue: undefined, required: true, error: 'Choose a billing period' },
}

export const ReadOnly: Story = { args: { readOnly: true } }

/**
 * `orientation="horizontal"` puts short options in a row. For five or more options, a
 * [SelectField](/docs/ui/inputs/select-field) takes less room; for options that need a price or a
 * sentence, [ChoiceCardsField](/docs/ui/inputs/choice-cards-field).
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <RadioGroupField
        label="Seat preference"
        defaultValue="window"
        options={[
          { value: 'window', label: 'Window' },
          { value: 'aisle', label: 'Aisle' },
          { value: 'none', label: 'No preference', description: 'Faster boarding' },
        ]}
      />
    )
  },
}
