import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { IconButton } from '#components/actions/IconButton'
import { must } from '#test/must'
import { Indicator } from './Indicator'

const markOf = (container: HTMLElement) =>
  container.querySelector('[data-kind]') as HTMLElement | null

describe('Indicator', () => {
  it('adds its label to the child’s description and hides the mark', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(
      <Indicator ref={ref} count={3} label="3 unread messages">
        <IconButton label="Inbox" icon={<svg />} />
      </Indicator>,
    )
    const button = screen.getByRole('button', { name: 'Inbox' })
    expect(button).toHaveAccessibleDescription('3 unread messages')
    const mark = must(markOf(container))
    expect(mark).toHaveAttribute('aria-hidden', 'true')
    expect(mark).toHaveTextContent('3')
    expect(mark).toHaveAttribute('data-kind', 'count')
    expect(ref.current).toBe(container.firstElementChild)
    expect(ref.current).toHaveAttribute('data-position', 'top-end')
    expect(ref.current).toHaveAttribute('data-shape', 'rect')
  })

  it('keeps the child’s own description', () => {
    render(
      <>
        <p id="hint">Opens your messages</p>
        <Indicator label="Waiting for you">
          <button type="button" aria-describedby="hint">
            Inbox
          </button>
        </Indicator>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Inbox' })).toHaveAccessibleDescription(
      'Opens your messages Waiting for you',
    )
  })

  it('caps the count at max', () => {
    const { container, rerender } = render(<Indicator count={120} label="120 new" />)
    expect(markOf(container)).toHaveTextContent('99+')
    rerender(<Indicator count={120} max={150} label="120 new" />)
    expect(markOf(container)).toHaveTextContent('120')
  })

  it('is a dot without a count, with the tone as data', () => {
    const { container } = render(
      <Indicator tone="critical" processing label="Needs your answer">
        <span>Agent</span>
      </Indicator>,
    )
    const mark = must(markOf(container))
    expect(mark).toHaveAttribute('data-kind', 'dot')
    expect(mark).toHaveAttribute('data-tone', 'critical')
    expect(mark).toHaveAttribute('data-processing')
    expect(mark).toBeEmptyDOMElement()
  })

  it('hides at zero unless showZero, and when invisible, keeping the child', () => {
    const { container, rerender } = render(
      <Indicator count={0} label="No unread messages">
        <button type="button">Inbox</button>
      </Indicator>,
    )
    const button = screen.getByRole('button', { name: 'Inbox' })
    expect(markOf(container)).toBeNull()
    expect(button).not.toHaveAttribute('aria-describedby')
    rerender(
      <Indicator count={0} showZero label="No unread messages">
        <button type="button">Inbox</button>
      </Indicator>,
    )
    expect(markOf(container)).toHaveTextContent('0')
    rerender(
      <Indicator count={4} invisible label="4 unread messages">
        <button type="button">Inbox</button>
      </Indicator>,
    )
    expect(markOf(container)).toBeNull()
    expect(screen.getByRole('button', { name: 'Inbox' })).toBe(button)
    expect(button).not.toHaveAccessibleDescription()
  })

  it('draws a swatch mark, ignoring count and tone', () => {
    const { container } = render(
      <Indicator swatch={4} count={2} tone="critical" label="On the platform team">
        <span>Ana</span>
      </Indicator>,
    )
    const mark = must(markOf(container))
    expect(mark).toHaveAttribute('data-kind', 'swatch')
    expect(mark).toHaveAttribute('data-color', '4')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
    expect(mark).toBeEmptyDOMElement()
  })

  it('maps position, shape and offset', () => {
    const { container } = render(
      <Indicator position="bottom-start" shape="round" offset={1} label="Online">
        <span>Ana</span>
      </Indicator>,
    )
    const root = must(container.firstElementChild) as HTMLElement
    expect(root).toHaveAttribute('data-position', 'bottom-start')
    expect(root).toHaveAttribute('data-shape', 'round')
    expect(root).toHaveAttribute('data-pinned')
    expect(root.style.getPropertyValue('--_offset')).toBe('var(--space-1)')
  })

  it('stands alone in the flow, with its label as text', () => {
    const { container } = render(<Indicator count={7} label="7 drafts" />)
    expect(container.firstElementChild).not.toHaveAttribute('data-pinned')
    expect(screen.getByText('7 drafts')).toBeInTheDocument()
  })
})
