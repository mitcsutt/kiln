import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Meter } from './Meter'

const aud = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

const gb = (n: number) => `${n.toLocaleString('en-AU')} GB`

const meta = {
  title: 'UI/Display/Meter',
  component: Meter,
  args: {
    label: 'Storage',
    value: 578.4,
    min: 0,
    max: 680,
    low: 510,
    high: 680,
    optimum: 0,
    valueLabel: `${gb(578.4)} of ${gb(680)}`,
    size: 'md',
  },
} satisfies Meta<typeof Meter>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const quotas = [
  { name: 'Seats', used: 4, limit: 10, unit: (n: number) => `${String(n)} seats` },
  { name: 'Storage', used: 578.4, limit: 680, unit: gb },
  {
    name: 'API requests this month',
    used: 330_000,
    limit: 300_000,
    unit: (n: number) => `${n.toLocaleString('en-AU')} requests`,
  },
]

/**
 * Plan usage at 40%, 85% and 110%. Thresholds are the same for all three
 * (warn from 75%, over the quota is critical); the tone follows on its own.
 */
export const PlanUsage: Story = {
  render: () => (
    <Stack gap={5}>
      {quotas.map((q) => (
        <Meter
          key={q.name}
          label={q.name}
          value={q.used}
          max={q.limit}
          low={q.limit * 0.75}
          high={q.limit}
          optimum={0}
          valueLabel={`${q.unit(q.used)} of ${q.unit(q.limit)}`}
        />
      ))}
    </Stack>
  ),
}

/**
 * Segments for countable things: onboarding steps finished out of six.
 * `neutral` is the quiet grey for "nothing to report" — it sits back from the toned bars.
 */
export const Segmented: Story = {
  render: () => (
    <Stack gap={5}>
      <Meter
        label="Priya — onboarding steps"
        value={5}
        max={6}
        segments={6}
        tone="positive"
        valueLabel="5 of 6"
        size="lg"
      />
      <Meter
        label="Tomás — onboarding steps"
        value={2}
        max={6}
        segments={6}
        tone="neutral"
        valueLabel="2 of 6"
        size="lg"
      />
      <Meter
        label="Hana — onboarding steps"
        value={0}
        max={6}
        segments={6}
        tone="critical"
        valueLabel="None yet"
        size="lg"
      />
    </Stack>
  ),
}

/** More is better: quarterly revenue against its target. */
export const RevenueTarget: Story = {
  args: {
    label: 'Quarterly revenue',
    value: 62_000,
    max: 100_000,
    low: 30_000,
    high: 80_000,
    optimum: 100_000,
    valueLabel: `${aud.format(62_000)} of ${aud.format(100_000)}`,
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={5}>
      <Meter size="sm" label="Bandwidth" value={0.52} low={0.75} high={1} optimum={0} />
      <Meter size="md" label="Bandwidth" value={0.52} low={0.75} high={1} optimum={0} />
      <Meter size="lg" label="Bandwidth" value={0.52} low={0.75} high={1} optimum={0} />
    </Stack>
  ),
}
