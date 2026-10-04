import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { ColorInput } from './ColorInput'
import { normaliseHex } from './colorFormat'
import { must } from '#test/must'

const LABEL_COLOURS = [
  { value: '#FF6B57', label: 'Coral' },
  { value: '#e8b730', label: 'Gold' },
  { value: '#1f9e8f', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
] as const

describe('normaliseHex', () => {
  it('expands, lowercases and prefixes', () => {
    expect(normaliseHex('#ABC')).toBe('#aabbcc')
    expect(normaliseHex('abc')).toBe('#aabbcc')
    expect(normaliseHex(' #A1B2C3 ')).toBe('#a1b2c3')
    expect(normaliseHex('#abcd')).toBeNull()
    expect(normaliseHex('teal')).toBeNull()
  })
})

describe('ColorInput', () => {
  it('renders a hex textbox with a native picker and forwards the ref to the textbox', () => {
    const ref = createRef<HTMLElement>()
    render(<ColorInput ref={ref} aria-label="Label colour" defaultValue="#1F9E8F" />)
    const input = screen.getByRole('textbox', { name: 'Label colour' })
    expect(ref.current).toBe(input)
    expect(input).toHaveValue('#1f9e8f')
    const picker = screen.getByLabelText('Choose colour')
    expect(picker).toHaveAttribute('type', 'color')
    expect(picker).toHaveValue('#1f9e8f')
  })

  it('normalises #ABC to #aabbcc on blur', async () => {
    const onValueChange = vi.fn()
    render(<ColorInput aria-label="Colour" onValueChange={onValueChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '#ABC')
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(input).toHaveValue('#aabbcc')
    expect(onValueChange).toHaveBeenCalledWith('#aabbcc')
  })

  it('emits a full 6-digit hex while typing; reverts invalid text on blur', async () => {
    const onValueChange = vi.fn()
    render(<ColorInput aria-label="Colour" defaultValue="#112233" onValueChange={onValueChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    expect(onValueChange).toHaveBeenLastCalledWith('')
    await userEvent.type(input, 'FF6B57')
    expect(onValueChange).toHaveBeenLastCalledWith('#ff6b57')
    await userEvent.clear(input)
    await userEvent.type(input, 'zz')
    await userEvent.tab()
    expect(input).toHaveValue('')
  })

  it('takes a colour from the native picker', () => {
    const onValueChange = vi.fn()
    render(<ColorInput aria-label="Colour" onValueChange={onValueChange} />)
    fireEvent.change(screen.getByLabelText('Choose colour'), { target: { value: '#5b2a4e' } })
    expect(onValueChange).toHaveBeenCalledWith('#5b2a4e')
    expect(screen.getByRole('textbox')).toHaveValue('#5b2a4e')
  })

  it('shows swatches as a radio group with colour names', async () => {
    const onValueChange = vi.fn()
    render(
      <ColorInput
        aria-label="Label colour"
        swatches={LABEL_COLOURS}
        onValueChange={onValueChange}
      />,
    )
    const group = screen.getByRole('radiogroup', { name: 'presets' })
    const radios = screen.getAllByRole('radio')
    expect(group).toContainElement(must(radios[0]))
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual([
      'Coral',
      'Gold',
      'Teal',
      'Aubergine',
    ])
    await userEvent.click(screen.getByRole('radio', { name: 'Coral' }))
    expect(onValueChange).toHaveBeenCalledWith('#ff6b57')
    expect(screen.getByRole('radio', { name: 'Coral' })).toBeChecked()
    expect(screen.getByRole('textbox')).toHaveValue('#ff6b57')
  })

  it('checks the swatch that matches a typed value and moves with arrow keys', async () => {
    render(<ColorInput aria-label="Label colour" swatches={LABEL_COLOURS} defaultValue="#E8B730" />)
    const gold = screen.getByRole('radio', { name: 'Gold' })
    expect(gold).toBeChecked()
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.tab()
    expect(gold).toHaveFocus()
    // Held: Radix moves focus on a timeout and selects only while an arrow key is down.
    await userEvent.keyboard('{ArrowRight>}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Teal' })).toBeChecked())
    await userEvent.keyboard('{/ArrowRight}')
    expect(screen.getByRole('textbox')).toHaveValue('#1f9e8f')
  })

  it('swatchesOnly: just the radio group, which gets the ref and submits name', async () => {
    const ref = createRef<HTMLElement>()
    render(
      <form data-testid="form">
        <ColorInput
          ref={ref}
          aria-label="Label colour"
          swatches={LABEL_COLOURS}
          swatchesOnly
          name="colour"
          defaultValue="#1f9e8f"
        />
      </form>,
    )
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(ref.current).toBe(screen.getByRole('radiogroup'))
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('colour')).toEqual([
      '#1f9e8f',
    ])
    await userEvent.click(screen.getByRole('radio', { name: 'Aubergine' }))
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('colour')).toEqual([
      '#5b2a4e',
    ])
  })

  it('swatchesOnly: submits a value that matches no swatch from a hidden input', () => {
    render(
      <form data-testid="form">
        <ColorInput
          aria-label="Label colour"
          swatches={LABEL_COLOURS}
          swatchesOnly
          name="colour"
          defaultValue="#123456"
          required
        />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    expect(new FormData(form).getAll('colour')).toEqual(['#123456'])
    expect(form.checkValidity()).toBe(true)
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('swatchesOnly: a matching value is submitted exactly once', async () => {
    render(
      <form data-testid="form">
        <ColorInput
          aria-label="Label colour"
          swatches={LABEL_COLOURS}
          swatchesOnly
          name="colour"
          defaultValue="#123456"
        />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    await userEvent.click(screen.getByRole('radio', { name: 'Teal' }))
    expect(new FormData(form).getAll('colour')).toEqual(['#1f9e8f'])
  })

  it('swatchesOnly + disabled: an off-palette value submits nothing', () => {
    render(
      <form data-testid="form">
        <ColorInput
          aria-label="Label colour"
          swatches={LABEL_COLOURS}
          swatchesOnly
          name="colour"
          defaultValue="#123456"
          disabled
        />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('colour')).toEqual([])
  })

  it('swatchesOnly + required: no value leaves the form invalid', () => {
    render(
      <form data-testid="form">
        <ColorInput
          aria-label="Label colour"
          swatches={LABEL_COLOURS}
          swatchesOnly
          name="colour"
          required
        />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')
    expect(new FormData(form).getAll('colour')).toEqual([])
    expect(form.checkValidity()).toBe(false)
  })

  it('submits name from the hex input', () => {
    render(
      <form data-testid="form">
        <ColorInput aria-label="Colour" name="colour" defaultValue="#ABC" />
      </form>,
    )
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('colour')).toBe('#aabbcc')
  })

  it('is controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('#ff6b57')
      return (
        <>
          <ColorInput
            aria-label="Colour"
            swatches={LABEL_COLOURS}
            value={value}
            onValueChange={setValue}
          />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('radio', { name: 'Teal' }))
    expect(screen.getByRole('status')).toHaveTextContent('#1f9e8f')
    expect(screen.getByRole('textbox')).toHaveValue('#1f9e8f')
  })

  it('readOnly ignores swatches and the picker; disabled disables everything', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <ColorInput
        aria-label="Colour"
        swatches={LABEL_COLOURS}
        defaultValue="#ff6b57"
        readOnly
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Gold' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Coral' })).toBeChecked()
    expect(screen.getByLabelText('Choose colour')).toBeDisabled()
    rerender(<ColorInput aria-label="Colour" swatches={LABEL_COLOURS} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })

  it('fires onBlur only when focus leaves the whole control', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <ColorInput aria-label="Colour" swatches={LABEL_COLOURS} onBlur={onBlur} />
        <button type="button">Save</button>
      </>,
    )
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Coral' })).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
