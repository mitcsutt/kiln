import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, Text } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import type { TextSize, TextTone } from './Text'

const meta = {
  title: 'UI/Typography/Text',
  component: Text,
  args: {
    children:
      'Plan releases, track tasks and send invoices from one workspace — built for small teams that would rather ship than sit in status meetings.',
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
          {size} — Release 2.4 ships on Thursday with the new billing settings.
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
          {tone} — Storage use is 12% under quota this month.
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
        ['Design', '2,340.00'],
        ['Development', '611.18'],
        ['Hosting', '148.90'],
        ['Software', '41.97'],
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
        Northwind Studio, invoice 1042 — design retainer for September, net 14, reminder sent on
        Monday
      </Text>
      <Text size="sm" tone="muted" truncate={2}>
        Notes from the planning meeting: the billing migration moves to March, the help centre gets
        two more writers, and the mobile app beta opens to forty customers next week. Sam owns the
        release checklist.
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
        Deploy in 12 minutes: release 2.4 to production
      </Text>
    </div>
  ),
}

/** `measure` caps a paragraph at a width token — `text` is the comfortable reading length. */
export const Measure: Story = {
  render: () => (
    <Stack gap={5}>
      <Text measure="narrow" tone="muted">
        Every pull request gets two reviews before it merges, so nothing reaches production unseen.
      </Text>
      <Text measure="text">
        Good invoicing has one rule: every billable hour has a client before the month ends. The
        best tools for it are still a spreadsheet at heart, with better typography and a ledger that
        reconciles itself overnight.
      </Text>
    </Stack>
  ),
}

/**
 * - `tone` is `default`, `muted`, `subtle`, `accent`, `positive`, `caution`, `critical` or
 *   `inverse`. Status tones use each tone's AA text colour.
 * - `numeric` switches to tabular, lining figures in the theme's numeric face, for times and
 *   counts that line up.
 * - `truncate` cuts to one line with an ellipsis, or to a number of lines (`truncate={2}`).
 * - `measure` caps the line length at a named width (`text` is about 68 characters).
 *
 * For long-form writing with headings, lists and quotes, use [Prose](/docs/ui/typography/prose).
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3}>
        <Text size="lg">The coastal line runs every 20 minutes until midnight.</Text>
        <Text>Bikes travel free outside the morning peak.</Text>
        <Text size="sm" tone="muted">
          Updated 3 minutes ago
        </Text>
        <Text tone="critical" weight="medium">
          Kelso Bay Pier is closed for repairs.
        </Text>
        <Text numeric>Departures: 07:10, 07:30, 07:50</Text>
        <Text truncate={2} measure="narrow">
          Long service notices can be clamped to a number of lines, so a list of them stays even
          when one of the notices runs on much longer than the others do.
        </Text>
      </Stack>
    )
  },
}
