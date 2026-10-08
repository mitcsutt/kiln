import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { List } from './List'

describe('List', () => {
  it('is a list of list items and forwards refs', () => {
    const ref = createRef<HTMLUListElement>()
    render(
      <List ref={ref} density="compact">
        <List.Item>
          <List.Content>Atlas redesign</List.Content>
        </List.Item>
        <List.Item>
          <List.Content>Billing migration</List.Content>
        </List.Item>
      </List>,
    )
    const list = screen.getByRole('list')
    expect(ref.current).toBe(list)
    expect(list).toHaveAttribute('data-density', 'compact')
    expect(list).toHaveAttribute('data-divided')
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('sets the list on a surface only when asked', () => {
    const { rerender } = render(<List aria-label="Standings" />)
    expect(screen.getByRole('list')).not.toHaveAttribute('data-surface')
    rerender(<List aria-label="Standings" surface="raised" />)
    expect(screen.getByRole('list')).toHaveAttribute('data-surface', 'raised')
    rerender(<List aria-label="Standings" surface="none" />)
    expect(screen.getByRole('list')).not.toHaveAttribute('data-surface')
  })

  it('renders an ordered list when as="ol"', () => {
    const { container } = render(<List as="ol" />)
    expect(container.querySelector('ol')).toHaveAttribute('role', 'list')
  })

  it('makes the whole row a single link with asChild — inside the li, no nested anchors', () => {
    render(
      <List>
        <List.Item asChild highlighted>
          <a href="/members/priya">
            <List.Leading>1</List.Leading>
            <List.Content>
              Priya<List.Description>Atlas redesign, Help centre</List.Description>
            </List.Content>
            <List.Trailing>42</List.Trailing>
          </a>
        </List.Item>
      </List>,
    )
    const item = screen.getByRole('listitem')
    const link = within(item).getByRole('link')
    expect(link).toHaveAttribute('href', '/members/priya')
    expect(link).toHaveTextContent('Priya')
    expect(link).toHaveTextContent('42')
    expect(link.querySelector('a')).toBeNull()
    expect(item).toHaveAttribute('data-interactive')
    expect(item).toHaveAttribute('data-highlighted')
  })

  it('supports a button row that is keyboard operable', async () => {
    const onClick = vi.fn()
    render(
      <List>
        <List.Item asChild>
          <button type="button" onClick={onClick}>
            <List.Content>Invoices</List.Content>
          </button>
        </List.Item>
      </List>,
    )
    const button = screen.getByRole('button', { name: 'Invoices' })
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders static rows without interactive affordance', () => {
    render(
      <List divided={false}>
        <List.Item selected>
          <List.Content>Settings</List.Content>
        </List.Item>
      </List>,
    )
    const item = screen.getByRole('listitem')
    expect(item).not.toHaveAttribute('data-interactive')
    expect(item).toHaveAttribute('data-selected')
    expect(screen.getByRole('list')).not.toHaveAttribute('data-divided')
  })

  it('renders slots as divs, so block content fits, and as spans inside a link or button row', () => {
    render(
      <List>
        <List.Item>
          <List.Leading>1</List.Leading>
          <List.Content>
            Kelso Bay<List.Description>Ferry terminal</List.Description>
          </List.Content>
          <List.Trailing>9</List.Trailing>
        </List.Item>
        <List.Item asChild>
          <button type="button">
            <List.Content>North Point</List.Content>
            <List.Trailing>6</List.Trailing>
          </button>
        </List.Item>
      </List>,
    )
    const tags = (text: string) => screen.getByText(text).tagName
    expect([tags('1'), tags('Ferry terminal'), tags('9')]).toEqual(['DIV', 'DIV', 'DIV'])
    expect([tags('North Point'), tags('6')]).toEqual(['SPAN', 'SPAN'])
  })

  it('marks muted rows and draws a categorical rail', () => {
    render(
      <List>
        <List.Item color={3}>
          <List.Content>Kelso Bay</List.Content>
        </List.Item>
        <List.Item muted>
          <List.Content>North Point</List.Content>
        </List.Item>
      </List>,
    )
    const [owned, out] = screen.getAllByRole('listitem')
    expect(owned).toHaveAttribute('data-color', '3')
    expect(owned).not.toHaveAttribute('data-muted')
    expect(out).toHaveAttribute('data-muted')
    expect(out).not.toHaveAttribute('data-color')
  })
})
