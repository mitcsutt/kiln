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

/** Bill states on an accounts screen. */
export const BillStates: Story = {
  render: () => (
    <Stack gap={3}>
      <StatusDot tone="positive" label="Electricity — paid 3 Sep" />
      <StatusDot tone="caution" label="Water — due in 4 days" />
      <StatusDot tone="critical" label="Council rates — overdue" />
      <StatusDot tone="neutral" label="Internet — scheduled" />
    </Stack>
  ),
}

/** Cup status for a club. */
export const TeamStatus: Story = {
  render: () => (
    <Stack gap={3}>
      <StatusDot tone="positive" label="Through to the quarter-finals" />
      <StatusDot tone="info" label="Waiting on a replay" />
      <StatusDot tone="critical" label="Eliminated" />
    </Stack>
  ),
}
