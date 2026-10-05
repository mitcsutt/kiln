import type { Meta, StoryObj } from '@storybook/react-vite'
import { Amount, Stack } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Text } from '#components/typography/Text'

const meta = {
  title: 'UI/Typography/Amount',
  component: Amount,
  args: { value: 1017.4, currency: 'AUD', size: 'display-md' },
} satisfies Meta<typeof Amount>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const LEDGER = [
  { label: 'Client payments', value: 6240 },
  { label: 'Office lease', value: -2340 },
  { label: 'Contractors', value: -611.18 },
  { label: 'Hosting', value: -148.9 },
  { label: 'Tax refund', value: 812.55 },
  { label: 'Software', value: -41.97 },
]

/** Accounting style: negatives in parentheses and red; positives keep a hidden ")" so digits align. */
export const Accounting: Story = {
  render: () => (
    <Stack gap={2} style={{ maxWidth: '20rem' }}>
      {LEDGER.map(({ label, value }) => (
        <Inline key={label} justify="between" gap={4}>
          <Text as="span" size="sm">
            {label}
          </Text>
          <Text as="span" size="sm">
            <Amount value={value} accounting />
          </Text>
        </Inline>
      ))}
      <Inline justify="between" gap={4}>
        <Text as="span" size="sm" weight="strong">
          Net
        </Text>
        <Text as="span" size="sm" weight="strong">
          <Amount value={3910.5} accounting />
        </Text>
      </Inline>
    </Stack>
  ),
}

export const Variants: Story = {
  render: () => (
    <Stack gap={3}>
      <Text>
        Default: <Amount value={4182.6} />
      </Text>
      <Text>
        Signed change: <Amount value={218.4} showSign tone="auto" /> vs August
      </Text>
      <Text>
        Refund issued: <Amount value={-82.4} tone="auto" />
      </Text>
      <Text>
        Whole dollars: <Amount value={5200} precision={0} />
      </Text>
      <Text>
        Compact: <Amount value={1284500} compact /> annual revenue
      </Text>
      <Text>
        Other currency: <Amount value={380} currency="USD" /> conference tickets
      </Text>
    </Stack>
  ),
}

/** The hero of the billing screen: this month's outstanding balance, not a stat row with a gradient. */
export const Hero: Story = {
  render: () => (
    <Stack gap={2}>
      <Text size="sm" tone="muted">
        Outstanding in September
      </Text>
      <Amount value={1017.4} size="display-md" />
      <Text size="sm" tone="muted">
        <Amount value={4182.6} /> of <Amount value={5200} precision={0} /> collected
      </Text>
    </Stack>
  ),
}

/**
 * - `currency` (default `AUD`) and `locale` (default `en-AU`). A currency the locale has no symbol
 *   for shows its narrow symbol when that's unambiguous, and its ISO code otherwise.
 * - `accounting` shows a negative as `($1,234.50)` in the critical tone.
 * - `showSign` adds a plus to positive values; `tone="auto"` colours both signs.
 * - `compact` abbreviates large values (`$2.5M`), and `precision` sets the decimal places.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3} align="start">
        <Amount value={1234.5} />
        <Amount value={42} currency="GBP" locale="en-GB" />
        <Amount value={-86.2} currency="EUR" locale="de-DE" />
        <Amount value={-1234.5} accounting />
        <Amount value={312.75} showSign tone="auto" />
        <Amount value={2450000} compact />
        <Amount value={96} currency="GBP" locale="en-GB" size="display-sm" />
      </Stack>
    )
  },
}
