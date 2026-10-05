import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Text } from '#components/typography/Text'
import { Numeral } from './Numeral'

const meta = {
  title: 'UI/Typography/Numeral',
  component: Numeral,
  args: { value: 104000, locale: 'en-AU', size: 'display-md' },
} satisfies Meta<typeof Numeral>

export default meta
type Story = StoryObj<typeof meta>

/** Always tabular, always the theme's figure face: Newsreader's partner grotesk, poster numerals, receipt-tape mono. */
export const Playground: Story = {}

export const Formats: Story = {
  render: () => (
    <Stack gap={3}>
      <Text>
        API requests this month: <Numeral value={6100000} format={{ notation: 'compact' }} />
      </Text>
      <Text>
        Active seats across all plans: <Numeral value={83264} />
      </Text>
      <Text>
        Trial conversion rate:{' '}
        <Numeral value={0.184} format={{ style: 'percent', maximumFractionDigits: 1 }} />
      </Text>
      <Text>
        Distance to the office:{' '}
        <Numeral value={12.4} format={{ style: 'unit', unit: 'kilometer' }} />
      </Text>
    </Stack>
  ),
}

/** `tone="auto"` colours by sign; `signDisplay="exceptZero"` gives +/−. The minus is a real minus, as wide as the plus. */
export const SignAndTone: Story = {
  render: () => (
    <Stack gap={2}>
      {[
        ['Atlas redesign', 5],
        ['Billing migration', 2],
        ['Mobile app', 0],
        ['Help centre', -7],
      ].map(([project, change]) => (
        <Inline key={project} justify="between" gap={4} style={{ maxWidth: '16rem' }}>
          <Text as="span">{project}</Text>
          <Numeral value={change as number} signDisplay="exceptZero" tone="auto" />
        </Inline>
      ))}
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={6} align="baseline">
      <Numeral value={155} size="display-lg" />
      <Numeral value={151} size="display-sm" tone="muted" />
      <Numeral value={98} size="2xl" tone="muted" />
      <Numeral value={64} size="lg" tone="muted" />
    </Inline>
  ),
}

/** `prefix`/`suffix` wrap the figures in proportional text — units and marks don't take a tabular slot. */
export const PrefixAndSuffix: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={6} align="baseline">
        <Numeral value={47} suffix=" seats" size="2xl" />
        <Numeral value={3} prefix="#" size="2xl" tone="muted" />
        <Numeral value={1.8} suffix="×" format={{ maximumFractionDigits: 1 }} size="2xl" />
      </Inline>
      <Text>
        The team closes{' '}
        <Numeral value={2.35} prefix="≈" suffix=" tasks" format={{ maximumFractionDigits: 2 }} /> a
        day this sprint.
      </Text>
    </Stack>
  ),
}
