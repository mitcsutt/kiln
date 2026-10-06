import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, StatusDot } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

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

/**
 * `labelHidden` keeps the label for screen readers only, for dense tables where a column header
 * already explains the dots.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={5}>
        <StatusDot tone="positive" label="Good service" />
        <StatusDot tone="caution" label="Minor delays" />
        <StatusDot tone="critical" label="Suspended" />
        <StatusDot tone="neutral" label="Not running today" />
        <StatusDot tone="info" label="Planned works" labelHidden size="sm" />
      </Inline>
    )
  },
}
