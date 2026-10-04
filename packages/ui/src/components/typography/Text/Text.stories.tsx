import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Text, type TextSize, type TextTone } from './Text'

const meta = {
  title: 'UI/Typography/Text',
  component: Text,
  args: {
    children:
      'I build web platforms that teams build on — design systems, internal tools and the slow, careful work of making software easier to change.',
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const SIZES: TextSize[] = ['xl', 'lg', 'md', 'sm', 'xs', '2xs']

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      {SIZES.map((size) => (
        <Text key={size} size={size}>
          {size} — Harbour Hawks open the season against Millpond FC at Harbour Park.
        </Text>
      ))}
    </Stack>
  ),
}

const TONES: TextTone[] = [
  'default',
  'muted',
  'subtle',
  'accent',
  'positive',
  'caution',
  'critical',
]

export const Tones: Story = {
  render: () => (
    <Stack gap={2}>
      {TONES.map((tone) => (
        <Text key={tone} tone={tone} weight={tone === 'default' ? 'medium' : undefined}>
          {tone} — Groceries are 12% under budget this month.
        </Text>
      ))}
    </Stack>
  ),
}

/** `numeric` switches to the theme's figure face with tabular digits, so columns line up. */
export const Numeric: Story = {
  render: () => (
    <Stack gap={1}>
      {[
        ['Rent', '2,340.00'],
        ['Groceries', '611.18'],
        ['Electricity', '148.90'],
        ['Streaming', '41.97'],
      ].map(([label, value]) => (
        <Inline key={label} justify="between" gap={4}>
          <Text as="span" size="sm">
            {label}
          </Text>
          <Text as="span" size="sm" numeric weight="medium">
            {value}
          </Text>
        </Inline>
      ))}
    </Stack>
  ),
}

export const Truncation: Story = {
  render: () => (
    <Stack gap={4}>
      <Text size="sm" truncate>
        Corner Grocer, Market Street — weekly shop, split with housemates, paid back on Sunday
      </Text>
      <Text size="sm" tone="muted" truncate={2}>
        Notes from the 2026 fixtures meeting: eight clubs, fourteen rounds, one pitch booking sheet.
        Home games were spread across the season so no club plays three away in a row. Kofi still
        ended up with two early kick-offs.
      </Text>
    </Stack>
  ),
}

export const Inverse: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--color-surface-inverse)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-surface)',
      }}
    >
      <Text size="lg" weight="strong" tone="inverse">
        Kick-off in 12 minutes: Harbour Hawks v Millpond FC
      </Text>
    </div>
  ),
}

/** `measure` caps a paragraph at a width token — `text` is the comfortable reading length. */
export const Measure: Story = {
  render: () => (
    <Stack gap={5}>
      <Text measure="narrow" tone="muted">
        Eight clubs, fourteen rounds. Every club plays every other club twice, once at home and once
        away, so nobody gets an easy run of fixtures.
      </Text>
      <Text measure="text">
        Zero-based budgeting has one rule: every dollar has a job before the month starts. The best
        tools for it are still a spreadsheet at heart, with better typography and a ledger that
        reconciles itself overnight.
      </Text>
    </Stack>
  ),
}
