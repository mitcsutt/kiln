import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxGroupField } from './CheckboxGroupField'

const notifications = [
  { value: 'goals', label: 'Goals', description: 'When a team you drew scores' },
  { value: 'kickoffs', label: 'Kick-offs' },
  { value: 'results', label: 'Full-time results' },
]

const meta = {
  title: 'UI/Inputs/CheckboxGroupField',
  component: CheckboxGroupField,
  args: {
    label: 'Notify me about',
    description: 'Sent to the email on your club registration',
    options: notifications,
    name: 'notify',
    selectAllLabel: 'Everything',
    required: false,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof CheckboxGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { error: 'Choose at least one', required: true } }

export const WithWarning: Story = {
  args: {
    defaultValue: ['goals', 'kickoffs', 'results'],
    warning: 'That is about 40 emails a week during the group stage',
  },
}

export const Validating: Story = { args: { validating: true } }
