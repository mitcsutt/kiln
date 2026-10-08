import { fireEvent, render, screen } from '@testing-library/react'
import { must } from '#test/must'
import { Media } from './Media'

describe('Media', () => {
  it('renders a lazy, async-decoded image in a plain frame by default', () => {
    const { container } = render(
      <Media src="/images/dashboard.png" alt="Revenue dashboard" ratio="16/9" />,
    )
    const img = screen.getByRole('img', { name: 'Revenue dashboard' })
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(container.querySelector('figure')).toBeNull()
    expect(container.firstElementChild).toHaveAttribute('data-ratio', '16/9')
  })

  it('becomes a figure with a figcaption when captioned', () => {
    render(
      <Media
        src="/images/harbour.png"
        alt="Harbour at dawn"
        caption="Harbour, June 2026"
        loading="eager"
      />,
    )
    const figure = screen.getByRole('figure')
    expect(figure.querySelector('figcaption')).toHaveTextContent('Harbour, June 2026')
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })

  it('swaps in the fallback, keeping the accessible name, when the image fails', () => {
    const { container } = render(
      <Media
        src="/missing.png"
        alt="Signed contract for Northwind Studio"
        fallback="Image unavailable"
      />,
    )
    fireEvent.error(screen.getByRole('img'))
    expect(container.querySelector('img')).toBeNull()
    expect(
      screen.getByRole('img', { name: 'Signed contract for Northwind Studio' }),
    ).toHaveTextContent('Image unavailable')
    expect(container.firstElementChild).toHaveAttribute('data-failed')
  })

  it('has no size by default, so it fills its container', () => {
    const { container } = render(<Media src="/images/harbour.png" alt="Harbour" />)
    expect(container.firstElementChild).not.toHaveAttribute('data-size')
  })

  it('takes a fixed size for an inline thumbnail, keeping its ratio and fallback', () => {
    const { container } = render(
      <Media size="sm" ratio="3/2" src="/missing/flag.svg" alt="Kelso Bay flag" />,
    )
    const root = must(container.firstElementChild, 'the media root')
    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveAttribute('data-ratio', '3/2')
    fireEvent.error(screen.getByRole('img'))
    expect(container.querySelector('img')).toBeNull()
    expect(root).toHaveAttribute('data-failed')
  })

  it('gives a sized image width and height hints from its size and ratio', () => {
    const { rerender } = render(<Media src="/flag.svg" alt="" size="sm" ratio="3/2" />)
    const img = () => must(document.querySelector('img'), 'the image')
    expect(img()).toHaveAttribute('width', '30')
    expect(img()).toHaveAttribute('height', '20')
    rerender(<Media src="/flag.svg" alt="" size="xl" ratio="16/9" />)
    expect(img()).toHaveAttribute('width', '171')
    expect(img()).toHaveAttribute('height', '96')
    // The image's own ratio isn't known, so an auto frame leaves them to imgProps.
    rerender(<Media src="/flag.svg" alt="" size="sm" imgProps={{ width: 40, height: 20 }} />)
    expect(img()).toHaveAttribute('width', '40')
    rerender(<Media src="/flag.svg" alt="" size="sm" />)
    expect(img()).not.toHaveAttribute('width')
    rerender(<Media src="/flag.svg" alt="" ratio="3/2" />)
    expect(img()).not.toHaveAttribute('height')
  })

  it('is phrasing content when sized, so it can sit inside a button', () => {
    render(
      <button type="button">
        <Media size="xs" ratio="3/2" src="/images/flag.svg" alt="Kelso Bay flag" />
        Kelso Bay
      </button>,
    )
    const button = screen.getByRole('button')
    expect(button.querySelectorAll('div')).toHaveLength(0)
    expect(screen.getByRole('img', { name: 'Kelso Bay flag' }).parentElement?.tagName).toBe('SPAN')
  })

  it('dims an image that is out of play', () => {
    const { container } = render(<Media src="/images/flag.svg" alt="" size="sm" dimmed />)
    expect(container.firstElementChild).toHaveAttribute('data-dimmed')
  })
})
