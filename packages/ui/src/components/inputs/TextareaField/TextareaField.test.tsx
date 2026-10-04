import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextareaField } from './TextareaField'

describe('TextareaField', () => {
  it('labels the textarea and reports values', async () => {
    const onValueChange = vi.fn()
    render(<TextareaField label="Notes" rows={2} onValueChange={onValueChange} />)
    const textarea = screen.getByLabelText('Notes')
    expect(textarea.tagName).toBe('TEXTAREA')
    await userEvent.type(textarea, 'h')
    expect(onValueChange).toHaveBeenCalledWith('h')
  })

  it('renders error and optional hint', () => {
    render(<TextareaField label="Notes" optional error="Too long" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too long')
    expect(screen.getByText('Optional')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows a character count linked by describedby', () => {
    render(<TextareaField label="Notes" maxLength={10} showCount defaultValue="12345" />)
    const textarea = screen.getByLabelText('Notes')
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
    expect(textarea).toHaveAccessibleDescription('5 / 10')
  })
})
