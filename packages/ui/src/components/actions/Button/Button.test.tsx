import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Button } from './Button'

describe('Button', () => {
  it('renders a type=button by default and forwards refs', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Export CSV</Button>)
    const btn = screen.getByRole('button', { name: 'Export CSV' })
    expect(btn).toHaveAttribute('type', 'button')
    expect(ref.current).toBe(btn)
  })

  it('exposes variant, tone and size as data attributes for theming', () => {
    render(
      <Button variant="outline" tone="critical" size="lg">
        Delete
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('data-variant', 'outline')
    expect(btn).toHaveAttribute('data-tone', 'critical')
    expect(btn).toHaveAttribute('data-size', 'lg')
  })

  it('is busy and not clickable while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders its child when asChild', () => {
    render(
      <Button asChild variant="ghost">
        <a href="/projects">Projects</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Projects' })
    expect(link).toHaveAttribute('href', '/projects')
    expect(link).toHaveAttribute('data-variant', 'ghost')
    expect(link).not.toHaveAttribute('type')
  })
})
