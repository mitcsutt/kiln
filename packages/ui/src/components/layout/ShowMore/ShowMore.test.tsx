import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { must } from '#test/must'
import { ShowMore } from './ShowMore'

const TAGS = ['Invoices', 'Payroll', 'VAT', 'Expenses', 'Receipts', 'Payouts']

function Tags(props: Partial<Parameters<typeof ShowMore>[0]>) {
  return (
    <ShowMore maxItems={4} {...props}>
      <ul>
        {TAGS.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </ShowMore>
  )
}

/** jsdom has no layout: give the clamp probe and the content the sizes a browser would. */
function fakeLayout({ clamp, content }: { clamp: number; content: number }) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const height = this.classList.contains('probe')
      ? clamp
      : this.classList.contains('clip')
        ? clamp
        : this.tagName === 'A'
          ? 20
          : 0
    const top = this.tagName === 'A' ? clamp + 10 : 0
    return {
      top,
      bottom: top + height,
      height,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
    } as DOMRect
  })
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.classList.contains('clip') ? content : 0
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ShowMore', () => {
  it('shows the first maxItems items and says how many more there are', async () => {
    const { container } = render(<Tags />)
    const toggle = screen.getByRole('button', { name: 'Show 2 more' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const clip = must(container.querySelector('[data-show-more]'))
    expect(toggle).toHaveAttribute('aria-controls', clip.id)
    const rule = must(container.querySelector('style')).textContent
    expect(rule).toContain(':nth-child(n+5){display:none}')
    expect(rule).toContain(`[data-show-more="${String(clip.getAttribute('data-show-more'))}"]`)

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Show less')
    expect(container.querySelector('style')).not.toBeInTheDocument()
  })

  it('renders short content plain, with no toggle', () => {
    render(<Tags maxItems={10} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    render(
      <ShowMore lines={3}>
        <p>Paid in full.</p>
      </ShowMore>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('offers a toggle when text is longer than the clamp', async () => {
    fakeLayout({ clamp: 72, content: 300 })
    const { container } = render(
      <ShowMore lines={3}>
        <p>Harbour Works moved its billing run to the first working day of each month.</p>
      </ShowMore>,
    )
    const root = must(container.firstElementChild)
    expect(root).toHaveAttribute('data-mode', 'lines')
    expect(root).toHaveAttribute('data-state', 'collapsed')
    expect(root).toHaveAttribute('data-overflowing')
    await userEvent.click(screen.getByRole('button', { name: 'Show more' }))
    expect(root).toHaveAttribute('data-state', 'expanded')
  })

  it('clamps to a step on the space scale with maxHeight', () => {
    const { container } = render(
      <ShowMore maxHeight={10}>
        <pre>log</pre>
      </ShowMore>,
    )
    const root = must(container.firstElementChild) as HTMLElement
    expect(root).toHaveAttribute('data-mode', 'height')
    expect(root.style.getPropertyValue('--_clamp')).toBe('var(--space-10)')
  })

  it('supports controlled state and custom labels', async () => {
    const onExpandedChange = vi.fn()
    const { rerender } = render(
      <Tags
        expanded={false}
        onExpandedChange={onExpandedChange}
        moreLabel={(hidden) => `+${String(hidden)} tags`}
        lessLabel="Fewer tags"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '+2 tags' }))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    rerender(<Tags expanded onExpandedChange={onExpandedChange} lessLabel="Fewer tags" />)
    expect(screen.getByRole('button', { name: 'Fewer tags' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('opens when keyboard focus lands below the cut', async () => {
    fakeLayout({ clamp: 72, content: 300 })
    render(
      <ShowMore lines={3}>
        <div>
          <p>Release notes for March.</p>
          <a href="#full-notes">Read the full notes</a>
        </div>
      </ShowMore>,
    )
    await userEvent.tab()
    expect(screen.getByRole('link')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('forwards ref and props', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ShowMore ref={ref} lines={2} className="extra" data-testid="tags">
        <p>Paid in full.</p>
      </ShowMore>,
    )
    expect(ref.current).toBe(screen.getByTestId('tags'))
    expect(ref.current).toHaveClass('extra')
  })
})
