import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Table, type TableSort } from './Table'

function Projects({ sort, onSort }: { sort: TableSort; onSort: () => void }) {
  return (
    <Table label="Sprint 14 projects">
      <Table.Caption>Sprint 14</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell numeric sort={sort} onSort={onSort}>
            Points
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row highlighted>
          <Table.Cell rowHeader>Atlas redesign</Table.Cell>
          <Table.Cell numeric>7</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

describe('Table', () => {
  it('aligns cells on the baseline by default, with valign to centre them', () => {
    const { rerender } = render(<Table aria-label="Group B" />)
    expect(screen.getByRole('table')).toHaveAttribute('data-valign', 'baseline')
    rerender(<Table aria-label="Group B" valign="middle" />)
    expect(screen.getByRole('table')).toHaveAttribute('data-valign', 'middle')
  })

  it('sets the table and its scroll wrapper on a surface only when asked', () => {
    const body = (
      <Table.Body>
        <Table.Row>
          <Table.Cell>Northwind Studio</Table.Cell>
        </Table.Row>
      </Table.Body>
    )
    const { rerender } = render(<Table label="Invoices">{body}</Table>)
    expect(screen.getByRole('table')).not.toHaveAttribute('data-surface')
    expect(screen.getByRole('region')).not.toHaveAttribute('data-surface')
    rerender(
      <Table label="Invoices" surface="surface">
        {body}
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveAttribute('data-surface', 'surface')
    expect(screen.getByRole('region')).toHaveAttribute('data-surface', 'surface')
  })

  it('forwards the ref to the table and labels the scroll region', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <Table ref={ref} label="Invoices" density="compact">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Northwind Studio</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const table = screen.getByRole('table')
    expect(ref.current).toBe(table)
    expect(table).toHaveAttribute('data-density', 'compact')
    const region = screen.getByRole('region', { name: 'Invoices' })
    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('renders a sort button and maps sort to aria-sort on the header cell', async () => {
    const onSort = vi.fn()
    const { rerender } = render(<Projects sort="none" onSort={onSort} />)
    const header = screen.getByRole('columnheader', { name: 'Points' })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(screen.getByRole('button', { name: 'Points' }))
    expect(onSort).toHaveBeenCalledTimes(1)

    rerender(<Projects sort="desc" onSort={onSort} />)
    expect(screen.getByRole('columnheader', { name: 'Points' })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    rerender(<Projects sort="asc" onSort={onSort} />)
    expect(screen.getByRole('columnheader', { name: 'Points' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
  })

  it('leaves plain headers without a button or aria-sort', () => {
    render(<Projects sort="none" onSort={() => undefined} />)
    const project = screen.getByRole('columnheader', { name: 'Project' })
    expect(project).not.toHaveAttribute('aria-sort')
    expect(project.querySelector('button')).toBeNull()
    expect(project).toHaveAttribute('scope', 'col')
  })

  it('renders row headers, numeric alignment and highlighted rows', () => {
    render(<Projects sort="none" onSort={() => undefined} />)
    const rowHeader = screen.getByRole('rowheader', { name: 'Atlas redesign' })
    expect(rowHeader).toHaveAttribute('scope', 'row')
    const points = screen.getByRole('cell', { name: '7' })
    expect(points).toHaveAttribute('data-numeric')
    expect(points).toHaveAttribute('data-align', 'end')
    expect(rowHeader.closest('tr')).toHaveAttribute('data-highlighted')
  })

  it('hides cells below a breakpoint and sizes header columns', () => {
    render(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="fill">Project</Table.HeaderCell>
            <Table.HeaderCell numeric width="min" hideBelow="md">
              Bugs
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell rowHeader>Atlas redesign</Table.Cell>
            <Table.Cell numeric hideBelow="md">
              5
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const project = screen.getByRole('columnheader', { name: 'Project' })
    const bugs = screen.getByRole('columnheader', { name: 'Bugs' })
    expect(project).toHaveAttribute('data-width', 'fill')
    expect(bugs).toHaveAttribute('data-width', 'min')
    expect(bugs.className).toMatch(/hideBelowMd/)
    expect(screen.getByRole('cell', { name: '5' }).className).toMatch(/hideBelowMd/)
    expect(project.className).not.toMatch(/hideBelow/)
  })

  it('marks the wrapper as a library component so Prose leaves it alone', () => {
    const { container } = render(
      <Table>
        <Table.Body />
      </Table>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-kiln-component')
  })

  it('marks muted rows and draws a categorical rail', () => {
    render(
      <Table aria-label="Standings">
        <Table.Body>
          <Table.Row color={2}>
            <Table.Cell>Kelso Bay</Table.Cell>
          </Table.Row>
          <Table.Row muted>
            <Table.Cell>North Point</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const [owned, out] = screen.getAllByRole('row')
    expect(owned).toHaveAttribute('data-color', '2')
    expect(out).toHaveAttribute('data-muted')
  })
})
