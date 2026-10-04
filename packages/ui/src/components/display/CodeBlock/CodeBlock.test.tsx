import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { CodeBlock } from './CodeBlock'
import { must } from '#test/must'

const code = `export const keys = {\n  fixtures: ['fixtures'] as const,\n}\n`

describe('CodeBlock', () => {
  it('renders the code verbatim in a figure named by its title', () => {
    const ref = createRef<HTMLElement>()
    render(<CodeBlock ref={ref} code={code} title="queries/keys.ts" language="TypeScript" />)
    const figure = screen.getByRole('figure', { name: 'queries/keys.ts' })
    expect(ref.current).toBe(figure)
    expect(must(figure.querySelector('code')).textContent).toBe(code.trimEnd())
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('numbers and highlights lines', () => {
    const { container } = render(
      <CodeBlock code={code} showLineNumbers highlightLines={[2]} copyable={false} />,
    )
    const lines = container.querySelectorAll('code > span')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toHaveAttribute('data-line', '1')
    expect(lines[1]).toHaveAttribute('data-highlighted')
    expect(lines[0]).not.toHaveAttribute('data-highlighted')
  })

  it('copies the code and announces it', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<CodeBlock code={code} />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith(code.trimEnd())
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent('Copied')
  })

  it('resets the copy state after a moment', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<CodeBlock code={code} />)
    await act(() => {
      screen.getByRole('button').click()
      return Promise.resolve()
    })
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByRole('status')).toHaveTextContent('')
    vi.useRealTimers()
  })

  it('reports a failed copy', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<CodeBlock code={code} />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed')
  })

  it('makes the scroll area keyboard reachable and exposes wrap', () => {
    const { container } = render(<CodeBlock code={code} wrap copyable={false} />)
    expect(container.querySelector('pre')).toHaveAttribute('tabindex', '0')
    expect(container.firstElementChild).toHaveAttribute('data-wrap')
    expect(container.querySelector('figcaption')).toBeNull()
  })
})
