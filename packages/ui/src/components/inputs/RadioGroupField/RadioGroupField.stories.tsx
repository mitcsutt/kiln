import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroupField } from './RadioGroupField'

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly', description: 'Every second Thursday' },
  { value: 'monthly', label: 'Monthly', description: 'On the 15th' },
]

const meta = {
  title: 'UI/Inputs/RadioGroupField',
  component: RadioGroupField,
  args: {
    label: 'Pay period',
    description: 'Budgets reset at the start of each period',
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
  args: { defaultValue: undefined, required: true, error: 'Choose a pay period' },
}

export const ReadOnly: Story = { args: { readOnly: true } }
