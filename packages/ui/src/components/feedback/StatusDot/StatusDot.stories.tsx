import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { StatusDot } from './StatusDot'

const meta = {
  title: 'UI/Feedback/StatusDot',
  component: StatusDot,
  args: { label: 'Paid', tone: 'positive', size: 'md', labelHidden: false },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Invoice states on a billing screen. */
export const InvoiceStates: Story = {
  render: () => (
    <Stack gap={3}>
      <StatusDot tone="positive" label="INV-1042 — paid 3 Sep" />
      <StatusDot tone="caution" label="INV-1043 — due in 4 days" />
      <StatusDot tone="critical" label="INV-1039 — overdue" />
      <StatusDot tone="neutral" label="INV-1044 — scheduled" />
    </Stack>
  ),
}

/** Project health on a dashboard. */
export const ProjectStatus: Story = {
  render: () => (
    <Stack gap={3}>
      <StatusDot tone="positive" label="On track for 14 November" />
      <StatusDot tone="info" label="Waiting on design review" />
      <StatusDot tone="critical" label="Blocked" />
    </Stack>
  ),
}
