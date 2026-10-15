import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateTimeField, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/DateTimeField',
  component: DateTimeField,
  args: {
    label: 'Publish at',
    description: 'The post goes live at this time',
    defaultValue: '2026-11-02T08:00',
    hourCycle: 24,
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <DateTimeField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof DateTimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: undefined, required: true, error: 'Choose when to publish' },
}

/**
 * A labelled date and time. Pass `timeZone` to store an instant, here the time a maintenance window
 * starts, shown in UTC.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DateTimeField
        label="Maintenance starts"
        description="Customers are emailed a day before"
        timeZone="UTC"
        defaultValue="2026-11-07T14:00:00Z"
      />
    )
  },
}
