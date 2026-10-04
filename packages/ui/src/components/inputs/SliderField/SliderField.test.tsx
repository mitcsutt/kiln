import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SliderField } from './SliderField'

describe('SliderField', () => {
  it('labels and describes the thumb; ref and id go to the thumb; className to the Field', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(
      <SliderField
        ref={ref}
        id="rate"
        className="extra"
        label="Savings rate"
        description="Of each pay"
        warning="That leaves little for bills"
        defaultValue={60}
      />,
    )
    const slider = screen.getByRole('slider', { name: 'Savings rate' })
    expect(ref.current).toBe(slider)
    expect(slider).toHaveAttribute('id', 'rate')
    expect(slider).toHaveAccessibleDescription('Of each pay That leaves little for bills')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('error, readOnly and validating reach the thumb', async () => {
    const onValueChange = vi.fn()
    render(
      <SliderField
        label="Savings rate"
        error="Too high"
        readOnly
        validating
        defaultValue={90}
        onValueChange={onValueChange}
      />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-invalid', 'true')
    expect(slider).toHaveAttribute('aria-readonly', 'true')
    expect(slider).toHaveAttribute('aria-busy', 'true')
    slider.focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('layout="horizontal" is passed to the Field', () => {
    const { container } = render(<SliderField label="Savings rate" layout="horizontal" />)
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'horizontal')
  })
})
