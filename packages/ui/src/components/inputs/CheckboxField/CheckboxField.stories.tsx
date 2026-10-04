import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { CheckboxField } from './CheckboxField'

const meta = {
  title: 'UI/Inputs/CheckboxField',
  component: CheckboxField,
  args: {
    label: "I've read the league rules",
    description: 'Home clubs supply match balls and enter the result within an hour of full time.',
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
  args: { error: 'Tick this to register your club' },
}

export const Checked: Story = {
  args: {
    label: 'Include in monthly report',
    description: undefined,
    required: false,
    defaultChecked: true,
  },
}
