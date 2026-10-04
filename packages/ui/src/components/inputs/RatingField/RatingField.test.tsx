import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingField } from './RatingField'

describe('RatingField', () => {
  it('labels the stars with the Field label; ref and id go to the radiogroup', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <RatingField
        ref={ref}
        id="rating"
        label="Rate this fixture"
        description="Only you see this"
      />,
    )
    const group = screen.getByRole('radiogroup', { name: 'Rate this fixture' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAttribute('id', 'rating')
    expect(group).toHaveAccessibleDescription('Only you see this')
  })

  it('value is number | null; clearable', async () => {
    const onValueChange = vi.fn()
    render(
      <RatingField
        label="Rate this fixture"
        defaultValue={3}
        clearable
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: '3 of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await userEvent.click(screen.getByRole('radio', { name: '5 of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('readOnly and error from the field', async () => {
    const onValueChange = vi.fn()
    render(
      <RatingField
        label="Rate this fixture"
        readOnly
        error="Required"
        defaultValue={2}
        onValueChange={onValueChange}
      />,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-readonly', 'true')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
