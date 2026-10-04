import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Table, type TableSort } from './Table'

function Standings({ sort, onSort }: { sort: TableSort; onSort: () => void }) {
  return (
    <Table label="Group B standings">
      <Table.Caption>Group B</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Team</Table.HeaderCell>
          <Table.HeaderCell numeric sort={sort} onSort={onSort}>
            Pts
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row highlighted>
          <Table.Cell rowHeader>Canada</Table.Cell>
          <Table.Cell numeric>7</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

describe('Table', () => {
  it('forwards the ref to the table and labels the scroll region', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <Table ref={ref} label="Transactions" density="compact">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Corner Grocer</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const table = screen.getByRole('table')
    expect(ref.current).toBe(table)
    expect(table).toHaveAttribute('data-density', 'compact')
    const region = screen.getByRole('region', { name: 'Transactions' })
    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('renders a sort button and maps sort to aria-sort on the header cell', async () => {
    const onSort = vi.fn()
    const { rerender } = render(<Standings sort="none" onSort={onSort} />)
    const header = screen.getByRole('columnheader', { name: 'Pts' })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(screen.getByRole('button', { name: 'Pts' }))
    expect(onSort).toHaveBeenCalledTimes(1)

    rerender(<Standings sort="desc" onSort={onSort} />)
    expect(screen.getByRole('columnheader', { name: 'Pts' })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    rerender(<Standings sort="asc" onSort={onSort} />)
    expect(screen.getByRole('columnheader', { name: 'Pts' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
  })

  it('leaves plain headers without a button or aria-sort', () => {
    render(<Standings sort="none" onSort={() => undefined} />)
    const team = screen.getByRole('columnheader', { name: 'Team' })
    expect(team).not.toHaveAttribute('aria-sort')
    expect(team.querySelector('button')).toBeNull()
    expect(team).toHaveAttribute('scope', 'col')
  })

  it('renders row headers, numeric alignment and highlighted rows', () => {
    render(<Standings sort="none" onSort={() => undefined} />)
    const rowHeader = screen.getByRole('rowheader', { name: 'Canada' })
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
            <Table.HeaderCell width="fill">Team</Table.HeaderCell>
            <Table.HeaderCell numeric width="min" hideBelow="md">
              GF
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell rowHeader>Canada</Table.Cell>
            <Table.Cell numeric hideBelow="md">
              5
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const team = screen.getByRole('columnheader', { name: 'Team' })
    const gf = screen.getByRole('columnheader', { name: 'GF' })
    expect(team).toHaveAttribute('data-width', 'fill')
    expect(gf).toHaveAttribute('data-width', 'min')
    expect(gf.className).toMatch(/hideBelowMd/)
    expect(screen.getByRole('cell', { name: '5' }).className).toMatch(/hideBelowMd/)
    expect(team.className).not.toMatch(/hideBelow/)
  })

  it('marks the wrapper as a library component so Prose leaves it alone', () => {
    const { container } = render(
      <Table>
        <Table.Body />
      </Table>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-kiln-component')
  })
})
