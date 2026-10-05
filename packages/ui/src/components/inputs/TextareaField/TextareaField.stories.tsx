import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextareaField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/TextareaField',
  component: TextareaField,
  args: {
    label: 'Notes',
    description: 'Only you can see these',
    optional: true,
    autoResize: true,
    rows: 2,
    placeholder: 'Follow up with Oskar on Friday',
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
    defaultValue: 'Invoice for September and October',
    error: 'Split this into two invoices, one per month',
    optional: false,
  },
}

/**
 * `autoResize` grows it up to `maxRows`. `showCount` with `maxLength` counts down the characters
 * left.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <TextareaField
        label="What went wrong?"
        description="Tell us the date, the route and what happened."
        autoResize
        maxRows={8}
        maxLength={600}
        showCount
      />
    )
  },
}
