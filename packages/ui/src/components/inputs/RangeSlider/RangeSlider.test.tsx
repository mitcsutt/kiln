import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '#components/inputs/Field'
import { RangeSlider } from './RangeSlider'

const pounds: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
}

describe('RangeSlider', () => {
  it('is a named group of two named sliders with valuetext', () => {
    render(
      <RangeSlider
        aria-label="Budget range"
        min={500}
        max={5000}
        step={100}
        defaultValue={[1000, 2500]}
        formatOptions={pounds}
        locale="en-GB"
      />,
    )
    expect(screen.getByRole('group', { name: 'Budget range' })).toBeInTheDocument()
    const low = screen.getByRole('slider', { name: 'Minimum' })
    const high = screen.getByRole('slider', { name: 'Maximum' })
    expect(low).toHaveAttribute('aria-valuetext', '£1,000')
    expect(high).toHaveAttribute('aria-valuetext', '£2,500')
  })

  it('moves each thumb with the keyboard; emits a tuple; respects minStepsBetweenThumbs', async () => {
    const onValueChange = vi.fn()
    render(
      <RangeSlider
        aria-label="Budget range"
        min={0}
        max={10}
        defaultValue={[4, 6]}
        minStepsBetweenThumbs={2}
        onValueChange={onValueChange}
      />,
    )
    const low = screen.getByRole('slider', { name: 'Minimum' })
    low.focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onValueChange).toHaveBeenLastCalledWith([3, 6])
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    // 5 would leave fewer than 2 steps between the thumbs.
    expect(low).toHaveAttribute('aria-valuenow', '4')
    const high = screen.getByRole('slider', { name: 'Maximum' })
    high.focus()
    await userEvent.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith([4, 10])
  })

  it('is controlled; readOnly holds', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <RangeSlider aria-label="Budget range" value={[20, 80]} onValueChange={onValueChange} />,
    )
    screen.getByRole('slider', { name: 'Maximum' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith([20, 81])
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '80')
    onValueChange.mockClear()
    rerender(
      <RangeSlider
        aria-label="Budget range"
        defaultValue={[20, 80]}
        readOnly
        onValueChange={onValueChange}
      />,
    )
    screen.getByRole('slider', { name: 'Minimum' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('custom thumbLabels; both values under name; output shows the range', () => {
    const { container } = render(
      <form>
        <RangeSlider
          aria-label="Kick-off window"
          name="window"
          min={12}
          max={22}
          defaultValue={[15, 20]}
          thumbLabels={['Earliest', 'Latest']}
          showValue
        />
      </form>,
    )
    expect(screen.getByRole('slider', { name: 'Earliest' })).toBeInTheDocument()
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('window')).toEqual(['15', '20'])
    expect(container.querySelector('output')).toHaveTextContent('15 – 20')
  })

  it('a Field labels the group; ref and id go to the group; onBlur on leaving both thumbs', async () => {
    const ref = createRef<HTMLSpanElement>()
    const onBlur = vi.fn()
    render(
      <>
        <Field label="Budget range" htmlFor="budget" error="Too wide">
          <RangeSlider ref={ref} onBlur={onBlur} />
        </Field>
        <button type="button">Save</button>
      </>,
    )
    const group = screen.getByRole('group', { name: 'Budget range' })
    expect(ref.current).toBe(group)
    expect(group).toHaveAttribute('id', 'budget')
    expect(group).toHaveAccessibleDescription('Too wide')
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-invalid', 'true')
    await userEvent.tab()
    await userEvent.tab()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
