import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import type { StoredFile } from '#components/inputs/FileDrop'
import { FileField } from './FileField'

const stored: StoredFile = {
  id: 'r-114',
  name: 'client-lunch-receipt.png',
  size: 98_000,
  type: 'image/png',
}
const receipt = () =>
  new File([new Uint8Array(2000)], 'conference-receipt.jpg', { type: 'image/jpeg' })

describe('FileField', () => {
  it('labels the file input and forwards the ref, id and className', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <FileField ref={ref} id="receipts" label="Receipts" className="extra" />,
    )
    const input = screen.getByLabelText('Receipts')
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('id', 'receipts')
    expect(input).toHaveAttribute('type', 'file')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('wires description, warning, error and merges aria-describedby', () => {
    const { rerender } = render(
      <>
        <p id="extra">Kept for 7 years</p>
        <FileField
          label="Receipts"
          description="JPG, PNG or PDF up to 5 MB"
          warning="Large files upload slowly"
          aria-describedby="extra"
        />
      </>,
    )
    const input = screen.getByLabelText('Receipts')
    expect(input).toHaveAccessibleDescription(
      /JPG, PNG or PDF up to 5 MB.*Large files upload slowly.*Kept for 7 years/,
    )
    rerender(
      <>
        <p id="extra">Kept for 7 years</p>
        <FileField label="Receipts" error="Add at least one receipt" aria-describedby="extra" />
      </>,
    )
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one receipt')
  })

  it('passes required, readOnly, disabled and validating through the Field', () => {
    const { rerender } = render(
      <FileField label="Receipts" required readOnly validating defaultValue={[stored]} />,
    )
    const input = screen.getByLabelText(/Receipts/)
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-busy', 'true')
    expect(input.parentElement).toHaveAttribute('data-readonly')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<FileField label="Receipts" disabled />)
    expect(input).toBeDisabled()
  })

  it('value / onValueChange are FileValue[], with onReject and name', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    const { container } = render(
      <form>
        <FileField
          label="Receipts"
          name="receipts"
          accept="image/*"
          multiple
          defaultValue={[stored]}
          onValueChange={onValueChange}
          onReject={onReject}
        />
      </form>,
    )
    const picked = receipt()
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('Receipts'), [picked, text])
    expect(onValueChange).toHaveBeenLastCalledWith([stored, picked])
    expect(onReject).toHaveBeenCalledWith([{ file: text, reason: 'type' }])
    expect(container.querySelector('input[type="file"]')).toHaveAttribute('name', 'receipts')
  })

  it('onBlur fires when focus leaves the whole control', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <>
        <FileField label="Receipts" defaultValue={[stored]} onBlur={onBlur} />
        <button type="button">Next</button>
      </>,
    )
    screen.getByLabelText('Receipts').focus()
    await user.tab()
    expect(onBlur).not.toHaveBeenCalled()
    await user.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
