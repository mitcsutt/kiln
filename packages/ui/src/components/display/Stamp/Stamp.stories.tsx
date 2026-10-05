import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Text } from '#components/typography/Text'
import { Card } from '#components/display/Card'
import { Grid } from '#components/layout/Grid'
import { Stamp } from './Stamp'

const meta = {
  title: 'UI/Display/Stamp',
  component: Stamp,
  args: { children: 'Rejected', tone: 'critical', rotate: -6, size: 'md' },
} satisfies Meta<typeof Stamp>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const invoices = [
  { name: 'INV-1042 · Northwind Studio', owner: 'Priya', amount: '$4,200.00', overdue: false },
  { name: 'INV-1041 · Brightline Labs', owner: 'Tomás', amount: '$8,650.00', overdue: false },
  { name: 'INV-1039 · Orchard & Co', owner: 'Hana', amount: '$1,240.00', overdue: true },
  { name: 'INV-1036 · Fernhill Press', owner: 'Sam', amount: '$960.50', overdue: true },
]

/**
 * An invoice run, composed from plain markup. The stamp sits on the row it
 * judges; the rest of the row steps back.
 */
export const OverdueInvoiceRow: Story = {
  render: () => (
    <Stack as="ul" gap={3} dividers>
      {invoices.map((t) => (
        <li key={t.name}>
          <Inline gap={4} justify="between" wrap={false}>
            <Stack gap={1}>
              <Text as="strong" weight="strong" tone={t.overdue ? 'muted' : undefined}>
                {t.name}
              </Text>
              <Text as="span" size="sm" tone="muted">
                Owner: {t.owner}
              </Text>
            </Stack>
            <Inline gap={4} wrap={false}>
              {t.overdue ? (
                <Stamp size="sm" aria-label={`${t.name} overdue`}>
                  Overdue
                </Stamp>
              ) : null}
              <Text as="span" numeric>
                {t.amount}
              </Text>
            </Inline>
          </Inline>
        </li>
      ))}
    </Stack>
  ),
}

export const Tones: Story = {
  render: () => (
    <Inline gap={6}>
      <Stamp tone="critical">Rejected</Stamp>
      <Stamp tone="positive" rotate={4}>
        Paid
      </Stamp>
      <Stamp tone="accent" rotate={-3}>
        Approved
      </Stamp>
      <Stamp tone="caution" rotate={5}>
        Overdue
      </Stamp>
      <Stamp tone="info" rotate={-8}>
        Shipped
      </Stamp>
      <Stamp tone="neutral" rotate={0}>
        Void
      </Stamp>
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={6}>
      <Stamp size="sm">Approved</Stamp>
      <Stamp size="md">Approved</Stamp>
      <Stamp size="lg">Signed off</Stamp>
    </Inline>
  ),
}

/**
 * `placement="corner"` pins the stamp to the top-end of the nearest positioned ancestor —
 * Card is one — so stamping an invoice's card doesn't change its height or push its content.
 */
export const OnACard: Story = {
  render: () => (
    <Grid columns={2} gap={4} style={{ maxWidth: '44rem' }}>
      <Card>
        <Card.Header>
          <Card.Title>INV-1039 · Orchard & Co</Card.Title>
        </Card.Header>
        <Card.Description>Due 30 Sep · $1,240.00 · two reminders sent</Card.Description>
        <Stamp placement="corner" size="sm" rotate={-8} aria-label="INV-1039 overdue">
          Overdue
        </Stamp>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title>INV-1042 · Northwind Studio</Card.Title>
        </Card.Header>
        <Card.Description>Paid 2 Oct · $4,200.00 · settled by card</Card.Description>
        <Stamp placement="corner" size="sm" tone="positive" rotate={5}>
          Paid
        </Stamp>
      </Card>
    </Grid>
  ),
}
