import { BarList, Bars, Chart, ChartColorScope, ChartLegend, Share } from '@mitcsutt/kiln-charts'
import { Card, Grid, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import type { Ledger } from '#features/books/data/ledger'

const SOURCES = {
  memberships: 'Memberships',
  firings: 'Firing fees',
  workshops: 'Workshops',
  gallery: 'Gallery',
}

/** Income and costs over the half year, and where the money comes from. */
export function Trends({ ledger }: { ledger: Ledger }) {
  const [hidden, setHidden] = useState<string[]>([])
  return (
    <ChartColorScope order={['income', 'costs']}>
      <Grid columns={{ base: 1, lg: 2 }} gap={5}>
        <Card variant="outline">
          <Card.Body>
            <Stack gap={4}>
              <Chart
                data={ledger.months.map((month) => ({ ...month }))}
                x="month"
                xFormat="month"
                label="Income against target, last six months"
                format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
                locale="en-GB"
                height={240}
              >
                <Chart.Grid />
                <Chart.XAxis />
                <Chart.YAxis format="compact" />
                {hidden.includes('income') ? null : <Chart.Bar dataKey="income" />}
                {hidden.includes('target') ? null : (
                  <Chart.Line dataKey="target" variant="dashed" color="neutral" />
                )}
                <Chart.Tooltip />
              </Chart>
              <ChartLegend
                items={[
                  {
                    key: 'income',
                    label: 'Income',
                    color: 'cat-1',
                    hidden: hidden.includes('income'),
                  },
                  {
                    key: 'target',
                    label: 'Target',
                    color: 'neutral',
                    shape: 'dashed',
                    hidden: hidden.includes('target'),
                  },
                ]}
                onToggleSeries={(key) => {
                  setHidden((keys) =>
                    keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
                  )
                }}
              />
            </Stack>
          </Card.Body>
        </Card>
        <Card variant="outline">
          <Card.Body>
            <Bars
              data={ledger.months.map((month) => ({ ...month, month: month.month.slice(0, 7) }))}
              x="month"
              series={[
                { key: 'income', label: 'Income' },
                { key: 'costs', label: 'Costs' },
              ]}
              label="Income and costs by month"
              height={240}
            />
          </Card.Body>
        </Card>
        <Card variant="outline">
          <Card.Body>
            <Share
              data={[ledger.incomeBySource]}
              labels={SOURCES}
              label="Income by source, October"
              totalLabel="pounds"
            />
          </Card.Body>
        </Card>
        <Card variant="outline">
          <Card.Body>
            <BarList
              data={ledger.transactions
                .filter((t) => t.amount > 0)
                .map((t) => ({ item: t.description, amount: t.amount }))}
              pivot={{ by: 'item', value: 'amount' }}
              label="Largest takings this week"
            />
          </Card.Body>
        </Card>
      </Grid>
    </ChartColorScope>
  )
}
