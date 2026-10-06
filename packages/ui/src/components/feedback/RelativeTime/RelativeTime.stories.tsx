import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  formatAbsoluteTime,
  formatRelativeTime,
  RelativeTime,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'

const minutesAgo = (m: number) => Date.now() - m * 60_000

const meta = {
  title: 'UI/Feedback/RelativeTime',
  component: RelativeTime,
  args: { date: minutesAgo(3), prefix: 'Updated', format: 'short', locale: 'en-AU' },
  argTypes: { date: { control: 'date' } },
} satisfies Meta<typeof RelativeTime>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Freshness line under the invoices table. Hover for the absolute time. */
export const Freshness: Story = {
  render: () => (
    <Stack gap={3}>
      <RelativeTime date={Date.now() - 20_000} prefix="Deploy finished" />
      <RelativeTime date={minutesAgo(3)} prefix="Invoices updated" />
      <RelativeTime date={minutesAgo(60 * 26)} prefix="Calendar last synced" />
      <RelativeTime date={Date.now() + 90 * 60_000} prefix="Release 2.4 ships" format="long" />
    </Stack>
  ),
}

/**
 * It's safe to server-render: the server and the first client render both show the absolute date,
 * because no clock is read during render, so hydration can't disagree about "now". The relative
 * wording appears once the component has mounted.
 *
 * `format` is `long` ("3 minutes ago"), `short` (the default, "3 mins ago") or `narrow` ("3m
 * ago"). `prefix` adds text inside the element ("Updated 3 mins ago"). Anything under 45 seconds
 * reads as "now".
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={2}>
        <Text size="sm" tone="muted">
          <RelativeTime date="2026-10-01T08:15:00Z" prefix="Timetable updated" />
        </Text>
        <Text>
          Winter timetable starts <RelativeTime date="2026-11-01T00:00:00Z" format="long" />
        </Text>
        <Text>
          Pier reopened <RelativeTime date="2026-06-12T09:00:00Z" format="narrow" />
        </Text>
      </Stack>
    )
  },
}

const SAILING = new Date('2026-10-14T07:10:00')
const NOW = new Date('2026-10-14T06:45:00').getTime()

/**
 * `formatRelativeTime` and `formatAbsoluteTime` return the strings, for a tooltip, a notification
 * or an `aria-label`.
 */
export const Format: Story = {
  name: 'Formatting without the element',
  tags: ['docs'],
  render: function Format() {
    return (
      <Stack gap={2}>
        <Text>{formatRelativeTime(SAILING, NOW, 'en-GB')}</Text>
        <Text>{formatAbsoluteTime(SAILING, 'en-GB')}</Text>
      </Stack>
    )
  },
}
