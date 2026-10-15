import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { CopyButton } from './CopyButton'
import { useClipboard } from './useClipboard'

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

function removeClipboard() {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
}

function mockExecCommand(result: boolean) {
  const execCommand = vi.fn(() => result)
  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })
  return execCommand
}

afterEach(() => {
  vi.useRealTimers()
  Reflect.deleteProperty(document, 'execCommand')
})

describe('useClipboard', () => {
  it('copies through the Clipboard API, then clears copied after the timeout', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const onCopy = vi.fn()
    const { result } = renderHook(() => useClipboard({ timeout: 1000, onCopy }))
    let ok = false
    await act(async () => {
      ok = await result.current.copy(() => JSON.stringify({ id: 42 }))
    })
    expect(ok).toBe(true)
    expect(writeText).toHaveBeenCalledWith('{"id":42}')
    expect(onCopy).toHaveBeenCalledWith('{"id":42}')
    expect(result.current.copied).toBe(true)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.copied).toBe(false)
  })

  it('falls back to execCommand where the Clipboard API is missing', async () => {
    removeClipboard()
    const execCommand = mockExecCommand(true)
    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy('ssh deploy@build-04')
    })
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(result.current.copied).toBe(true)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('falls back when the Clipboard API refuses', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    mockExecCommand(true)
    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy('INV-2041')
    })
    expect(result.current.copied).toBe(true)
  })

  it('surfaces an error when nothing can copy', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    mockExecCommand(false)
    const onError = vi.fn()
    const { result } = renderHook(() => useClipboard({ onError }))
    let ok = true
    await act(async () => {
      ok = await result.current.copy('INV-2041')
    })
    expect(ok).toBe(false)
    expect(result.current.copied).toBe(false)
    expect(result.current.error?.message).toBe('denied')
    expect(onError).toHaveBeenCalledWith(result.current.error)
    act(() => {
      result.current.reset()
    })
    expect(result.current.error).toBeNull()
  })
})

describe('CopyButton', () => {
  it('is an icon button named by its label that copies and announces', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const ref = createRef<HTMLButtonElement>()
    render(<CopyButton ref={ref} value="https://example.com/r/7Hk2" label="Copy link" />)
    const button = screen.getByRole('button', { name: 'Copy link' })
    expect(ref.current).toBe(button)
    expect(button).toHaveAttribute('data-state', 'idle')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    await user.click(button)
    expect(writeText).toHaveBeenCalledWith('https://example.com/r/7Hk2')
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
    expect(button).toHaveAttribute('data-state', 'copied')
    expect(screen.getByRole('button', { name: 'Copy link' })).toBe(button)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copied')
  })

  it('copies from the keyboard', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    render(<CopyButton value="pnpm add @mitcsutt/kiln-ui" />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(writeText).toHaveBeenCalledTimes(1)
  })

  it('shows its label as text, and says when the copy failed', async () => {
    const user = userEvent.setup()
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    mockExecCommand(false)
    const onError = vi.fn()
    render(<CopyButton value="token" label="Copy token" showLabel onError={onError} />)
    const button = screen.getByRole('button', { name: 'Copy token' })
    await user.click(button)
    expect(button).toHaveTextContent('Couldn’t copy')
    expect(button).toHaveAttribute('data-state', 'failed')
    expect(screen.getByRole('status')).toHaveTextContent('Couldn’t copy')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('reads a function value at the moment of the press and calls onCopy', async () => {
    const user = userEvent.setup()
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    const onCopy = vi.fn()
    let current = 'draft 1'
    render(
      <CopyButton
        value={() => current}
        onCopy={onCopy}
        showLabel
        label="Copy draft"
        copiedLabel="Draft copied"
      />,
    )
    current = 'draft 2'
    await user.click(screen.getByRole('button', { name: 'Copy draft' }))
    expect(onCopy).toHaveBeenCalledWith('draft 2')
    expect(screen.getByRole('button')).toHaveTextContent('Draft copied')
  })

  it('does not copy when onClick prevents default', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    render(
      <CopyButton
        value="x"
        showLabel
        onClick={(event) => {
          event.preventDefault()
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).not.toHaveBeenCalled()
  })

  it('renders a custom trigger with the announcement', async () => {
    const user = userEvent.setup()
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    render(
      <CopyButton value="ORD-88213">
        {({ copy, copied }) => (
          <button type="button" onClick={copy}>
            {copied ? 'Copied' : 'ORD-88213'}
          </button>
        )}
      </CopyButton>,
    )
    await user.click(screen.getByRole('button', { name: 'ORD-88213' }))
    expect(screen.getByRole('button')).toHaveTextContent('Copied')
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
  })
})
