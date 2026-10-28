import {
  Amount,
  Button,
  Card,
  Code,
  Grid,
  Inline,
  Stack,
  Stamp,
  Text,
  useClipboard,
} from '@mitcsutt/kiln-ui'

import type { Invoice } from '#features/books/data/ledger'

const STAMPS = {
  paid: { tone: 'positive', label: 'Paid' },
  overdue: { tone: 'critical', label: 'Overdue' },
  draft: { tone: 'neutral', label: 'Draft' },
} as const

/** Invoices out to schools and cafés, stamped with where they stand. */
export function Invoices({ invoices }: { invoices: Invoice[] }) {
  const { copy, copied } = useClipboard({ timeout: 2000 })
  return (
    <Grid minItemWidth="sm" gap={4}>
      {invoices.map((invoice) => (
        <Card key={invoice.id} variant="outline">
          <Card.Header>
            <Card.Title>{invoice.client}</Card.Title>
            <Card.Meta>Due {invoice.due}</Card.Meta>
          </Card.Header>
          <Card.Body>
            <Stack gap={2}>
              <Amount value={invoice.amount} currency="GBP" locale="en-GB" size="2xl" />
              <Inline gap={2} align="center">
                <Code>{invoice.id}</Code>
                <Button
                  size="sm"
                  variant="ghost"
                  tone="neutral"
                  onClick={() => {
                    void copy(invoice.id)
                  }}
                >
                  Copy reference
                </Button>
              </Inline>
            </Stack>
          </Card.Body>
          <Stamp
            placement="corner"
            tone={STAMPS[invoice.status].tone}
            aria-label={`${invoice.id} ${STAMPS[invoice.status].label}`}
          >
            {STAMPS[invoice.status].label}
          </Stamp>
        </Card>
      ))}
      <Text size="sm" tone="muted" role="status">
        {copied ? 'Reference copied' : ''}
      </Text>
    </Grid>
  )
}
