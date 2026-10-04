import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { OneTimeCodeInput } from './OneTimeCodeInput'
import { must } from '#test/must'

const cells = () => screen.getAllByRole('textbox')

describe('OneTimeCodeInput', () => {
  it('renders a group of labelled cells and forwards the ref to the group', () => {
    const ref = createRef<HTMLDivElement>()
    render(<OneTimeCodeInput ref={ref} aria-label="Verification code" />)
    const group = screen.getByRole('group', { name: 'Verification code' })
    expect(ref.current).toBe(group)
    const inputs = within(group).getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
    expect(inputs[0]).toHaveAccessibleName('Digit 1 of 6')
    expect(inputs[5]).toHaveAccessibleName('Digit 6 of 6')
    expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code')
  })

  it('names cells "Character" for alphanumeric codes and honours length', () => {
    render(<OneTimeCodeInput aria-label="Code" length={4} validationType="alphanumeric" />)
    expect(cells()).toHaveLength(4)
    expect(cells()[3]).toHaveAccessibleName('Character 4 of 4')
  })

  it('advances while typing and calls onComplete once full', async () => {
    const onValueChange = vi.fn()
    const onComplete = vi.fn()
    render(
      <OneTimeCodeInput
        aria-label="Code"
        length={4}
        onValueChange={onValueChange}
        onComplete={onComplete}
      />,
    )
    await userEvent.click(must(cells()[0]))
    await userEvent.keyboard('12')
    expect(onValueChange).toHaveBeenLastCalledWith('12')
    expect(cells()[2]).toHaveFocus()
    expect(onComplete).not.toHaveBeenCalled()
    await userEvent.keyboard('34')
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('ignores characters the validation type rejects', async () => {
    const onValueChange = vi.fn()
    render(<OneTimeCodeInput aria-label="Code" onValueChange={onValueChange} />)
    await userEvent.click(must(cells()[0]))
    await userEvent.keyboard('a')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(cells()[0]).toHaveValue('')
  })

  it('fills every cell from a paste and completes', async () => {
    const onComplete = vi.fn()
    render(<OneTimeCodeInput aria-label="Code" onComplete={onComplete} />)
    await userEvent.click(must(cells()[0]))
    await userEvent.paste('482913')
    expect(
      cells()
        .map((c) => (c as HTMLInputElement).value)
        .join(''),
    ).toBe('482913')
    expect(onComplete).toHaveBeenCalledWith('482913')
  })

  it('is controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('48')
      return (
        <>
          <OneTimeCodeInput aria-label="Code" value={value} onValueChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue('')
            }}
          >
            Clear
          </button>
        </>
      )
    }
    render(<Controlled />)
    expect(cells()[1]).toHaveValue('8')
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(cells()[0]).toHaveValue('')
  })

  it('ignores typing and paste when readOnly; disables every cell when disabled', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <OneTimeCodeInput
        aria-label="Code"
        defaultValue="12"
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(cells()[0]).toHaveAttribute('readonly')
    await userEvent.click(must(cells()[2]))
    await userEvent.keyboard('3')
    await userEvent.paste('999999')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(cells()[0]).toHaveValue('1')
    rerender(<OneTimeCodeInput aria-label="Code" disabled />)
    for (const cell of cells()) expect(cell).toBeDisabled()
  })

  it('submits name as one value', () => {
    render(
      <form data-testid="form">
        <OneTimeCodeInput aria-label="Code" name="code" defaultValue="482913" />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('code')).toBe('482913')
  })

  it('submits nothing when disabled', () => {
    render(
      <form data-testid="form">
        <OneTimeCodeInput aria-label="Code" name="code" defaultValue="482913" disabled />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('code')).toEqual([])
  })

  it('fires onBlur only when focus leaves the group', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <OneTimeCodeInput aria-label="Code" length={4} onBlur={onBlur} />
        <button type="button">Verify</button>
      </>,
    )
    await userEvent.click(must(cells()[0]))
    await userEvent.keyboard('12')
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('marks every cell invalid', () => {
    render(<OneTimeCodeInput aria-label="Code" invalid />)
    for (const cell of cells()) expect(cell).toHaveAttribute('aria-invalid', 'true')
  })
})
