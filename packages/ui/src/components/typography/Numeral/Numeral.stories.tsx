import type { Meta, StoryObj } from '@storybook/react-vite'
import { formatNumeral, Inline, Numeral, signOf, Stack, Text } from '@mitcsutt/kiln-ui'

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

/**
 * - `format` takes any `Intl.NumberFormatOptions`: percentages, compact notation, units.
 * - `locale` defaults to `en-AU`.
 * - `signDisplay` controls the sign, and `tone="auto"` colours positive and negative values with
 *   the positive and critical tones. Negatives use a true minus sign (U+2212), as wide as a plus.
 * - `prefix` and `suffix` add text before and after, outside the figures.
 *
 * Separators and symbols are set proportionally. Some faces make a tabular comma as wide as a
 * digit, which reads as "1 , 017"; right-aligned columns still line up.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <Inline gap={2} align="baseline">
          <Numeral value={18432} size="2xl" />
          <Text tone="muted">passengers this week</Text>
        </Inline>
        <Inline gap={5}>
          <Numeral
            value={0.184}
            format={{ style: 'percent', maximumFractionDigits: 1 }}
            signDisplay="exceptZero"
            tone="auto"
          />
          <Numeral
            value={-0.042}
            format={{ style: 'percent', maximumFractionDigits: 1 }}
            signDisplay="exceptZero"
            tone="auto"
          />
          <Numeral value={7.4} suffix=" km" />
          <Numeral value={1250000} format={{ notation: 'compact' }} />
        </Inline>
      </Stack>
    )
  },
}

const change = -0.042

/**
 * `formatNumeral` returns the same text as a plain string, for titles, `aria-label`s and CSV
 * exports. `formatNumeralParts` splits it into runs of figures and marks, and `signOf` resolves a
 * number's sign, treating `-0` as zero.
 */
export const Format: Story = {
  name: 'Formatting without the component',
  tags: ['docs'],
  render: function Format() {
    return (
      <Stack gap={2}>
        <Text>Plain string: {formatNumeral(18432)}</Text>
        <Text>
          Sign of {change}: {signOf(change)}
        </Text>
      </Stack>
    )
  },
}

/**
 * `annotation` sets a small figure after the main one, part of the same reading: a shootout
 * after a drawn score, games played beside a total. `tone="highlight"` sets one figure on the
 * theme's highlight, like a marker pen, for the figure that's "you" or first.
 */
export const AnnotationAndHighlight: Story = {
  name: 'Annotation and highlight',
  tags: ['docs'],
  render: function AnnotationAndHighlight() {
    return (
      <Stack gap={3}>
        <Text>
          Kelso Bay <Numeral value={1} annotation="(4)" /> – <Numeral value={1} annotation="(3)" />{' '}
          North Point
        </Text>
        <Text>
          Top of the table: <Numeral value={42} tone="highlight" suffix=" pts" />
        </Text>
      </Stack>
    )
  },
}
