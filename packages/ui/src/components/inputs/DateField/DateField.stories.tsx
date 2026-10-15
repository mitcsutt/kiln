import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateField, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/DateField',
  component: DateField,
  args: {
    label: 'Due date',
    description: 'Invoices are due within 30 days',
    defaultValue: '2026-11-14',
    clearable: true,
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '20rem' }}>
      <DateField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof DateField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: undefined, required: true, error: 'Choose a due date' },
}

export const Horizontal: Story = {
  args: { layout: 'horizontal' },
  render: (args) => (
    <Stack style={{ maxInlineSize: '36rem' }}>
      <DateField {...args} />
    </Stack>
  ),
}

/**
 * A labelled date with a calendar. `isDateDisabled` rules out dates the calendar shouldn't offer,
 * here the weekends.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DateField
        label="Collection day"
        description="Bins go out on weekdays only"
        min="2026-10-16"
        isDateDisabled={(date) => [0, 6].includes(new Date(`${date}T12:00`).getDay())}
      />
    )
  },
}
