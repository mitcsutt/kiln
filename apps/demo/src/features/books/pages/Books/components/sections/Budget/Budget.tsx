import { Amount, Meter, TreeTable, type TreeTableColumn } from '@mitcsutt/kiln-ui'

import type { BudgetLine } from '#features/books/data/ledger'

const COLUMNS: TreeTableColumn[] = [
  { id: 'name', header: 'Line' },
  { id: 'budget', header: 'Budget', numeric: true, hideBelow: 'sm' },
  { id: 'spent', header: 'Spent', numeric: true },
  { id: 'used', header: 'Used', width: 'bar', hideBelow: 'md' },
]

function renderCell(line: BudgetLine, column: TreeTableColumn) {
  if (column.id === 'budget') return <Amount value={line.budget} currency="GBP" locale="en-GB" />
  if (column.id === 'spent') return <Amount value={line.spent} currency="GBP" locale="en-GB" />
  if (column.id === 'used') {
    const used = Math.round((line.spent / line.budget) * 100)
    return (
      <Meter
        aria-label={`${line.name}: ${String(used)}% used`}
        value={used}
        max={100}
        showValue={false}
        size="sm"
        tone={used > 85 ? 'caution' : 'positive'}
      />
    )
  }
  return line.name
}

/** The year's budget, line by line, with the lines inside each heading. */
export function Budget({ budget }: { budget: BudgetLine[] }) {
  return (
    <TreeTable<BudgetLine>
      label="Budget for 2026"
      valign="middle"
      columns={COLUMNS}
      rows={budget}
      getRowId={(line) => line.id}
      getChildren={(line) => line.children}
      defaultExpanded={['kilns']}
      renderCell={renderCell}
    />
  )
}
