import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid, Stat } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Display/Stat',
  component: Stat,
  args: {
    label: 'Costs',
    value: '$4,812.40',
    hint: 'of $6,200.00 forecast',
    delta: { value: '$212.40', direction: 'up', tone: 'critical' },
    size: 'md',
    rule: false,
  },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * A revenue month. One hero figure (what's been billed), the rest in a ruled row so they
 * line up like ledger columns. Costs that rose are bad; revenue that rose is good.
 */
export const MonthlyRevenue: Story = {
  render: () => (
    <Stack gap={6}>
      <Stat
        size="hero"
        label="Revenue in September"
        value="$48,120.40"
        hint="12 days to go · of $60,000 target"
      />
      <Inline gap={6} align="start">
        <Stat
          rule
          label="Invoiced"
          value="$52,450.00"
          delta={{ value: '$0.00', direction: 'flat' }}
        />
        <Stat
          rule
          label="Costs"
          value="$4,812.40"
          delta={{ value: '$212.40', direction: 'up', tone: 'critical' }}
          hint="vs August"
        />
        <Stat
          rule
          label="New clients"
          value="4"
          delta={{ value: '1', direction: 'up' }}
          hint="Pipeline 68%"
        />
      </Inline>
    </Stack>
  ),
}

/** Sprint figures: a falling cycle time is good news, so its delta is `tone="positive"`. */
export const SprintStats: Story = {
  render: () => (
    <Inline gap={6} align="start">
      <Stat
        size="lg"
        label="Tasks closed"
        value="42"
        delta={{ value: '6 today', direction: 'up' }}
      />
      <Stat
        size="lg"
        label="Cycle time"
        value="3.2 days"
        delta={{ value: '0.4 days', direction: 'down', tone: 'positive' }}
        hint="median, last 30 days"
      />
      <Stat size="lg" label="Milestones left" value="2 / 6" hint="Beta, general release" />
    </Inline>
  ),
}

/** `tone` colours the figure itself — only when the number is the news: an overrun, the live total. */
export const Tones: Story = {
  render: () => (
    <Inline gap={6} align="start">
      <Stat
        rule
        label="Cloud hosting"
        value="$412.50"
        tone="critical"
        hint="$112.50 over the $300.00 forecast"
      />
      <Stat
        rule
        label="Annual recurring revenue"
        value="$850,000"
        tone="positive"
        delta={{ value: '$25,000', direction: 'up' }}
        hint="Target reached"
      />
      <Stat
        rule
        label="Live total"
        value="47 signups"
        tone="accent"
        delta={{ value: '3', direction: 'up' }}
        hint="Launch day, hour 6"
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

/**
 * `delta` takes a `value`, a `direction` and a `tone`. Choose the tone by whether the change is
 * good news, not by its direction: fewer delays is `down` and `positive`. `hint` adds context such
 * as a target, and `rule` draws a hairline above.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Grid columns={{ base: 1, sm: 3 }} gap={6}>
        <Stat
          label="Passengers"
          value="18,432"
          delta={{ value: '6%', direction: 'up', tone: 'positive' }}
        />
        <Stat
          label="On time"
          value="94.1%"
          delta={{ value: '1.2 pts', direction: 'down', tone: 'critical' }}
          hint="Target 95%"
        />
        <Stat label="Sailings" value="1,206" delta={{ value: '0', direction: 'flat' }} />
      </Grid>
    )
  },
}

/**
 * `size="hero"` is for the one number a page is about.
 */
export const Hero: Story = {
  name: 'The hero figure',
  tags: ['docs'],
  render: function Hero() {
    return (
      <Stat
        size="hero"
        label="Fares collected this month"
        value="£214,880"
        delta={{ value: '£12,400', direction: 'up', tone: 'positive' }}
        rule
      />
    )
  },
}
