import { act, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { JsonField, describeJsonError } from './JsonField'

describe('JsonField', () => {
  it('labels the editor and forwards the ref to the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<JsonField ref={ref} label="Payload" description="Sent as the request body" />)
    const area = screen.getByLabelText('Payload')
    expect(area).toBe(ref.current)
    expect(area).toHaveAccessibleDescription(expect.stringContaining('Sent as the request body'))
  })

  it('shows a syntax error with its line and column once typing pauses', () => {
    vi.useFakeTimers()
    render(<JsonField label="Payload" />)
    const area = screen.getByLabelText('Payload')
    fireEvent.change(area, { target: { value: '{\n  "a": 1,\n}' } })
    expect(screen.queryByRole('alert')).toBeNull()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Line 2, column 9: Remove this comma: nothing follows it',
    )
    expect(area).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(area, { target: { value: '{\n  "a": 1\n}' } })
    expect(screen.queryByRole('alert')).toBeNull()
    vi.useRealTimers()
  })

  it('shows a validate message, and lets a passed error win', () => {
    const { rerender } = render(
      <JsonField
        label="Stops"
        validate={(value) => (Array.isArray(value) ? undefined : 'Expected a list')}
      />,
    )
    const area = screen.getByLabelText('Stops')
    fireEvent.change(area, { target: { value: '{}' } })
    fireEvent.blur(area)
    expect(screen.getByRole('alert')).toHaveTextContent('Expected a list')
    rerender(
      <JsonField
        label="Stops"
        error="The server rejected this route"
        validate={(value) => (Array.isArray(value) ? undefined : 'Expected a list')}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('The server rejected this route')
  })

  it('describes errors without a position as the message alone', () => {
    expect(describeJsonError({ message: 'Expected a list' })).toBe('Expected a list')
    expect(describeJsonError({ message: 'x', line: 1, column: 4 })).toBe('Line 1, column 4: x')
  })
})
