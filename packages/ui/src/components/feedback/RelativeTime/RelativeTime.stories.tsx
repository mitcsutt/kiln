import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { RelativeTime } from './RelativeTime'

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
