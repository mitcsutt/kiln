import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Marquee } from './Marquee'
import { must } from '#test/must'

const scores = ['Hawks 2–1 Swifts', 'Quarry Lane 0–0 Riverside', 'Rovers 3–1 Millpond']

describe('Marquee', () => {
  it('is a named region and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Marquee ref={ref} label="Live scores" items={scores} />)
    const region = screen.getByRole('region', { name: 'Live scores' })
    expect(ref.current).toBe(region)
  })

  it('renders the content twice but hides the copy from assistive tech and the tab order', () => {
    render(
      <Marquee
        label="Live scores"
        items={scores.map((s) => (
          <a key={s} href="#match">
            {s}
          </a>
        ))}
      />,
    )
    const region = screen.getByRole('region')
    const lists = region.querySelectorAll('ul')
    expect(lists).toHaveLength(2)
    expect(lists[0]).not.toHaveAttribute('aria-hidden')
    expect(lists[1]).toHaveAttribute('aria-hidden', 'true')
    expect(lists[1]).toHaveAttribute('inert')
    // Accessible tree sees each score once.
    expect(within(region).getAllByRole('link')).toHaveLength(3)
    expect(within(region).getAllByRole('link', { name: 'Hawks 2–1 Swifts' })).toHaveLength(1)
  })

  it('exposes surface, direction and speed as data attributes', () => {
    render(
      <Marquee label="Skills" items={scores} surface="inverse" direction="right" speed="slow" />,
    )
    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('data-surface', 'inverse')
    expect(region).toHaveAttribute('data-direction', 'right')
    expect(region).toHaveAttribute('data-speed', 'slow')
    expect(region).toHaveAttribute('data-pause-on-hover')
    expect(region.style.getPropertyValue('--marquee-gap')).toBe('var(--space-5)')
  })

  it('pauses and resumes from the pause control', async () => {
    render(<Marquee label="Live scores" items={scores} />)
    const region = screen.getByRole('region')
    const toggle = screen.getByRole('button', { name: 'Pause Live scores' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(region).toHaveAttribute('data-paused')
    await userEvent.click(toggle)
    expect(region).not.toHaveAttribute('data-paused')
  })

  it('can drop the pause control and hover pausing', () => {
    render(<Marquee label="Skills" items={scores} pauseControl={false} pauseOnHover={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('region')).not.toHaveAttribute('data-pause-on-hover')
  })

  it('accepts children as items', () => {
    render(
      <Marquee label="Skills">
        <span>TypeScript</span>
        <span>React</span>
      </Marquee>,
    )
    expect(must(screen.getByRole('region').querySelectorAll('ul')[0]).children).toHaveLength(2)
  })
})
