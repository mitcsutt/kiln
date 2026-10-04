import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { CloseIcon } from '#icons'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('is named by its label, not its glyph, and forwards refs', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton ref={ref} label="Close dialog" icon={<CloseIcon />} />)
    const btn = screen.getByRole('button', { name: 'Close dialog' })
    expect(ref.current).toBe(btn)
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).not.toHaveAttribute('title')
  })

  it('defaults to ghost + neutral and exposes shape for theming', () => {
    render(<IconButton label="More" icon={<CloseIcon />} shape="round" size="sm" />)
    const btn = screen.getByRole('button', { name: 'More' })
    expect(btn).toHaveAttribute('data-variant', 'ghost')
    expect(btn).toHaveAttribute('data-tone', 'neutral')
    expect(btn).toHaveAttribute('data-shape', 'round')
    expect(btn).toHaveAttribute('data-size', 'sm')
  })

  it('mirrors the label into title when asked', () => {
    render(<IconButton label="Copy link" icon={<CloseIcon />} showTitle />)
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAttribute('title', 'Copy link')
  })

  it('is busy and inert while loading', async () => {
    const onClick = vi.fn()
    render(<IconButton label="Refresh" icon={<CloseIcon />} loading onClick={onClick} />)
    const btn = screen.getByRole('button', { name: 'Refresh' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a link when asChild', () => {
    render(
      <IconButton asChild label="GitHub profile" icon={<CloseIcon />}>
        <a href="https://github.com/mitcsutt/kiln" aria-label="GitHub profile" />
      </IconButton>,
    )
    const link = screen.getByRole('link', { name: 'GitHub profile' })
    expect(link).toHaveAttribute('href', 'https://github.com/mitcsutt/kiln')
    expect(link.querySelector('svg')).not.toBeNull()
  })
})
