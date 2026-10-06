import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangeField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/DateRangeField',
  component: DateRangeField,
  args: {
    label: 'Trip dates',
    description: 'Lisbon, flights booked separately',
    defaultValue: { start: '2026-11-02', end: '2026-11-09' },
    min: '2026-10-03',
    required: false,
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <DateRangeField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof DateRangeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Lease: Story = {
  args: {
    label: 'Lease',
    description: undefined,
    startLabel: 'Moving in',
    endLabel: 'Moving out',
    defaultValue: { start: '2026-12-01', end: '' },
    min: undefined,
  },
}

export const WithError: Story = {
  args: {
    defaultValue: { start: '2026-11-09', end: '2026-11-02' },
    error: 'The trip ends before it starts',
  },
}

/** Below ~25rem the two inputs stack. */
export const Narrow: Story = {
  render: (args) => (
    <Stack style={{ maxInlineSize: '18rem' }}>
      <DateRangeField {...args} />
    </Stack>
  ),
}

/**
 * `value` is `{ start, end }` as ISO date strings (`2026-10-14`). `min` and `max` bound both
 * inputs, and the end can't be before the start. `startLabel` and `endLabel` name the two inputs.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DateRangeField
        label="Travel dates"
        description="Up to 14 days"
        startLabel="First day"
        endLabel="Last day"
        min="2026-10-01"
        defaultValue={{ start: '2026-10-14', end: '2026-10-18' }}
      />
    )
  },
}
