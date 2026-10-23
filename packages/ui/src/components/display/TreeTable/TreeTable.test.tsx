import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { createRef, useState } from 'react'
import { must } from '#test/must'
import { TreeTable, type TreeTableColumn } from './TreeTable'

interface Item {
  id: string
  name: string
  cost: string
  children?: Item[]
}

const DATA: Item[] = [
  {
    id: 'release',
    name: 'Release train',
    cost: '$41.20',
    children: [
      {
        id: 'planner',
        name: 'Planner session',
        cost: '$30.10',
        children: [
          { id: 'review', name: 'Review subagent', cost: '$6.40' },
          { id: 'tests', name: 'Test subagent', cost: '$4.70' },
        ],
      },
      { id: 'docs', name: 'Docs session', cost: '$11.10' },
    ],
  },
  { id: 'spike', name: 'Spike', cost: '$3.05' },
]

const COLUMNS: TreeTableColumn[] = [
  { id: 'name', header: 'Session', width: 'fill' },
  { id: 'cost', header: 'Cost', numeric: true },
]

function Demo({ onOpen }: { onOpen?: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string[]>([])
  return (
    <TreeTable
      label="Sessions"
      columns={COLUMNS}
      rows={DATA}
      getRowId={(row) => row.id}
      getChildren={(row) => row.children}
      expanded={expanded}
      onExpandedChange={setExpanded}
      renderCell={(row, column) =>
        column.id === 'name' ? (
          <a
            href={`/sessions/${row.id}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen?.(row.id)
            }}
          >
            {row.name}
          </a>
        ) : (
          row.cost
        )
      }
    />
  )
}

const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) })

describe('TreeTable', () => {
  it('is a labelled treegrid with the level, set size and position on every row', () => {
    render(<Demo />)
    expect(screen.getByRole('treegrid', { name: 'Sessions' })).toBeInTheDocument()
    const release = row('Release train')
    expect(release).toHaveAttribute('aria-level', '1')
    expect(release).toHaveAttribute('aria-setsize', '2')
    expect(release).toHaveAttribute('aria-posinset', '1')
    expect(release).toHaveAttribute('aria-expanded', 'false')
    expect(row('Spike')).toHaveAttribute('aria-posinset', '2')
    expect(row('Spike')).not.toHaveAttribute('aria-expanded')
  })

  it('has one tab stop, and links stay out of the tab order', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    expect(screen.getAllByRole('row').filter((r) => r.tabIndex === 0)).toHaveLength(1)
    await user.tab()
    expect(row('Release train')).toHaveFocus()
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it('navigates three levels by keyboard alone', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<Demo onOpen={onOpen} />)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(row('Release train')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Release train')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(row('Planner session')).toHaveFocus()
    expect(row('Planner session')).toHaveAttribute('aria-level', '2')
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(row('Review subagent')).toHaveFocus()
    expect(row('Review subagent')).toHaveAttribute('aria-level', '3')
    expect(row('Review subagent')).toHaveAttribute('aria-setsize', '2')
    await user.keyboard('{ArrowDown}')
    expect(row('Test subagent')).toHaveFocus()
    expect(row('Test subagent')).toHaveAttribute('aria-posinset', '2')
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledWith('tests')
    await user.keyboard('{ArrowUp}{ArrowLeft}')
    expect(row('Planner session')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(row('Planner session')).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{ArrowLeft}')
    expect(row('Release train')).toHaveFocus()
  })

  it('jumps with Home and End and stops at the ends', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.tab()
    await user.keyboard('{End}')
    expect(row('Spike')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(row('Spike')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(row('Release train')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(row('Release train')).toHaveFocus()
  })

  it('opens and closes a row from its toggle with the mouse', async () => {
    const user = userEvent.setup()
    const { container } = render(<Demo />)
    const toggle = must(container.querySelector<HTMLElement>('tbody tr button'))
    await user.click(toggle)
    expect(row('Release train')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Release train')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(row('Planner session')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByText('Docs session')).toBeInTheDocument()
    await user.click(toggle)
    expect(screen.queryByText('Docs session')).not.toBeInTheDocument()
  })

  it('stays on an open row whose children have not loaded', async () => {
    const user = userEvent.setup()
    render(
      <TreeTable
        label="Sessions"
        columns={COLUMNS}
        rows={[
          { id: 'lazy', name: 'Lazy', cost: '$1' },
          { id: 'next', name: 'Next', cost: '$2' },
        ]}
        getRowId={(row) => row.id}
        getChildren={() => undefined}
        hasChildren={(row) => row.id === 'lazy'}
        defaultExpanded={['lazy']}
        renderCell={(row, column) => (column.id === 'name' ? row.name : row.cost)}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(row('Lazy')).toHaveFocus()
  })

  it('starts with defaultExpanded rows open when uncontrolled', () => {
    render(
      <TreeTable
        label="Sessions"
        columns={COLUMNS}
        rows={DATA}
        getRowId={(r) => r.id}
        getChildren={(r) => r.children}
        defaultExpanded={['release', 'planner']}
        renderCell={(r) => r.name}
      />,
    )
    expect(screen.getAllByRole('row')).toHaveLength(1 + 6)
  })

  it('forwards the ref to the table', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <TreeTable
        ref={ref}
        label="Sessions"
        columns={COLUMNS}
        rows={DATA}
        getRowId={(r) => r.id}
        getChildren={(r) => r.children}
        renderCell={(r) => r.name}
      />,
    )
    expect(ref.current).toBe(screen.getByRole('treegrid'))
  })

  it('passes axe, closed and fully open', async () => {
    const { container } = render(
      <TreeTable
        label="Sessions"
        columns={COLUMNS}
        rows={DATA}
        getRowId={(r) => r.id}
        getChildren={(r) => r.children}
        defaultExpanded={['release', 'planner']}
        renderCell={(r, c) => (c.id === 'name' ? <a href={`/${r.id}`}>{r.name}</a> : r.cost)}
      />,
    )
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    })
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
})
