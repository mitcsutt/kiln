import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Text } from '#components/typography/Text'
import { Amount } from './Amount'

const meta = {
  title: 'UI/Typography/Amount',
  component: Amount,
  args: { value: 1017.4, currency: 'AUD', size: 'display-md' },
} satisfies Meta<typeof Amount>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const LEDGER = [
  { label: 'Salary', value: 6240 },
  { label: 'Rent', value: -2340 },
  { label: 'Groceries', value: -611.18 },
  { label: 'Electricity', value: -148.9 },
  { label: 'Tax refund', value: 812.55 },
  { label: 'Streaming', value: -41.97 },
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
          Left over
        </Text>
        <Text as="span" size="sm" weight="strong">
          <Amount value={3920.5} accounting />
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
        Overspent: <Amount value={-82.4} tone="auto" />
      </Text>
      <Text>
        Whole dollars: <Amount value={5200} precision={0} />
      </Text>
      <Text>
        Compact: <Amount value={1284500} compact /> net worth
      </Text>
      <Text>
        Other currency: <Amount value={380} currency="USD" /> match tickets
      </Text>
    </Stack>
  ),
}

/** The hero of the budget screen: this month's balance, not a stat row with a gradient. */
export const Hero: Story = {
  render: () => (
    <Stack gap={2}>
      <Text size="sm" tone="muted">
        Left to spend in September
      </Text>
      <Amount value={1017.4} size="display-md" />
      <Text size="sm" tone="muted">
        <Amount value={4182.6} /> of <Amount value={5200} precision={0} /> spent
      </Text>
    </Stack>
  ),
}
