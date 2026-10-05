import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { TextField } from './TextField'

const meta = {
  title: 'UI/Inputs/TextField',
  component: TextField,
  args: {
    label: 'Amount',
    description: 'Include GST',
    error: '',
    numeric: true,
    leading: '$',
    trailing: 'AUD',
    placeholder: '0.00',
    required: true,
    disabled: false,
    size: 'md',
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <TextField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: '0.00', error: 'Enter an amount above $0.00' },
}

export const PlainText: Story = {
  args: {
    label: 'Project name',
    description: 'Shown on the project card',
    numeric: false,
    leading: undefined,
    trailing: undefined,
    placeholder: 'Harbour transit map',
    required: false,
    optional: true,
  },
}

/** "12 / 280" under the field, tabular, announced only within 10% of the limit. */
export const CharacterCount: Story = {
  args: {
    label: 'Project summary',
    description: 'One sentence, shown in the project list',
    numeric: false,
    leading: undefined,
    trailing: undefined,
    placeholder: undefined,
    required: false,
    defaultValue: 'A shared component library for the web and mobile apps.',
    maxLength: 80,
    showCount: true,
  },
}
