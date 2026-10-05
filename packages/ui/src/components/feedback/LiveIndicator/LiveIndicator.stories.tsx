import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { LiveIndicator } from './LiveIndicator'

const meta = {
  title: 'UI/Feedback/LiveIndicator',
  component: LiveIndicator,
  args: { label: 'Live', tone: 'accent', pulse: true, variant: 'inline', size: 'md' },
} satisfies Meta<typeof LiveIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Status on a list row: the pill keeps the dot legible on any card. */
export const RowStatus: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={4}>
        <LiveIndicator variant="pill" label="On air" tone="critical" />
        <span>Weekly all-hands</span>
      </Inline>
      <Inline gap={4}>
        <LiveIndicator variant="pill" label="Paused" tone="critical" pulse={false} />
        <span>Release 2.4 rollout</span>
      </Inline>
    </Stack>
  ),
}

export const Tones: Story = {
  render: () => (
    <Inline gap={5}>
      <LiveIndicator tone="accent" label="Live" />
      <LiveIndicator tone="critical" label="Recording" />
      <LiveIndicator tone="positive" label="Syncing" />
      <LiveIndicator tone="info" label="Deploying" />
      <LiveIndicator tone="neutral" label="Idle" pulse={false} />
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={5}>
      <LiveIndicator size="sm" variant="pill" label="Live" />
      <LiveIndicator size="md" variant="pill" label="Live" />
    </Inline>
  ),
}
