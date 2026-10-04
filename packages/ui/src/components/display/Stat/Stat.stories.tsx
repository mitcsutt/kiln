import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Stat } from './Stat'

const meta = {
  title: 'UI/Display/Stat',
  component: Stat,
  args: {
    label: 'Spent',
    value: '$4,812.40',
    hint: 'of $6,200.00 budgeted',
    delta: { value: '$212.40', direction: 'up', tone: 'critical' },
    size: 'md',
    rule: false,
  },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * A budget month. One hero figure (what's left), the rest in a ruled row so they line up
 * like ledger columns. Spending that rose is bad; savings that rose is good.
 */
export const BudgetMonth: Story = {
  render: () => (
    <Stack gap={6}>
      <Stat
        size="hero"
        label="Left to spend in September"
        value="$1,387.60"
        hint="12 days to go · about $115 a day"
      />
      <Inline gap={6} align="start">
        <Stat rule label="Income" value="$7,450.00" delta={{ value: '$0.00', direction: 'flat' }} />
        <Stat
          rule
          label="Spent"
          value="$4,812.40"
          delta={{ value: '$212.40', direction: 'up', tone: 'critical' }}
          hint="vs August"
        />
        <Stat
          rule
          label="Saved"
          value="$1,250.00"
          delta={{ value: '$150.00', direction: 'up' }}
          hint="Emergency fund 68%"
        />
      </Inline>
    </Stack>
  ),
}

/** A league: rank change where down the table is bad and up is good. */
export const League: Story = {
  render: () => (
    <Inline gap={6} align="start">
      <Stat size="lg" label="Points" value="42" delta={{ value: '6 today', direction: 'up' }} />
      <Stat
        size="lg"
        label="Rank"
        value="3rd"
        delta={{ value: '2 places', direction: 'down' }}
        hint="of 8 clubs"
      />
      <Stat size="lg" label="Cup ties left" value="2 / 6" hint="Quarter-final, semi-final" />
    </Inline>
  ),
}

/** `tone` colours the figure itself — only when the number is the news: an overspend, the live total. */
export const Tones: Story = {
  render: () => (
    <Inline gap={6} align="start">
      <Stat
        rule
        label="Eating out"
        value="$412.50"
        tone="critical"
        hint="$112.50 over the $300.00 budget"
      />
      <Stat
        rule
        label="Emergency fund"
        value="$8,500.00"
        tone="positive"
        delta={{ value: '$250.00', direction: 'up' }}
        hint="Goal reached"
      />
      <Stat
        rule
        label="Live total"
        value="47 pts"
        tone="accent"
        delta={{ value: '3', direction: 'up' }}
        hint="Hawks lead 1–0"
      />
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={5}>
      {(['sm', 'md', 'lg', 'hero'] as const).map((size) => (
        <Stat
          key={size}
          size={size}
          label={`Size ${size}`}
          value="$12,480.00"
          delta={{ value: '4.1%', direction: 'down', tone: 'positive' }}
        />
      ))}
    </Stack>
  ),
}
