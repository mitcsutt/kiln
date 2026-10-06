import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tag, TagList } from './Tag'

describe('Tag', () => {
  it('renders a remove button named after the tag that calls onRemove', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>Design</Tag>)
    const button = screen.getByRole('button', { name: 'Remove Design' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('accepts a custom remove label for non-text children', () => {
    render(
      <Tag onRemove={() => undefined} removeLabel="Remove filter: Overdue">
        <span>Overdue</span>
      </Tag>,
    )
    expect(screen.getByRole('button', { name: 'Remove filter: Overdue' })).toBeInTheDocument()
  })

  it('has no remove button without onRemove, and exposes the colour slot', () => {
    const { container } = render(<Tag color={4}>Marketing</Tag>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('data-color', '4')
  })

  it('renders its child when asChild and never nests a button inside a link', () => {
    render(
      <Tag asChild onRemove={() => undefined}>
        <a href="/articles?topic=typescript">TypeScript</a>
      </Tag>,
    )
    expect(screen.getByRole('link', { name: 'TypeScript' })).toHaveAttribute(
      'href',
      '/articles?topic=typescript',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('TagList', () => {
  it('wraps each tag in a list item', () => {
    render(
      <TagList aria-label="Stack">
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        {null}
      </TagList>,
    )
    expect(screen.getByRole('list', { name: 'Stack' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('takes a small size for dense lists', () => {
    render(<Tag size="sm">Kelso Bay</Tag>)
    expect(screen.getByText('Kelso Bay')).toHaveAttribute('data-size', 'sm')
  })
})
