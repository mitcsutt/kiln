import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { CheckboxField } from './CheckboxField'

const meta = {
  title: 'UI/Inputs/CheckboxField',
  component: CheckboxField,
  args: {
    label: "I've read the workspace guidelines",
    description: "Guests can view shared projects but can't edit tasks or invite anyone else.",
    required: true,
    error: '',
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <CheckboxField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof CheckboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { error: 'Tick this to join the workspace' },
}

export const Checked: Story = {
  args: {
    label: 'Include in monthly report',
    description: undefined,
    required: false,
    defaultChecked: true,
  },
}
