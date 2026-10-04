import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { TextareaField } from './TextareaField'

const meta = {
  title: 'UI/Inputs/TextareaField',
  component: TextareaField,
  args: {
    label: 'Notes',
    description: 'Only you can see these',
    optional: true,
    autoResize: true,
    rows: 2,
    placeholder: "Half is Oskar's — settle up on Friday",
    error: '',
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <TextareaField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TextareaField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: {
    defaultValue: 'Rent for September and October',
    error: 'Split this into two expenses, one per month',
    optional: false,
  },
}
