import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Meter } from './Meter'

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })

const meta = {
  title: 'UI/Display/Meter',
  component: Meter,
  args: {
    label: 'Groceries',
    value: 578.4,
    min: 0,
    max: 680,
    low: 510,
    high: 680,
    optimum: 0,
    valueLabel: `${aud.format(578.4)} of ${aud.format(680)}`,
    size: 'md',
  },
} satisfies Meta<typeof Meter>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const categories = [
  { name: 'Transport', spent: 96, limit: 240 },
  { name: 'Groceries', spent: 578.4, limit: 680 },
  { name: 'Dining out', spent: 330, limit: 300 },
]

/**
 * Budget categories at 40%, 85% and 110%. Thresholds are the same for all three
 * (warn from 75%, over the limit is critical); the tone follows on its own.
 */
export const BudgetCategories: Story = {
  render: () => (
    <Stack gap={5}>
      {categories.map((c) => (
        <Meter
          key={c.name}
          label={c.name}
          value={c.spent}
          max={c.limit}
          low={c.limit * 0.75}
          high={c.limit}
          optimum={0}
          valueLabel={`${aud.format(c.spent)} of ${aud.format(c.limit)}`}
        />
      ))}
    </Stack>
  ),
}

/**
 * Segments for countable things: training sessions attended out of six this block.
 * `neutral` is the quiet grey for "nothing to report" — it sits back from the toned bars.
 */
export const Segmented: Story = {
  render: () => (
    <Stack gap={5}>
      <Meter
        label="Rosa — sessions attended"
        value={5}
        max={6}
        segments={6}
        tone="positive"
        valueLabel="5 of 6"
        size="lg"
      />
      <Meter
        label="Jordan — sessions attended"
        value={2}
        max={6}
        segments={6}
        tone="neutral"
        valueLabel="2 of 6"
        size="lg"
      />
      <Meter
        label="Amara — sessions attended"
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

/** More is better: an emergency fund against its target. */
export const SavingsGoal: Story = {
  args: {
    label: 'Emergency fund',
    value: 6200,
    max: 10000,
    low: 3000,
    high: 8000,
    optimum: 10000,
    valueLabel: `${aud.format(6200)} of ${aud.format(10000)}`,
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={5}>
      <Meter size="sm" label="Utilities" value={0.52} low={0.75} high={1} optimum={0} />
      <Meter size="md" label="Utilities" value={0.52} low={0.75} high={1} optimum={0} />
      <Meter size="lg" label="Utilities" value={0.52} low={0.75} high={1} optimum={0} />
    </Stack>
  ),
}
