'use client'

import { Table, type TableSort } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const STOPS = [
  { name: 'Harbour Square', boardings: 1840 },
  { name: 'Kelso Bay Pier', boardings: 960 },
  { name: 'Northpoint Library', boardings: 1325 },
  { name: 'Old Quay', boardings: 410 },
]

export default function Sorting() {
  const [sort, setSort] = useState<TableSort>('desc')
  const rows = [...STOPS].sort((a, b) =>
    sort === 'asc' ? a.boardings - b.boardings : b.boardings - a.boardings,
  )
  return (
    <Table density="compact" label="Boardings by stop">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Stop</Table.HeaderCell>
          <Table.HeaderCell
            numeric
            sort={sort}
            onSort={() => {
              setSort(sort === 'desc' ? 'asc' : 'desc')
            }}
          >
            Boardings
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((stop) => (
          <Table.Row key={stop.name}>
            <Table.Cell rowHeader>{stop.name}</Table.Cell>
            <Table.Cell numeric>{stop.boardings}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
