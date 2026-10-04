import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { AmountInput } from './AmountInput'
import { parseMinorUnits } from './amountFormat'

describe('parseMinorUnits', () => {
  it('parses straight to integer minor units', () => {
    expect(parseMinorUnits('1,450.50', 'en-GB', 2, false)).toBe(145050)
    expect(parseMinorUnits('0.1', 'en-GB', 2, false)).toBe(10)
    expect(parseMinorUnits('1.005', 'en-GB', 2, false)).toBe(101)
    expect(parseMinorUnits('1.234,56', 'de-DE', 2, false)).toBe(123456)
    expect(parseMinorUnits('1450', 'ja-JP', 0, false)).toBe(1450)
    expect(parseMinorUnits('', 'en-GB', 2, false)).toBeNull()
  })

  it('rejects a minus unless negatives are allowed', () => {
    expect(parseMinorUnits('-12.50', 'en-GB', 2, false)).toBeNaN()
    expect(parseMinorUnits('-12.50', 'en-GB', 2, true)).toBe(-1250)
  })
})

describe('AmountInput', () => {
  it('is a textbox (not a spinbutton) with the symbol leading and the code in its description', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <AmountInput
        ref={ref}
        aria-label="Monthly retainer"
        currency="GBP"
        locale="en-GB"
        defaultValue={1450}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Monthly retainer' })
    expect(ref.current).toBe(input)
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByText('£')).toBeInTheDocument()
    expect(input).toHaveAccessibleDescription('GBP')
    expect(input).toHaveValue('1,450.00')
    expect(input).toHaveAttribute('inputmode', 'decimal')
  })

  it('groups when blurred and shows raw text while focused', async () => {
    render(<AmountInput aria-label="Retainer" currency="GBP" locale="en-GB" defaultValue={1450} />)
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    expect(input).toHaveValue('1450.00')
    await userEvent.tab()
    expect(input).toHaveValue('1,450.00')
  })

  it('emits integer minor units in minor mode, never floats', async () => {
    const onValueChange = vi.fn()
    render(
      <AmountInput
        aria-label="Retainer"
        currency="GBP"
        locale="en-GB"
        unit="minor"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.type(screen.getByRole('textbox'), '1450.29')
    expect(onValueChange).toHaveBeenLastCalledWith(145029)
    for (const [arg] of onValueChange.mock.calls) expect(Number.isInteger(arg)).toBe(true)
  })

  it('emits major units by default and reads minor values back', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <AmountInput
        aria-label="Retainer"
        currency="AUD"
        locale="en-AU"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.type(screen.getByRole('textbox'), '0.1')
    expect(onValueChange).toHaveBeenLastCalledWith(0.1)
    rerender(
      <AmountInput aria-label="Retainer" currency="AUD" locale="en-AU" unit="minor" value={30} />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('0.30')
  })

  it('uses the currency for decimals (JPY has none) and code display', () => {
    render(
      <>
        <AmountInput
          aria-label="Fare"
          currency="JPY"
          locale="en-US"
          defaultValue={1450}
          showCurrency="code"
        />
        <AmountInput
          aria-label="Fee"
          currency="EUR"
          locale="de-DE"
          defaultValue={1234.5}
          showCurrency="both"
        />
      </>,
    )
    const fare = screen.getByRole('textbox', { name: 'Fare' })
    expect(fare).toHaveValue('1,450')
    expect(fare).toHaveAttribute('inputmode', 'numeric')
    expect(screen.getByText('JPY', { selector: '[data-slot="trailing"]' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Fee' })).toHaveValue('1.234,50')
    expect(screen.getByText('€')).toBeInTheDocument()
    expect(screen.getByText('EUR', { selector: '[data-slot="trailing"]' })).toBeInTheDocument()
  })

  it('reverts a minus on blur unless allowNegative', async () => {
    const onValueChange = vi.fn()
    const { unmount } = render(
      <AmountInput
        aria-label="Retainer"
        currency="GBP"
        locale="en-GB"
        defaultValue={10}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    onValueChange.mockClear()
    await userEvent.type(input, '-5')
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(input).toHaveValue('')
    unmount()

    const onRefund = vi.fn()
    render(
      <AmountInput
        aria-label="Refund"
        currency="GBP"
        locale="en-GB"
        allowNegative
        onValueChange={onRefund}
      />,
    )
    const refund = screen.getByRole('textbox')
    expect(refund).toHaveAttribute('inputmode', 'text')
    await userEvent.type(refund, '-5')
    expect(onRefund).toHaveBeenLastCalledWith(-5)
  })

  it('never clamps to min/max and does not put them on the text input', async () => {
    const onValueChange = vi.fn()
    render(
      <AmountInput
        aria-label="Retainer"
        currency="GBP"
        locale="en-GB"
        max={100}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveAttribute('max')
    await userEvent.type(input, '250')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(250)
  })

  it('is controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(145000)
      return (
        <>
          <AmountInput
            aria-label="Retainer"
            currency="GBP"
            locale="en-GB"
            unit="minor"
            value={value}
            onValueChange={setValue}
          />
          <output>{String(value)}</output>
        </>
      )
    }
    render(<Controlled />)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '99.5')
    expect(screen.getByRole('status')).toHaveTextContent('9950')
    await userEvent.tab()
    expect(input).toHaveValue('99.50')
  })

  it('respects readOnly and disabled', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <AmountInput aria-label="Retainer" currency="GBP" readOnly onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '12')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('readonly')
    rerender(<AmountInput aria-label="Retainer" currency="GBP" disabled />)
    expect(input).toBeDisabled()
  })

  it('submits nothing when disabled', () => {
    render(
      <form data-testid="form">
        <AmountInput
          aria-label="Retainer"
          currency="GBP"
          name="retainer"
          defaultValue={1450}
          disabled
        />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('retainer')).toEqual([])
  })

  it('submits name as a plain number in unit', () => {
    render(
      <form data-testid="form">
        <AmountInput
          aria-label="Retainer"
          currency="GBP"
          locale="en-GB"
          unit="minor"
          name="retainer"
          defaultValue={145000}
        />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('retainer')).toBe('145000')
  })
})
