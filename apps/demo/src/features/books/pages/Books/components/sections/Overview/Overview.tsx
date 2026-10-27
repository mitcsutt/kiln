import { Sparkline } from '@mitcsutt/kiln-charts'
import { Amount, Delta, Grid, Numeral, Stack, Stat } from '@mitcsutt/kiln-ui'

import type { Ledger } from '#features/books/data/ledger'

/** The figures a treasurer checks first. */
export function Overview({ ledger }: { ledger: Ledger }) {
  const unreconciled = ledger.transactions.filter((t) => !t.reconciled)
  const october = ledger.months.at(-1)
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={6}>
      <Stack gap={2}>
        <Stat
          label="Balance"
          value={<Amount value={ledger.balance} currency="GBP" locale="en-GB" />}
          delta={{
            value: (
              <Numeral
                value={ledger.balanceChange}
                format={{ style: 'percent', maximumFractionDigits: 1 }}
              />
            ),
            direction: 'up',
            tone: 'positive',
          }}
          hint="Since the start of the quarter"
        />
        <Sparkline data={ledger.balanceTrend} label="Balance, last eight weeks" variant="area" />
      </Stack>
      <Stat
        label="October income"
        value={<Amount value={october?.income ?? 0} currency="GBP" locale="en-GB" />}
        hint={
          <Delta direction="up" tone="positive">
            <Amount
              value={(october?.income ?? 0) - (october?.target ?? 0)}
              currency="GBP"
              locale="en-GB"
            />{' '}
            over target
          </Delta>
        }
      />
      <Stat
        label="To reconcile"
        value={<Numeral value={unreconciled.length} />}
        tone={unreconciled.length > 0 ? 'critical' : 'default'}
        hint={
          <Amount
            value={unreconciled.reduce((sum, t) => sum + t.amount, 0)}
            currency="GBP"
            locale="en-GB"
            accounting
          />
        }
      />
    </Grid>
  )
}
