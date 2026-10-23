import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, Tag, TreeTable, type TreeTableColumn } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

const meta = {
  title: 'UI/Display/TreeTable',
  component: TreeTable,
  args: {
    label: 'Sessions',
    columns: [],
    rows: [],
    getRowId: () => '',
    getChildren: () => undefined,
    renderCell: () => null,
  },
} satisfies Meta<typeof TreeTable>

export default meta
type Story = StoryObj<typeof meta>

interface Run {
  id: string
  name: string
  model: string
  tokens: string
  cost: string
  children?: Run[]
}

// Sessions from one invented release pipeline (story data).
const RUNS: Run[] = [
  {
    id: 'release',
    name: 'Release train 14',
    model: 'Planner',
    tokens: '412k',
    cost: '$41.20',
    children: [
      {
        id: 'migrate',
        name: 'Billing migration',
        model: 'Builder',
        tokens: '301k',
        cost: '$30.10',
        children: [
          { id: 'review', name: 'Review pass', model: 'Reviewer', tokens: '64k', cost: '$6.40' },
          { id: 'tests', name: 'Test fixes', model: 'Builder', tokens: '47k', cost: '$4.70' },
        ],
      },
      { id: 'notes', name: 'Release notes', model: 'Writer', tokens: '111k', cost: '$11.10' },
    ],
  },
  { id: 'spike', name: 'Spike: offline sync', model: 'Builder', tokens: '30k', cost: '$3.05' },
  {
    id: 'triage',
    name: 'Support triage',
    model: 'Planner',
    tokens: '88k',
    cost: '$8.80',
    children: [
      { id: 'dupes', name: 'Find duplicates', model: 'Reviewer', tokens: '88k', cost: '$8.80' },
    ],
  },
]

const COLUMNS: TreeTableColumn[] = [
  { id: 'name', header: 'Session', width: 'fill' },
  { id: 'model', header: 'Role', hideBelow: 'sm' },
  { id: 'tokens', header: 'Tokens', numeric: true },
  { id: 'cost', header: 'Cost', numeric: true },
]

function renderRun(run: Run, column: TreeTableColumn) {
  switch (column.id) {
    case 'name':
      return <a href={`#${run.id}`}>{run.name}</a>
    case 'model':
      return <Tag>{run.model}</Tag>
    case 'tokens':
      return run.tokens
    default:
      return run.cost
  }
}

/** A tree of sessions three levels deep. Try the arrow keys, Home, End and Enter. */
export const Playground: Story = {
  render: (args) => (
    <TreeTable<Run>
      {...(args as object)}
      label="Sessions"
      columns={COLUMNS}
      rows={RUNS}
      getRowId={(run) => run.id}
      getChildren={(run) => run.children}
      defaultExpanded={['release']}
      renderCell={renderRun}
    />
  ),
}

/**
 * Sessions in a hierarchy, three levels deep. Each parent has a toggle, the grid is one tab stop,
 * and the arrow keys walk the tree: Right opens a row and steps into it, Left closes it and steps
 * out, and Enter follows the row's link.
 */
export const Sessions: Story = {
  tags: ['docs'],
  render: function Sessions() {
    return (
      <TreeTable<Run>
        label="Sessions"
        columns={COLUMNS}
        rows={RUNS}
        getRowId={(run) => run.id}
        getChildren={(run) => run.children}
        defaultExpanded={['release', 'migrate']}
        renderCell={renderRun}
      />
    )
  },
}

/** Control the open rows to keep them somewhere else, such as the URL, or to open everything at once. */
export const Controlled: Story = {
  tags: ['docs'],
  render: function Controlled() {
    const [expanded, setExpanded] = useState<string[]>(['triage'])
    return (
      <Stack gap={3}>
        <TreeTable<Run>
          label="Sessions, with open rows controlled"
          density="compact"
          columns={COLUMNS}
          rows={RUNS}
          getRowId={(run) => run.id}
          getChildren={(run) => run.children}
          expanded={expanded}
          onExpandedChange={setExpanded}
          renderCell={renderRun}
        />
        <p>{expanded.length} open</p>
      </Stack>
    )
  },
}

/** Drives the keyboard: open a row, step in twice to reach the third level, and back out. */
export const Keyboard: Story = {
  render: () => (
    <TreeTable<Run>
      label="Sessions"
      columns={COLUMNS}
      rows={RUNS}
      getRowId={(run) => run.id}
      getChildren={(run) => run.children}
      renderCell={renderRun}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    const release = canvas.getByRole('row', { name: /Release train 14/ })
    await expect(release).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
    const review = canvas.getByRole('row', { name: /Review pass/ })
    await expect(review).toHaveFocus()
    await expect(review).toHaveAttribute('aria-level', '3')
    await userEvent.keyboard('{ArrowLeft}')
    await expect(canvas.getByRole('row', { name: /Billing migration/ })).toHaveFocus()
  },
}
