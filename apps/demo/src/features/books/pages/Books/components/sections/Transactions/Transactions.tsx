import {
  Amount,
  Badge,
  DateRangePickerField,
  Inline,
  Stack,
  Switch,
  Table,
  Text,
  type DateRangeValue,
} from '@mitcsutt/kiln-ui'
import { useId, useState } from 'react'

import type { Transaction } from '#features/books/data/ledger'

/** Every movement of money, filterable to what still needs matching against the bank. */
export function Transactions({ transactions }: { transactions: Transaction[] }) {
  const [period, setPeriod] = useState<DateRangeValue>({ start: '2026-10-01', end: '2026-10-31' })
  const [open, setOpen] = useState(false)
  const switchId = useId()
  const shown = transactions
    .filter((t) => (open ? !t.reconciled : true))
    .filter(
      (t) => (!period.start || t.date >= period.start) && (!period.end || t.date <= period.end),
    )
  const total = shown.reduce((sum, t) => sum + t.amount, 0)
  return (
    <Stack gap={4}>
      <Inline gap={4} align="end" justify="between">
        <DateRangePickerField
          label="Period"
          value={period}
          onValueChange={setPeriod}
          presets={[
            { label: 'October', value: { start: '2026-10-01', end: '2026-10-31' } },
            { label: 'This week', value: { start: '2026-10-20', end: '2026-10-26' } },
          ]}
        />
        <Inline gap={2} align="center">
          <Switch id={switchId} checked={open} onCheckedChange={setOpen} />
          <Text as="label" htmlFor={switchId} size="sm">
            Unreconciled only
          </Text>
        </Inline>
      </Inline>
      <Table label="Transactions" density="compact" variant="rules">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell hideBelow="md">Category</Table.HeaderCell>
            <Table.HeaderCell numeric>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {shown.map((t) => (
            <Table.Row key={t.id} highlighted={!t.reconciled}>
              <Table.Cell>{t.date}</Table.Cell>
              <Table.Cell rowHeader>
                <Inline gap={2} align="center">
                  {t.description}
                  {t.reconciled ? null : <Badge tone="caution">Unmatched</Badge>}
                </Inline>
              </Table.Cell>
              <Table.Cell hideBelow="md">{t.category}</Table.Cell>
              <Table.Cell numeric>
                <Amount value={t.amount} currency="GBP" locale="en-GB" accounting tone="auto" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
            <Table.Cell />
            <Table.Cell hideBelow="md" />
            <Table.Cell numeric>
              <Amount value={total} currency="GBP" locale="en-GB" accounting />
            </Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table>
    </Stack>
  )
}
