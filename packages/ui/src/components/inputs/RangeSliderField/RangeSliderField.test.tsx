import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RangeSliderField } from './RangeSliderField'

describe('RangeSliderField', () => {
  it('names the group with the label; thumbs keep their own names; ref and id to the group', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <RangeSliderField
        ref={ref}
        id="budget"
        label="Budget range"
        description="Per month"
        min={500}
        max={5000}
      />,
    )
    const group = screen.getByRole('group', { name: 'Budget range' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAttribute('id', 'budget')
    expect(group).toHaveAccessibleDescription('Per month')
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '500')
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '5000')
  })

  it('emits a tuple; disabled reaches both thumbs', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <RangeSliderField
        label="Budget range"
        defaultValue={[10, 20]}
        onValueChange={onValueChange}
      />,
    )
    screen.getByRole('slider', { name: 'Minimum' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith([11, 20])
    rerender(<RangeSliderField label="Budget range" defaultValue={[10, 20]} disabled />)
    for (const thumb of screen.getAllByRole('slider')) expect(thumb).not.toHaveAttribute('tabindex')
  })
})
