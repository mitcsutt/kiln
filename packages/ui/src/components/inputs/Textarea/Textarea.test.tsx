import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('forwards the ref and native props', async () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} aria-label="Notes" rows={4} />)
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    expect(ref.current).toBe(textarea)
    expect(textarea).toHaveAttribute('rows', '4')
    await userEvent.type(textarea, 'Split with Oskar')
    expect(textarea).toHaveValue('Split with Oskar')
  })

  it('sets autoResize data + row vars', () => {
    render(<Textarea aria-label="Notes" autoResize rows={2} maxRows={6} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('data-auto-resize')
    expect(textarea).toHaveAttribute('data-max-rows')
    expect(textarea.style.getPropertyValue('--_rows')).toBe('2')
    expect(textarea.style.getPropertyValue('--_max-rows')).toBe('6')
  })

  it('reflects invalid', () => {
    render(<Textarea aria-label="Notes" invalid />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('data-invalid')
  })
})
