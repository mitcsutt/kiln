import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Inputs/Calendar',
  component: Calendar,
  args: {
    'aria-label': 'Delivery date',
    defaultValue: '2026-10-15',
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/** Arrow to the next day and press Enter: it becomes the picked day. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Thursday 15 October 2026' }))
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect(canvas.getByRole('gridcell', { name: 'Friday 16 October 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await userEvent.keyboard('{PageDown}')
    await expect(canvas.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument()
  },
}

/** Two clicks make a range; the days between fill as one band. */
export const Range: Story = {
  render: () => (
    <Calendar
      aria-label="Stay"
      mode="range"
      months={2}
      defaultValue={{ start: '2026-10-27', end: '2026-11-03' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Monday 9 November 2026' }))
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Friday 13 November 2026' }))
    await expect(
      canvas.getByRole('gridcell', { name: 'Wednesday 11 November 2026' }),
    ).toHaveAttribute('data-in-range')
  },
}

const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T12:00`).getDay())

/** `min`, `max` and `isDateDisabled` strike days through; they still take focus. */
export const Unavailable: Story = {
  args: { min: '2026-10-05', max: '2026-11-20', isDateDisabled: isWeekend },
}

export const Disabled: Story = {
  args: { disabled: true },
}

const BOOKED = new Set(['2026-10-21', '2026-10-22', '2026-10-28'])

/**
 * A calendar that's always on the page, for picking a day at a glance. `isDateDisabled` takes a
 * date (`YYYY-MM-DD`) and marks it unavailable: struck through, skipped when picking, still
 * reachable by keyboard so it can be read out.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [day, setDay] = useState('2026-10-20')
    return (
      <Stack gap={3}>
        <Calendar
          aria-label="Workshop day"
          value={day}
          onValueChange={setDay}
          min="2026-10-01"
          isDateDisabled={(date) => BOOKED.has(date)}
        />
        <Text tone="muted">Booked for {day}</Text>
      </Stack>
    )
  },
}

/**
 * `mode="range"` picks a start and an end: the first pick is the start, the second the end, and a
 * pick before the start swaps them. `months={2}` shows two months side by side; they wrap on a
 * phone.
 */
export const DateRange: Story = {
  name: 'Range',
  tags: ['docs'],
  render: function DateRange() {
    return (
      <Calendar
        aria-label="Holiday"
        mode="range"
        months={2}
        defaultValue={{ start: '2026-12-21', end: '2027-01-04' }}
      />
    )
  },
}

/**
 * Month and weekday names come from `locale`, and so does the first day of the week: Sunday in
 * `en-US`, Monday in `de-DE`. `firstDayOfWeek` overrides it.
 */
export const Locale: Story = {
  tags: ['docs'],
  render: function Locale() {
    return (
      <Stack gap={5}>
        <Calendar aria-label="Ship date" locale="en-US" defaultValue="2026-10-15" />
        <Calendar aria-label="Liefertermin" locale="de-DE" defaultValue="2026-10-15" />
      </Stack>
    )
  },
}
