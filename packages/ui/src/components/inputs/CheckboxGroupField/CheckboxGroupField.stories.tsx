import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxGroupField } from './CheckboxGroupField'

const notifications = [
  { value: 'mentions', label: 'Mentions', description: 'When someone tags you in a comment' },
  { value: 'assigned', label: 'Assigned tasks' },
  { value: 'releases', label: 'Release notes' },
]

const meta = {
  title: 'UI/Inputs/CheckboxGroupField',
  component: CheckboxGroupField,
  args: {
    label: 'Notify me about',
    description: 'Sent to the email on your workspace profile',
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
    defaultValue: ['mentions', 'assigned', 'releases'],
    warning: 'That is about 40 emails a week during a release',
  },
}

export const Validating: Story = { args: { validating: true } }
