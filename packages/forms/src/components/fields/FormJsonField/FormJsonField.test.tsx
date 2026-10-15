import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FormJsonField } from '#components/fields/FormJsonField'
import { SubmitButton } from '#components/form/SubmitButton'
import { parseFormSchema } from '#schema/core/parseFormSchema'
import { toStandardSchema } from '#schema/core/toStandardSchema'
import { defaultFields } from '#components/fields/defaultFields'
import { kit } from '#kit/defaultKit'
import { runFieldConformance } from '#test/conformance'
import { must } from '#test/must'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('json', {
  build: (props) => <FormJsonField {...props} />,
  valid: '{"retries":3}',
  invalid: '',
  interact: async (user, control, value) => {
    await user.clear(control)
    // Paste, not type: typing `{` closes it for you.
    if (value) {
      control.focus()
      await user.paste(value)
    }
  },
  // Tab indents inside the editor; Escape, then Tab, leaves it.
  leaveControl: async (user) => {
    await user.keyboard('{Escape}')
    await user.tab()
  },
  // View mode shows the JSON formatted, over several lines.
  viewText: (_, element) =>
    element?.tagName === 'PRE' && element.textContent.includes('"retries": 3'),
})

/** Sets the editor's text the way a paste or an edit does: one change event. */
function setText(control: HTMLElement, text: string) {
  fireEvent.change(control, { target: { value: text } })
}

describe('FormJsonField', () => {
  it('binds the JSON text through the typed shorthand, exactly as written', () => {
    const { form } = renderForm((f) => <f.JsonField name="payload" label="Request body" />, {
      defaultValues: { payload: '' },
    })
    setText(screen.getByLabelText('Request body'), '{ "id": 12345678901234567890 }')
    expect(form.state.values.payload).toBe('{ "id": 12345678901234567890 }')
  })

  it('blocks submit on text that does not parse, saying where, and focuses the editor', async () => {
    const onSubmit = vi.fn()
    const { user, form } = renderForm(
      (f) => (
        <>
          <f.JsonField name="payload" label="Request body" />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { payload: '' }, onSubmit },
    )
    const editor = screen.getByLabelText('Request body')
    setText(editor, '{\n  "retries": 3,\n}')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText('Line 2, column 15: Remove this comma: nothing follows it'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(editor).toHaveFocus()
    })
    // The text is kept as typed, so nothing is lost while it's fixed.
    expect(form.state.values.payload).toBe('{\n  "retries": 3,\n}')

    setText(editor, '{\n  "retries": 3\n}')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('submits empty text unless it is required', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.JsonField name="payload" label="Request body" />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { payload: '' }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('runs `validate` on the parsed value, and the field validators only on valid JSON', async () => {
    const onDynamic = vi.fn(() => undefined)
    const { user } = renderForm(
      (f) => (
        <>
          <f.JsonField
            name="payload"
            label="Request body"
            validators={{ onDynamic }}
            validate={(value) =>
              Array.isArray(value) ? undefined : 'Send a list of events, in square brackets'
            }
          />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { payload: '{"type":"open"}' } },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Send a list of events, in square brackets')).toBeInTheDocument()
    expect(onDynamic).not.toHaveBeenCalled()

    setText(screen.getByLabelText('Request body'), '[{"type":"open"}]')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onDynamic).toHaveBeenCalled()
    })
    expect(screen.queryByText('Send a list of events, in square brackets')).not.toBeInTheDocument()
  })

  it('leaves a disabled field out of the check, like its validators', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.JsonField name="payload" label="Request body" disabled />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { payload: '{ not json' }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('takes the error text from messages.invalidJson', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.JsonField name="payload" label="Request body" />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      {
        defaultValues: { payload: '[1, 2' },
        messages: { invalidJson: () => 'That JSON is unfinished' },
      },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('That JSON is unfinished')).toBeInTheDocument()
  })

  it('shows the JSON formatted in view mode, with a copy button and no editor', () => {
    const { container } = renderForm((f) => <f.JsonField name="payload" label="Request body" />, {
      defaultValues: { payload: '{"retries":3,"backoff":"linear"}' },
      formProps: { mode: 'view' },
    })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    const code = must(container.querySelector('pre'))
    expect(code.textContent).toContain('"retries": 3,')
    expect(code.textContent).toContain('"backoff": "linear"')
    expect(screen.getByRole('button', { name: 'Copy JSON' })).toBeInTheDocument()
  })

  it('shows text that does not parse as written in view mode, and empty as not provided', () => {
    renderForm(
      (f) => (
        <>
          <f.JsonField name="draft" label="Draft" />
          <f.JsonField name="empty" label="Empty" />
        </>
      ),
      {
        defaultValues: { draft: '{ "retries": ', empty: '' },
        formProps: { mode: 'view' },
      },
    )
    expect(screen.getByText('{ "retries":')).toBeInTheDocument()
    const empty = must(screen.getByText('Empty').closest('div'))
    expect(within(empty).getByText('Not provided')).toBeInTheDocument()
  })

  it('restores the default text on reset', async () => {
    const { form } = renderForm((f) => <f.JsonField name="payload" label="Request body" />, {
      defaultValues: { payload: '{"retries":3}' },
    })
    const editor = screen.getByLabelText('Request body')
    setText(editor, '{')
    act(() => {
      form.reset()
    })
    await waitFor(() => {
      expect(editor).toHaveValue('{"retries":3}')
    })
  })
})

describe('FormJsonField in a schema', () => {
  const schema = {
    version: 1,
    root: {
      layout: 'stack',
      children: [{ kind: 'json', name: 'payload', label: 'Request body', maxRows: 12 }],
    },
  } as const

  it('parses, renders and checks the text in the browser', async () => {
    const parsed = parseFormSchema(schema, { kinds: defaultFields })
    expect(parsed.ok).toBe(true)
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (form) => (
        <>
          <kit.SchemaForm form={form} schema={schema} />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { payload: '{ "retries": }' }, onSubmit },
    )
    expect(screen.getByLabelText('Request body')).toHaveValue('{ "retries": }')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText(/^Line 1, column 14: /)).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('checks the text on a server too', async () => {
    const standard = toStandardSchema(schema)['~standard']
    expect(await standard.validate({ payload: '{ "retries": }' })).toEqual({
      issues: [{ message: 'Enter valid JSON', path: ['payload'] }],
    })
    expect(await standard.validate({ payload: { retries: 3 } })).toEqual({
      issues: [{ message: 'Enter valid JSON', path: ['payload'] }],
    })
    expect(await standard.validate({ payload: '{ "retries": 3 }' })).toEqual({
      value: { payload: '{ "retries": 3 }' },
    })
    expect(await standard.validate({ payload: '' })).toEqual({ value: { payload: '' } })
  })
})
