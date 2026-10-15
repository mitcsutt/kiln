import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateTimeInput, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, screen, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Inputs/DateTimeInput',
  component: DateTimeInput,
  args: {
    'aria-label': 'Starts',
    defaultValue: '2026-10-15T09:30',
    hourCycle: 24,
    granularity: 'minute',
    size: 'md',
    clearable: false,
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '22rem' }}>
      <DateTimeInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof DateTimeInput>

export default meta
type Story = StoryObj<typeof meta>

/** Open the calendar, pick the 20th, then set the hour beneath it: the time is kept. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('button', { name: 'Choose date' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' })
    await userEvent.click(within(dialog).getByRole('gridcell', { name: 'Tuesday 20 October 2026' }))
    const time = within(dialog).getByRole('group', { name: 'Time' })
    await userEvent.click(within(time).getByRole('spinbutton', { name: 'Hour' }))
    await userEvent.keyboard('16{Escape}')
    await expect(canvas.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('20')
    await expect(canvas.getByRole('spinbutton', { name: 'Hour' })).toHaveTextContent('16')
  },
}

export const TwelveHour: Story = {
  args: { hourCycle: 12, locale: 'en-US' },
}

/** With `timeZone` the box shows the zone's clock and name; the value is UTC. */
export const InAZone: Story = {
  args: { timeZone: 'UTC', defaultValue: '2026-10-15T22:05:00Z', granularity: 'second' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * Without `timeZone`, the value is a wall-clock time (`2026-10-15T09:30`), like a native
 * `datetime-local`: the meeting is at 9:30 wherever it's read. The calendar keeps the time when
 * you pick a day, and has the time beneath it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DateTimeInput
        aria-label="Site visit"
        defaultValue="2026-10-21T09:30"
        min="2026-10-16T00:00"
        clearable
      />
    )
  },
}

/**
 * With `timeZone`, the value is an instant in UTC (`2026-10-15T03:30:00Z`), typed and shown as the
 * clock in that zone, with its name in the box. Here the same moment reads 11:30 am in Perth.
 */
export const TimeZone: Story = {
  tags: ['docs'],
  render: function TimeZone() {
    const [value, setValue] = useState('2026-10-15T03:30:00Z')
    return (
      <Stack gap={3}>
        <DateTimeInput
          aria-label="Release window opens"
          timeZone="Australia/Perth"
          value={value}
          onValueChange={setValue}
        />
        <Text tone="muted">Stored as {value || 'nothing yet'}</Text>
      </Stack>
    )
  },
}
