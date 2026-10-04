import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { TagsInput } from './TagsInput'
import { must } from '#test/must'

const textbox = () => screen.getByRole('textbox')
const chips = () => screen.queryAllByRole('listitem').map((item) => item.textContent)

describe('TagsInput', () => {
  it('forwards the ref to the input and className to the box', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<TagsInput ref={ref} aria-label="Labels" className="extra" />)
    expect(ref.current).toBe(textbox())
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('adds a tag on Enter and on comma (default delimiters)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagsInput aria-label="Labels" onValueChange={onValueChange} />)
    await user.type(textbox(), 'Design{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Design'])
    await user.type(textbox(), 'Release notes,')
    expect(onValueChange).toHaveBeenLastCalledWith(['Design', 'Release notes'])
    expect(chips()).toEqual(['Design', 'Release notes'])
    expect(textbox()).toHaveValue('')
  })

  it('Enter on an empty box is left alone (submits the form)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault()
    })
    const { container } = render(
      <form>
        <TagsInput aria-label="Labels" />
      </form>,
    )
    must(container.querySelector('form')).addEventListener('submit', onSubmit)
    await user.type(textbox(), 'Billing{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('custom delimiters: characters split, keys end a tag', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TagsInput
        aria-label="Labels"
        delimiters={[';', ' ', 'Tab']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textbox(), 'billing;hosting ')
    expect(onValueChange).toHaveBeenLastCalledWith(['billing', 'hosting'])
    await user.type(textbox(), 'bug')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(['billing', 'hosting', 'bug'])
    // Enter is not a delimiter here: it does nothing to the text.
    await user.type(textbox(), 'support{Enter}')
    expect(textbox()).toHaveValue('support')
  })

  it('paste splits on the delimiters (and line breaks when Enter is one)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagsInput aria-label="Labels" onValueChange={onValueChange} />)
    await user.click(textbox())
    await user.paste('Billing, Support\nDocs')
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing', 'Support', 'Docs'])
    // Without a delimiter, paste is ordinary text.
    await user.paste('Tech debt')
    expect(textbox()).toHaveValue('Tech debt')
  })

  it('rejects duplicates, empties and anything past maxTags', async () => {
    const user = userEvent.setup()
    const onReject = vi.fn()
    const onValueChange = vi.fn()
    render(
      <TagsInput
        aria-label="Labels"
        maxTags={2}
        defaultValue={['Billing']}
        onReject={onReject}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textbox(), 'Billing{Enter}')
    expect(onReject).toHaveBeenLastCalledWith('Billing', 'duplicate')
    await user.type(textbox(), '   {Enter}')
    expect(onReject).toHaveBeenLastCalledWith('   ', 'empty')
    await user.type(textbox(), 'Hosting{Enter}Bug{Enter}')
    expect(onReject).toHaveBeenLastCalledWith('Bug', 'max')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing', 'Hosting'])
  })

  it('allowDuplicates keeps repeats', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TagsInput
        aria-label="Labels"
        allowDuplicates
        defaultValue={['Billing']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textbox(), 'Billing{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing', 'Billing'])
  })

  it('normalise: trim (default), lowercase, none', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { unmount } = render(<TagsInput aria-label="Labels" onValueChange={onValueChange} />)
    await user.type(textbox(), '  Billing  {Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing'])
    unmount()
    const view = render(
      <TagsInput aria-label="Labels" normalise="lowercase" onValueChange={onValueChange} />,
    )
    await user.type(textbox(), ' Release Notes {Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['release notes'])
    view.unmount()
    render(<TagsInput aria-label="Labels" normalise="none" onValueChange={onValueChange} />)
    await user.type(textbox(), ' Bug {Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith([' Bug '])
  })

  it('Backspace on an empty box removes the last tag; with text it edits text', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TagsInput
        aria-label="Labels"
        defaultValue={['Billing', 'Hosting']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textbox(), 'G{Backspace}')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing'])
    expect(chips()).toEqual(['Billing'])
  })

  it('removes a tag with its button and refocuses the input', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TagsInput
        aria-label="Labels"
        defaultValue={['Billing', 'Hosting']}
        removeLabel={(tag) => `Remove label ${tag}`}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove label Billing' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['Hosting'])
    expect(textbox()).toHaveFocus()
  })

  it('keeps a half-typed tag when focus leaves, and fires onBlur once for the whole control', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onBlur = vi.fn()
    render(
      <>
        <TagsInput
          aria-label="Labels"
          defaultValue={['Billing']}
          onValueChange={onValueChange}
          onBlur={onBlur}
        />
        <button type="button">Next</button>
      </>,
    )
    await user.type(textbox(), 'Hosting')
    await user.tab({ shift: true }) // to the chip's remove button, still inside
    expect(onBlur).not.toHaveBeenCalled()
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['Billing', 'Hosting'])
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('is controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [tags, setTags] = useState<readonly string[]>(['Billing'])
      return (
        <>
          <TagsInput aria-label="Labels" value={tags} onValueChange={setTags} />
          <button
            type="button"
            onClick={() => {
              setTags([])
            }}
          >
            Clear all
          </button>
        </>
      )
    }
    render(<Controlled />)
    await user.type(textbox(), 'Hosting{Enter}')
    expect(chips()).toEqual(['Billing', 'Hosting'])
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(chips()).toEqual([])
  })

  it('renders one hidden input per tag for name', () => {
    const { container } = render(
      <form>
        <TagsInput aria-label="Labels" name="labels" defaultValue={['Billing', 'Hosting']} />
      </form>,
    )
    expect(new FormData(must(container.querySelector('form'))).getAll('labels')).toEqual([
      'Billing',
      'Hosting',
    ])
  })

  it('readOnly and disabled: no remove buttons, no changes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <TagsInput
        aria-label="Labels"
        readOnly
        defaultValue={['Billing']}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(textbox()).toHaveAttribute('readonly')
    await user.click(textbox())
    await user.keyboard('{Backspace}')
    expect(onValueChange).not.toHaveBeenCalled()
    rerender(
      <TagsInput
        aria-label="Labels"
        disabled
        defaultValue={['Billing']}
        onValueChange={onValueChange}
      />,
    )
    expect(textbox()).toBeDisabled()
    expect(screen.getByRole('list').closest('[data-disabled]')).not.toBeNull()
  })

  it('reads id, describedby, invalid and required from a Field', () => {
    render(
      <Field
        label="Labels"
        description="Used to filter reports"
        error="Add at least one label"
        required
      >
        <TagsInput />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: /Labels/ })
    expect(input).toHaveAccessibleDescription(/Used to filter reports.*Add at least one label/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input.closest('[data-invalid]')).not.toBeNull()
  })

  it('shows the placeholder only while there are no tags', () => {
    const { rerender } = render(
      <TagsInput aria-label="Labels" placeholder="Add a label" value={[]} />,
    )
    expect(textbox()).toHaveAttribute('placeholder', 'Add a label')
    rerender(<TagsInput aria-label="Labels" placeholder="Add a label" value={['Billing']} />)
    expect(textbox()).not.toHaveAttribute('placeholder')
  })
})
