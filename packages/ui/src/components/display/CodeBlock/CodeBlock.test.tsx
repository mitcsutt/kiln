import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { CodeBlock } from './CodeBlock'
import { must } from '#test/must'

const code = `export const keys = {\n  invoices: ['invoices'] as const,\n}\n`

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

  it('colours tokens by type and leaves plain text bare', () => {
    const { container } = render(
      <CodeBlock
        code={'const a = 1\n\nlet b'}
        tokens={[
          [
            { content: 'const', type: 'keyword' },
            { content: ' a = ' },
            { content: '1', type: 'constant' },
          ],
          [],
          [{ content: 'let', type: 'keyword' }, { content: ' b' }],
        ]}
        copyable={false}
      />,
    )
    const code = must(container.querySelector('code'))
    expect(code.textContent).toBe('const a = 1\n\nlet b')
    const tokens = [...code.querySelectorAll('[data-token]')]
    expect(tokens.map((token) => [token.textContent, token.getAttribute('data-token')])).toEqual([
      ['const', 'keyword'],
      ['1', 'constant'],
      ['let', 'keyword'],
    ])
  })

  it('shows the code plain when the tokens are missing a line', () => {
    const { container } = render(
      <CodeBlock
        code={'one\ntwo'}
        tokens={[[{ content: 'one', type: 'string' }]]}
        copyable={false}
      />,
    )
    const code = must(container.querySelector('code'))
    expect(code.textContent).toBe('one\ntwo')
    expect(code.querySelector('[data-token]')).toBeNull()
  })

  it('shows the new code plain while the tokens are still for the old code', () => {
    const { container } = render(
      <CodeBlock
        code={'let total = 2\nreturn total\n'}
        tokens={[
          [
            { content: 'const', type: 'keyword' },
            { content: ' a = ' },
            { content: '1', type: 'constant' },
          ],
          [{ content: 'a', type: 'constant' }],
        ]}
        copyable={false}
      />,
    )
    const code = must(container.querySelector('code'))
    expect(code.textContent).toBe('let total = 2\nreturn total')
    expect(code.querySelector('[data-token]')).toBeNull()
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
