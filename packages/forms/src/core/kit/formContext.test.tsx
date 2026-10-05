import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '#components/Form'
import { useFormContext } from '#core/contexts'
import { useFieldValue } from '#core/hooks/useFieldValue'
import { useFormStatus } from '#core/hooks/useFormStatus'
import { formOptions } from '#core/kit/formOptions'
import { kit } from '#kit'

const contactOptions = formOptions({
  defaultValues: { name: '', email: '', contact: { phone: '' } },
})

// Three components between the form and the code that reads it, none of them passing `form`.
function Section({ children }: { children: ReactNode }) {
  return <section>{children}</section>
}
function Panel({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

function PhoneField() {
  const form = kit.useTypedAppFormContext(contactOptions)
  return <form.TextField name="contact.phone" label="Phone" />
}

function Greeting() {
  const form = kit.useTypedAppFormContext(contactOptions)
  const name = useFieldValue(form, 'name')
  return <output aria-label="Greeting">{name ? `Hello, ${name}` : 'Hello'}</output>
}

function DirtyFlag() {
  const { isDirty } = useFormStatus()
  return <output aria-label="Dirty">{isDirty ? 'Unsaved changes' : 'Saved'}</output>
}

function Deep() {
  return (
    <Section>
      <Panel>
        <Section>
          <PhoneField />
          <Greeting />
          <DirtyFlag />
        </Section>
      </Panel>
    </Section>
  )
}

function ContactForm({
  onSubmit,
  mode,
}: {
  onSubmit?: (value: typeof contactOptions.defaultValues) => void
  mode?: 'edit' | 'view'
}) {
  const form = kit.useAppForm({
    ...contactOptions,
    onSubmit: ({ value }) => {
      onSubmit?.(value)
    },
  })
  return (
    <Form form={form} mode={mode} aria-label="Contact">
      <form.TextField name="name" label="Name" />
      <Deep />
      <button type="submit">Save</button>
    </Form>
  )
}

describe('form context in nested components', () => {
  it('binds a field several components below <Form>, and submits its value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Phone'), '0123 456')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: '',
      email: '',
      contact: { phone: '0123 456' },
    })
  })

  it('reads values and form state below <Form>, re-rendering as they change', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    expect(screen.getByLabelText('Greeting')).toHaveTextContent('Hello')
    expect(screen.getByLabelText('Dirty')).toHaveTextContent('Saved')
    await user.type(screen.getByLabelText('Name'), 'Ada')
    expect(screen.getByLabelText('Greeting')).toHaveTextContent('Hello, Ada')
    expect(screen.getByLabelText('Dirty')).toHaveTextContent('Unsaved changes')
  })

  it('works under <form.AppForm> as well as <Form>', async () => {
    const user = userEvent.setup()
    function Bare() {
      const form = kit.useAppForm(contactOptions)
      return (
        <form.AppForm>
          <form.TextField name="name" label="Name" />
          <Deep />
        </form.AppForm>
      )
    }
    render(<Bare />)
    await user.type(screen.getByLabelText('Name'), 'Grace')
    await user.type(screen.getByLabelText('Phone'), '999')
    expect(screen.getByLabelText('Greeting')).toHaveTextContent('Hello, Grace')
    expect(screen.getByLabelText('Phone')).toHaveValue('999')
  })

  it('renders a nested field for reading in view mode', () => {
    render(<ContactForm mode="view" />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('throws a clear error outside a form', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Typed() {
      kit.useTypedAppFormContext(contactOptions)
      return null
    }
    function Untyped() {
      useFormContext()
      return null
    }
    const message = /No form in context: render this component inside <Form form=\{form\}>/
    expect(() => render(<Typed />)).toThrow(message)
    expect(() => render(<Untyped />)).toThrow(message)
  })
})
