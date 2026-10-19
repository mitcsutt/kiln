import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangeField, DateRangePickerField, type DateRangeValue } from '@mitcsutt/kiln-ui'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
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

/** `DateRangePickerField`: typed ends and one two-month calendar. Pick the 4th, then the 11th. */
export const CalendarPicker: Story = {
  args: { defaultValue: { start: '', end: '' }, min: undefined },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <DateRangePickerField {...args} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog')
    const first = within(dialog).getAllByRole('grid')[0] as HTMLElement
    const cells = within(first).getAllByRole('gridcell', { name: /\d{4}$/ })
    await userEvent.click(cells[3] as HTMLElement)
    await userEvent.click(cells[10] as HTMLElement)
    // The panel closes once both ends are set (after its exit animation).
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(canvas.getAllByRole('spinbutton', { name: 'Day' })[1]).toHaveTextContent('11')
  },
}

export const CalendarWithTime: Story = {
  args: {
    label: 'Incident window',
    description: 'Times in UTC',
    defaultValue: { start: '2026-10-14T21:40:00Z', end: '2026-10-15T02:15:00Z' },
    min: undefined,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '44rem' }}>
      <DateRangePickerField {...args} granularity="minute" hourCycle={24} timeZone="UTC" />
    </Stack>
  ),
}

/** Below ~25rem the two typed ends stack and the calendar button follows them. */
export const CalendarNarrow: Story = {
  render: (args) => (
    <Stack style={{ maxInlineSize: '18rem' }}>
      <DateRangePickerField {...args} />
    </Stack>
  ),
}

/* 2026-10-15 stands in for "today" so the example reads the same on any day. */
const TODAY = new Date(Date.UTC(2026, 9, 15))
const isoDaysAgo = (days: number) =>
  new Date(TODAY.getTime() - days * 86_400_000).toISOString().slice(0, 10)
const lastDays = (days: number): DateRangeValue => ({
  start: isoDaysAgo(days - 1),
  end: isoDaysAgo(0),
})

/**
 * `DateRangePickerField` swaps the native inputs for typed dates and one calendar showing two
 * months: the first pick is the start, the second the end. `presets` lists ready-made ranges beside
 * it. A preset's `value` can be a function, worked out when it's picked, so "Last 7 days" always
 * ends today.
 */
export const Presets: Story = {
  tags: ['docs'],
  render: function Presets() {
    return (
      <DateRangePickerField
        label="Report period"
        defaultValue={lastDays(7)}
        presets={[
          { label: 'Today', value: () => lastDays(1) },
          { label: 'Last 7 days', value: () => lastDays(7) },
          { label: 'Last 30 days', value: () => lastDays(30) },
          { label: 'September', value: { start: '2026-09-01', end: '2026-09-30' } },
        ]}
      />
    )
  },
}

/**
 * `granularity="minute"` gives each end of a `DateRangePickerField` a time, set beneath the
 * calendar. A new range runs from the start of its first day to the end of its last. With
 * `timeZone`, each end is a UTC instant typed as that zone's clock.
 */
export const WithTime: Story = {
  tags: ['docs'],
  render: function WithTime() {
    return (
      <DateRangePickerField
        label="Show logs from"
        granularity="minute"
        timeZone="UTC"
        startLabel="From"
        endLabel="To"
        defaultValue={{ start: '2026-10-14T22:00:00Z', end: '2026-10-15T06:00:00Z' }}
      />
    )
  },
}
