import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { NumberInput } from './NumberInput'
import { decimalsOf, parseNumber, roundTo } from './numberFormat'

describe('numberFormat', () => {
  it('parses locale text with group and decimal separators', () => {
    expect(parseNumber('1.234,5', 'de-DE')).toBe(1234.5)
    expect(parseNumber('1,234.5', 'en-US')).toBe(1234.5)
    expect(parseNumber('1 234,5', 'fr-FR')).toBe(1234.5)
    expect(parseNumber('−12', 'en-US')).toBe(-12)
    expect(parseNumber('', 'en-US')).toBeNull()
    expect(parseNumber('1.2.3', 'en-US')).toBeNaN()
    expect(parseNumber('-', 'en-US')).toBeNaN()
  })

  it('knows step decimals and rounds without the float trap', () => {
    expect(decimalsOf(1)).toBe(0)
    expect(decimalsOf(0.25)).toBe(2)
    expect(decimalsOf(1e-7)).toBe(7)
    expect(roundTo(1.005, 2)).toBe(1.01)
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3)
  })
})

describe('NumberInput', () => {
  it('is a spinbutton text input with value attributes, and forwards the ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <NumberInput
        ref={ref}
        aria-label="Guests"
        locale="en-US"
        min={1}
        max={12}
        defaultValue={4}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Guests' })
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('aria-valuenow', '4')
    expect(input).toHaveAttribute('aria-valuemin', '1')
    expect(input).toHaveAttribute('aria-valuemax', '12')
    expect(input).toHaveAttribute('aria-valuetext', '4')
    expect(input).toHaveAttribute('inputmode', 'numeric')
  })

  it('handles the full spinbutton key map', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Guests"
        locale="en-US"
        min={0}
        max={50}
        defaultValue={5}
        onValueChange={onValueChange}
        stepper={false}
      />,
    )
    const input = screen.getByRole('spinbutton')
    act(() => {
      input.focus()
    })
    await userEvent.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-valuenow', '6')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveAttribute('aria-valuenow', '4')
    await userEvent.keyboard('{PageUp}')
    expect(input).toHaveAttribute('aria-valuenow', '14')
    await userEvent.keyboard('{PageDown}{PageDown}')
    expect(input).toHaveAttribute('aria-valuenow', '0')
    await userEvent.keyboard('{End}')
    expect(input).toHaveAttribute('aria-valuenow', '50')
    expect(input).toHaveValue('50')
    await userEvent.keyboard('{Home}')
    expect(input).toHaveAttribute('aria-valuenow', '0')
    await userEvent.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-valuenow', '0')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it('uses largeStep for PageUp and steps from empty to the nearest bound', async () => {
    render(
      <NumberInput
        aria-label="Guests"
        locale="en-US"
        min={2}
        step={2}
        largeStep={6}
        stepper={false}
      />,
    )
    const input = screen.getByRole('spinbutton')
    act(() => {
      input.focus()
    })
    await userEvent.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-valuenow', '2')
    await userEvent.keyboard('{PageUp}')
    expect(input).toHaveAttribute('aria-valuenow', '8')
  })

  it('shows raw text while focused and the formatted number when blurred', async () => {
    render(<NumberInput aria-label="Distance" locale="en-US" step={0.1} defaultValue={1450.5} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue('1,450.5')
    await userEvent.click(input)
    expect(input).toHaveValue('1450.5')
    await userEvent.tab()
    expect(input).toHaveValue('1,450.5')
  })

  it('parses de-DE text while typing and commits it formatted', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Betrag" locale="de-DE" step={0.1} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '1.234,5')
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5)
    await userEvent.tab()
    expect(input).toHaveValue('1.234,5')
    expect(input).toHaveAttribute('aria-valuenow', '1234.5')
  })

  it('clamps and rounds to step precision on blur and Enter; empty is null', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Guests"
        locale="en-US"
        min={1}
        max={12}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '40')
    expect(onValueChange).toHaveBeenLastCalledWith(40)
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(12)
    expect(input).toHaveValue('12')
    await userEvent.clear(input)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await userEvent.type(input, '2.6')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(3)
  })

  it('reverts text that is not a number on blur and never emits NaN', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Guests"
        locale="en-US"
        defaultValue={3}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '1.2.3')
    for (const [arg] of onValueChange.mock.calls) expect(Number.isNaN(arg)).toBe(false)
    await userEvent.tab()
    expect(input).toHaveValue('1.2')
  })

  it('does not clamp on blur with clampOnBlur={false}', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Guests"
        locale="en-US"
        max={12}
        clampOnBlur={false}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.type(screen.getByRole('spinbutton'), '40')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(40)
  })

  it('stepper buttons step, keep out of the tab order, and disable at the bounds', async () => {
    render(<NumberInput aria-label="Guests" locale="en-US" min={1} max={3} defaultValue={2} />)
    const input = screen.getByRole('spinbutton')
    const inc = screen.getByRole('button', { name: 'Increase' })
    const dec = screen.getByRole('button', { name: 'Decrease' })
    expect(inc).toHaveAttribute('tabindex', '-1')
    expect(inc).toHaveAttribute('aria-controls', input.id)
    await userEvent.click(inc)
    expect(input).toHaveAttribute('aria-valuenow', '3')
    expect(inc).toBeDisabled()
    await userEvent.click(dec)
    await userEvent.click(dec)
    expect(input).toHaveAttribute('aria-valuenow', '1')
    expect(dec).toBeDisabled()
  })

  it('is controlled: follows value and reports changes', async () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(7)
      return (
        <>
          <NumberInput aria-label="Guests" locale="en-US" value={value} onValueChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue(null)
            }}
          >
            Reset
          </button>
          <output>{String(value)}</output>
        </>
      )
    }
    render(<Controlled />)
    const input = screen.getByRole('spinbutton')
    act(() => {
      input.focus()
    })
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('status')).toHaveTextContent('8')
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input).toHaveValue('')
    expect(input).not.toHaveAttribute('aria-valuenow')
  })

  it('ignores keys and steppers when readOnly or disabled', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NumberInput aria-label="Guests" defaultValue={2} readOnly onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('readonly')
    act(() => {
      input.focus()
    })
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
    rerender(
      <NumberInput aria-label="Guests" defaultValue={2} disabled onValueChange={onValueChange} />,
    )
    expect(input).toBeDisabled()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('submits name as a plain number from a hidden input', () => {
    render(
      <form data-testid="form">
        <NumberInput
          aria-label="Distance"
          locale="de-DE"
          name="distance"
          defaultValue={1234.5}
          step={0.1}
        />
      </form>,
    )
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(data.get('distance')).toBe('1234.5')
    expect(screen.getByRole('spinbutton')).not.toHaveAttribute('name')
  })

  it('submits nothing when disabled', () => {
    render(
      <form data-testid="form">
        <NumberInput aria-label="Distance" name="distance" defaultValue={12} disabled />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('distance')).toEqual([])
  })

  it('edits percentages as whole numbers', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Deposit"
        locale="en-US"
        formatOptions={{ style: 'percent' }}
        defaultValue={0.15}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue('15%')
    await userEvent.click(input)
    expect(input).toHaveValue('15')
    await userEvent.clear(input)
    await userEvent.type(input, '20')
    expect(onValueChange).toHaveBeenLastCalledWith(0.2)
  })

  it('ignores the mouse wheel', () => {
    render(<NumberInput aria-label="Guests" defaultValue={2} />)
    const input = screen.getByRole('spinbutton')
    act(() => {
      input.focus()
    })
    fireEvent.wheel(input, { deltaY: -100 })
    expect(input).toHaveAttribute('aria-valuenow', '2')
  })
})
