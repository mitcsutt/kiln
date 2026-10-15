import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, TimeField } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/TimeField',
  component: TimeField,
  args: {
    label: 'Opens at',
    description: 'Local time at the depot',
    defaultValue: '06:30',
    hourCycle: 24,
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '16rem' }}>
      <TimeField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { min: '07:00', defaultValue: '06:30', error: 'The depot opens at 7:00' },
}

/** A labelled time. `min` and `max` mark a time outside them invalid. */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <TimeField
        label="Pickup time"
        description="Between 8:00 am and 6:00 pm"
        hourCycle={12}
        min="08:00"
        max="18:00"
        defaultValue="10:15"
      />
    )
  },
}
