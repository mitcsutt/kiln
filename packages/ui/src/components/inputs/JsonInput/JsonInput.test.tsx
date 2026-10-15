import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { must } from '#test/must'
import { JsonInput } from './JsonInput'

const textbox = () => screen.getByRole<HTMLTextAreaElement>('textbox')
/** The editor's own live region (the copy button has another). */
const announced = () => must(screen.getAllByRole('status').at(-1))

describe('JsonInput', () => {
  it('highlights and numbers the lines, and forwards its ref to the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    const { container } = render(<JsonInput ref={ref} defaultValue={'{\n  "id": 7\n}'} />)
    expect(ref.current).toBe(textbox())
    expect(textbox()).toHaveValue('{\n  "id": 7\n}')
    const lines = container.querySelectorAll('pre [data-line]')
    expect([...lines].map((line) => line.getAttribute('data-line'))).toEqual(['1', '2', '3'])
    expect(container.querySelector('[data-token="type"]')).toHaveTextContent('"id"')
    expect(container.querySelector('[data-token="constant"]')).toHaveTextContent('7')
    expect(container.querySelector('pre')).toHaveAttribute('aria-hidden', 'true')
    expect(textbox()).toHaveAttribute('spellcheck', 'false')
  })

  it('reports the text and what it holds on every change', () => {
    const onValueChange = vi.fn()
    render(<JsonInput onValueChange={onValueChange} />)
    fireEvent.change(textbox(), { target: { value: '{"stops": 7}' } })
    expect(onValueChange).toHaveBeenLastCalledWith('{"stops": 7}', {
      parsed: { stops: 7 },
      valid: true,
    })
    fireEvent.change(textbox(), { target: { value: '{"stops": 7,}' } })
    expect(onValueChange).toHaveBeenLastCalledWith('{"stops": 7,}', {
      parsed: undefined,
      valid: false,
      error: { message: 'Remove this comma: nothing follows it', line: 1, column: 12 },
    })
  })

  it('shows an error once typing pauses, marks its line, and clears it at once', () => {
    vi.useFakeTimers()
    const onValidationChange = vi.fn()
    const { container } = render(
      <JsonInput defaultValue="[1, 2]" onValidationChange={onValidationChange} />,
    )
    fireEvent.change(textbox(), { target: { value: '[1,\n 2,]' } })
    expect(textbox()).not.toHaveAttribute('aria-invalid')
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(textbox()).toHaveAttribute('aria-invalid', 'true')
    expect(container.querySelector('[data-error]')).toHaveAttribute('data-line', '2')
    expect(onValidationChange.mock.lastCall?.[0]).toMatchObject({
      valid: false,
      error: { line: 2 },
    })
    fireEvent.change(textbox(), { target: { value: '[1,\n 2]' } })
    expect(textbox()).not.toHaveAttribute('aria-invalid')
    expect(container.querySelector('[data-error]')).toBeNull()
    vi.useRealTimers()
  })

  it('shows an error straight away on blur', () => {
    render(<JsonInput defaultValue="" />)
    fireEvent.change(textbox(), { target: { value: '{"a" 1}' } })
    fireEvent.blur(textbox())
    expect(textbox()).toHaveAttribute('aria-invalid', 'true')
  })

  it('treats empty text as valid', () => {
    const onValueChange = vi.fn()
    render(<JsonInput defaultValue="1" onValueChange={onValueChange} />)
    fireEvent.change(textbox(), { target: { value: '  ' } })
    expect(onValueChange).toHaveBeenLastCalledWith('  ', { parsed: undefined, valid: true })
  })

  it('runs validate on a value that parses', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <JsonInput
        onValueChange={onValueChange}
        validate={(value) => (Array.isArray(value) ? undefined : 'Expected a list of stops')}
      />,
    )
    fireEvent.change(textbox(), { target: { value: '{"a": 1}' } })
    fireEvent.blur(textbox())
    expect(onValueChange).toHaveBeenLastCalledWith('{"a": 1}', {
      parsed: { a: 1 },
      valid: false,
      error: { message: 'Expected a list of stops' },
    })
    expect(textbox()).toHaveAttribute('aria-invalid', 'true')
    expect(container.querySelector('[data-error]')).toBeNull()
  })

  it('formats and minifies from the toolbar, and announces it', async () => {
    const user = userEvent.setup()
    render(<JsonInput defaultValue='{"b":[1,2],"a":1.50}' indent={4} />)
    await user.click(screen.getByRole('button', { name: 'Format' }))
    expect(textbox()).toHaveValue('{\n    "b": [\n        1,\n        2\n    ],\n    "a": 1.50\n}')
    expect(announced()).toHaveTextContent('Formatted')
    expect(textbox()).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Minify' }))
    expect(textbox()).toHaveValue('{"b":[1,2],"a":1.50}')
    expect(announced()).toHaveTextContent('Minified')
  })

  it('never reformats invalid text, and says why', async () => {
    const user = userEvent.setup()
    render(<JsonInput defaultValue={'{\n"a": 1,,\n}'} />)
    await user.click(screen.getByRole('button', { name: 'Format' }))
    expect(textbox()).toHaveValue('{\n"a": 1,,\n}')
    expect(announced()).toHaveTextContent('Fix the error on line 2 first')
    expect(textbox()).toHaveAttribute('aria-invalid', 'true')
  })

  it('sorts keys when asked, and formats with Shift+Alt+F', async () => {
    const user = userEvent.setup()
    render(<JsonInput defaultValue='{"b":1,"a":2}' sortKeys />)
    await user.click(textbox())
    await user.keyboard('{Shift>}{Alt>}F{/Alt}{/Shift}')
    expect(textbox()).toHaveValue('{\n  "a": 2,\n  "b": 1\n}')
  })

  it('formats on blur when the text is valid', () => {
    const onValueChange = vi.fn()
    render(
      <JsonInput defaultValue='{"a":1}' formatOnBlur indent="tab" onValueChange={onValueChange} />,
    )
    fireEvent.blur(textbox())
    expect(textbox()).toHaveValue('{\n\t"a": 1\n}')
    expect(onValueChange).toHaveBeenLastCalledWith('{\n\t"a": 1\n}', {
      parsed: { a: 1 },
      valid: true,
    })
  })

  it('indents with Tab, outdents with Shift+Tab, and leaves after Escape', async () => {
    const user = userEvent.setup()
    render(
      <>
        <JsonInput defaultValue={'{\n"a": 1\n}'} toolbar={false} />
        <button type="button">Save</button>
      </>,
    )
    const area = textbox()
    await user.click(area)
    area.setSelectionRange(2, 2)
    await user.keyboard('{Tab}')
    expect(area).toHaveValue('{\n  "a": 1\n}')
    expect(area).toHaveFocus()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(area).toHaveValue('{\n"a": 1\n}')
    await user.keyboard('{Escape}')
    expect(announced()).toHaveTextContent('Press Tab to leave the editor')
    await user.keyboard('{Tab}')
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  })

  it('indents every selected line', async () => {
    const user = userEvent.setup()
    render(<JsonInput defaultValue={'[\n1,\n2\n]'} toolbar={false} />)
    const area = textbox()
    await user.click(area)
    area.setSelectionRange(2, 6)
    await user.keyboard('{Tab}')
    expect(area).toHaveValue('[\n  1,\n  2\n]')
    expect([area.selectionStart, area.selectionEnd]).toEqual([2, 10])
  })

  it('closes brackets and quotes, steps over closers and keeps the indent on Enter', async () => {
    const user = userEvent.setup()
    render(<JsonInput toolbar={false} />)
    const area = textbox()
    await user.click(area)
    await user.keyboard('{{')
    expect(area).toHaveValue('{}')
    await user.keyboard('{Enter}')
    expect(area).toHaveValue('{\n  \n}')
    await user.keyboard('"')
    expect(area).toHaveValue('{\n  ""\n}')
    await user.keyboard('id"')
    expect(area).toHaveValue('{\n  "id"\n}')
    await user.keyboard(': [[{Backspace}7')
    expect(area).toHaveValue('{\n  "id": 7\n}')
    await user.keyboard(', "stops": [[1]')
    expect(area).toHaveValue('{\n  "id": 7, "stops": [1]\n}')
    expect(area.selectionStart).toBe(area.value.length - 2)
  })

  it('types brackets plainly without autoClose', async () => {
    const user = userEvent.setup()
    render(<JsonInput toolbar={false} autoClose={false} />)
    await user.click(textbox())
    await user.keyboard('[[')
    expect(textbox()).toHaveValue('[')
  })

  it('is a viewer when read-only: copy only, and Tab moves on', async () => {
    const user = userEvent.setup()
    render(
      <>
        <JsonInput readOnly defaultValue='{"a":1}' />
        <button type="button">Next</button>
      </>,
    )
    expect(screen.queryByRole('button', { name: 'Format' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Copy JSON' })).toBeInTheDocument()
    expect(textbox()).toHaveAttribute('readonly')
    expect(textbox()).not.toHaveAccessibleDescription()
    await user.click(textbox())
    await user.keyboard('{Tab}')
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('takes its label, description and state from a Field, and describes the Tab key', () => {
    render(
      <Field label="Payload" description="Sent as the request body" error="Required" required>
        <JsonInput />
      </Field>,
    )
    const area = screen.getByLabelText(/Payload/)
    expect(area).toBe(textbox())
    expect(area).toHaveAttribute('aria-invalid', 'true')
    expect(area).toHaveAttribute('aria-required', 'true')
    expect(must(area.getAttribute('aria-describedby')).split(' ')).toHaveLength(3)
    expect(area).toHaveAccessibleDescription(
      expect.stringContaining('Press Escape, then Tab, to leave the editor'),
    )
  })

  it('follows a controlled value', () => {
    function Controlled() {
      const [json, setJson] = useState('[]')
      return (
        <>
          <JsonInput
            value={json}
            onValueChange={(text) => {
              setJson(text.toUpperCase())
            }}
          />
          <output>{json}</output>
        </>
      )
    }
    render(<Controlled />)
    fireEvent.change(textbox(), { target: { value: '[true]' } })
    expect(textbox()).toHaveValue('[TRUE]')
  })

  it('maps rows and wrap to the box', () => {
    const { container } = render(<JsonInput minRows={6} maxRows={20} wrap lineNumbers={false} />)
    const root = must(container.firstElementChild) as HTMLElement
    expect(root.style.getPropertyValue('--_min-rows')).toBe('6')
    expect(root.style.getPropertyValue('--_max-rows')).toBe('20')
    expect(root).toHaveAttribute('data-wrap')
    expect(root).not.toHaveAttribute('data-line-numbers')
    expect(textbox()).toHaveAttribute('wrap', 'soft')
  })
})
