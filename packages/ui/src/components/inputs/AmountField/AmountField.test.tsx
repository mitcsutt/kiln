import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { AmountField } from './AmountField'

describe('AmountField', () => {
  it('labels the textbox, forwards the ref and describes it with help, currency and error', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <AmountField
        ref={ref}
        label="Monthly rent"
        description="Due on the 1st"
        error="Enter the rent"
        currency="GBP"
        locale="en-GB"
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Monthly rent' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAccessibleDescription('Due on the 1st Enter the rent GBP')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('reports minor units and fires onBlur', async () => {
    const onValueChange = vi.fn()
    const onBlur = vi.fn()
    render(
      <AmountField
        label="Monthly rent"
        currency="GBP"
        locale="en-GB"
        unit="minor"
        onValueChange={onValueChange}
        onBlur={onBlur}
      />,
    )
    await userEvent.type(screen.getByLabelText('Monthly rent'), '1450')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(145000)
    expect(onBlur).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Monthly rent')).toHaveValue('1,450.00')
  })

  it('passes id, readOnly and disabled through', () => {
    const { rerender } = render(<AmountField id="rent" label="Rent" currency="GBP" readOnly />)
    expect(screen.getByLabelText('Rent')).toHaveAttribute('id', 'rent')
    expect(screen.getByLabelText('Rent')).toHaveAttribute('readonly')
    rerender(<AmountField id="rent" label="Rent" currency="GBP" disabled />)
    expect(screen.getByLabelText('Rent')).toBeDisabled()
  })
})
