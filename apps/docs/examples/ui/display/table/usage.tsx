'use client'

import { Amount, Badge, Table } from '@mitcsutt/kiln-ui'

const ROWS = [
  { route: 'Harbour Square to Kelso Bay', trips: 412, revenue: 1730.4, status: 'On time' },
  { route: 'Old Quay to Northpoint', trips: 288, revenue: 806.4, status: 'On time' },
  { route: 'Marram Point to Harbour Square', trips: 197, revenue: 1280.5, status: 'Delayed' },
]

export default function Usage() {
  return (
    <Table label="Routes this week">
      <Table.Caption>Routes this week</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Route</Table.HeaderCell>
          <Table.HeaderCell numeric>Trips</Table.HeaderCell>
          <Table.HeaderCell numeric>Revenue</Table.HeaderCell>
          <Table.HeaderCell hideBelow="sm">Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {ROWS.map((row) => (
          <Table.Row key={row.route} highlighted={row.status === 'Delayed'}>
            <Table.Cell rowHeader>{row.route}</Table.Cell>
            <Table.Cell numeric>{row.trips}</Table.Cell>
            <Table.Cell numeric>
              <Amount value={row.revenue} currency="GBP" locale="en-GB" />
            </Table.Cell>
            <Table.Cell hideBelow="sm">
              <Badge tone={row.status === 'Delayed' ? 'caution' : 'positive'}>{row.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.Cell rowHeader>Total</Table.Cell>
          <Table.Cell numeric>897</Table.Cell>
          <Table.Cell numeric>
            <Amount value={3817.3} currency="GBP" locale="en-GB" />
          </Table.Cell>
          <Table.Cell hideBelow="sm" />
        </Table.Row>
      </Table.Foot>
    </Table>
  )
}
