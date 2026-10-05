import { createRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '#components/inputs/Field'
import { Rating } from './Rating'

describe('Rating', () => {
  it('is a radiogroup of named stars; stars up to the value are filled', () => {
    render(<Rating aria-label="Rate this release" defaultValue={3} />)
    expect(screen.getByRole('radiogroup', { name: 'Rate this release' })).toBeInTheDocument()
    const stars = screen.getAllByRole('radio')
    expect(stars).toHaveLength(5)
    expect(screen.getByRole('radio', { name: '3 of 5' })).toHaveAttribute('aria-checked', 'true')
    expect(stars.map((s) => s.hasAttribute('data-filled'))).toEqual([
      true,
      true,
      true,
      false,
      false,
    ])
  })

  it('click chooses; arrow keys move and choose; uncontrolled', async () => {
    const onValueChange = vi.fn()
    render(<Rating aria-label="Rate this release" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('radio', { name: '2 of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    await userEvent.keyboard('{ArrowRight>}')
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '3 of 5' })).toHaveAttribute('aria-checked', 'true'),
    )
    await userEvent.keyboard('{/ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(3)
  })

  it('clearable: choosing the current rating again clears it', async () => {
    const onValueChange = vi.fn()
    render(
      <Rating
        aria-label="Rate this release"
        defaultValue={4}
        clearable
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('radio', { name: '4 of 5' })).toHaveAttribute('aria-checked', 'false')
  })

  it('not clearable: clicking the current rating keeps it', async () => {
    const onValueChange = vi.fn()
    render(<Rating aria-label="Rate this release" defaultValue={4} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('is controlled; null shows no stars', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Rating aria-label="Rate this release" value={null} onValueChange={onValueChange} />,
    )
    await userEvent.click(screen.getByRole('radio', { name: '5 of 5' }))
    expect(onValueChange).toHaveBeenCalledWith(5)
    expect(screen.getByRole('radio', { name: '5 of 5' })).toHaveAttribute('aria-checked', 'false')
    rerender(<Rating aria-label="Rate this release" value={5} onValueChange={onValueChange} />)
    expect(screen.getByRole('radio', { name: '5 of 5' })).toHaveAttribute('aria-checked', 'true')
  })

  it('hover previews the rating without choosing it', async () => {
    render(<Rating aria-label="Rate this release" defaultValue={1} />)
    await userEvent.hover(screen.getByRole('radio', { name: '4 of 5' }))
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-previewing')
    expect(screen.getByRole('radio', { name: '4 of 5' })).toHaveAttribute('data-filled')
    await userEvent.unhover(screen.getByRole('radiogroup'))
    expect(screen.getByRole('radio', { name: '4 of 5' })).not.toHaveAttribute('data-filled')
  })

  it('custom max and itemLabel', () => {
    render(
      <Rating
        aria-label="Difficulty"
        max={3}
        itemLabel={(n) => `${String(n)} star${n === 1 ? '' : 's'}`}
      />,
    )
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: '1 star' })).toBeInTheDocument()
  })

  it('readOnly ignores choices; disabled disables every star', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Rating
        aria-label="Rate this release"
        defaultValue={2}
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByRole('radio', { name: '5 of 5' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: '2 of 5' })).toHaveAttribute('aria-checked', 'true')
    rerender(<Rating aria-label="Rate this release" disabled />)
    for (const star of screen.getAllByRole('radio')) expect(star).toBeDisabled()
  })

  it('emits a hidden input when rated', async () => {
    const { container } = render(
      <form>
        <Rating aria-label="Rate this release" name="rating" clearable />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('rating')).toEqual([])
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }))
    expect(new FormData(form).getAll('rating')).toEqual(['4'])
  })

  it('takes its name and state from a Field; forwards the ref; onBlur on leaving', async () => {
    const ref = createRef<HTMLDivElement>()
    const onBlur = vi.fn()
    render(
      <>
        <Field label="Rate this release" error="Rate it to continue" required>
          <Rating ref={ref} onBlur={onBlur} />
        </Field>
        <button type="button">Save</button>
      </>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Rate this release' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAttribute('aria-required', 'true')
    expect(group).toHaveAccessibleDescription('Rate it to continue')
    await userEvent.tab()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
