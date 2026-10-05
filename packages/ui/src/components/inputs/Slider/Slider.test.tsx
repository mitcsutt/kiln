import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '#components/inputs/Field'
import { Slider } from './Slider'

const pounds: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
}

describe('Slider', () => {
  it('is a slider with min, max, value and a formatted aria-valuetext', () => {
    render(
      <Slider
        aria-label="Hourly rate"
        min={0}
        max={500}
        defaultValue={250}
        formatOptions={pounds}
        locale="en-GB"
      />,
    )
    const slider = screen.getByRole('slider', { name: 'Hourly rate' })
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '500')
    expect(slider).toHaveAttribute('aria-valuenow', '250')
    expect(slider).toHaveAttribute('aria-valuetext', '£250')
  })

  it('arrow keys step, Home/End jump; uncontrolled; commit fires', async () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <Slider
        aria-label="Discount rate"
        defaultValue={20}
        step={5}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const slider = screen.getByRole('slider')
    slider.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(25)
    expect(slider).toHaveAttribute('aria-valuenow', '25')
    await userEvent.keyboard('{End}')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
    expect(onValueCommit).toHaveBeenLastCalledWith(100)
    await userEvent.keyboard('{Home}')
    expect(slider).toHaveAttribute('aria-valuenow', '0')
  })

  it('is controlled by value', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Slider aria-label="Discount rate" value={40} onValueChange={onValueChange} />,
    )
    const slider = screen.getByRole('slider')
    slider.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenCalledWith(41)
    expect(slider).toHaveAttribute('aria-valuenow', '40')
    rerender(<Slider aria-label="Discount rate" value={41} onValueChange={onValueChange} />)
    expect(slider).toHaveAttribute('aria-valuenow', '41')
  })

  it('uses a mark label as valuetext and shows the value in an output', () => {
    const marks = [
      { value: 0, label: 'Nothing' },
      { value: 50, label: 'Half' },
    ]
    render(<Slider aria-label="Share" defaultValue={50} marks={marks} showValue />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Half')
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('50')
  })

  it('readOnly ignores keys; disabled removes it from the tab order', async () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    const { rerender } = render(
      <Slider
        aria-label="Discount rate"
        defaultValue={20}
        readOnly
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-readonly', 'true')
    slider.focus()
    await userEvent.keyboard('{ArrowRight}{End}')
    expect(slider).toHaveAttribute('aria-valuenow', '20')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onValueCommit).not.toHaveBeenCalled()
    rerender(<Slider aria-label="Discount rate" defaultValue={20} disabled />)
    expect(screen.getByRole('slider')).not.toHaveAttribute('tabindex')
  })

  it('emits a hidden input under name', async () => {
    const { container } = render(
      <form>
        <Slider aria-label="Discount rate" name="rate" defaultValue={20} />
      </form>,
    )
    const form = container.querySelector('form')
    if (!form) throw new Error('no form')
    expect(new FormData(form).getAll('rate')).toEqual(['20'])
    screen.getByRole('slider').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(new FormData(form).getAll('rate')).toEqual(['21'])
  })

  it('takes label, description and invalid from a Field; ref and id go to the thumb', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Field label="Discount rate" description="Off each invoice" error="Too high">
        <Slider ref={ref} defaultValue={90} />
      </Field>,
    )
    const slider = screen.getByRole('slider', { name: 'Discount rate' })
    expect(ref.current).toBe(slider)
    expect(slider).toHaveAccessibleDescription('Off each invoice Too high')
    expect(slider).toHaveAttribute('aria-invalid', 'true')
    expect(slider.id).toBeTruthy()
  })

  it('fires onBlur when focus leaves', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <Slider aria-label="Discount rate" onBlur={onBlur} />
        <button type="button">Save</button>
      </>,
    )
    await userEvent.tab()
    expect(screen.getByRole('slider')).toHaveFocus()
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
