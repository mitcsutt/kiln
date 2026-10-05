import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormTextField } from '#components/fields/FormTextField'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'

runFieldConformance<string>('text', {
  build: (props) => <FormTextField {...props} />,
  valid: 'Ada Lovelace',
  invalid: '',
  interact: async (user, control, value) => {
    await user.clear(control)
    if (value) await user.type(control, value)
  },
})

describe('FormTextField', () => {
  it('binds through the typed shorthand and writes strings', async () => {
    const { form, user } = renderForm(
      (f) => <f.TextField name="name" label="Full name" autoComplete="name" />,
      {
        defaultValues: { name: '' },
      },
    )
    await user.type(screen.getByLabelText('Full name'), 'Grace')
    expect(form.state.values.name).toBe('Grace')
  })

  it('uses a useId-based id, so two forms with the same field name never collide', () => {
    renderForm((f) => <f.TextField name="name" label="First form" />, {
      defaultValues: { name: '' },
    })
    renderForm((f) => <f.TextField name="name" label="Second form" />, {
      defaultValues: { name: '' },
    })
    const a = screen.getByLabelText('First form')
    const b = screen.getByLabelText('Second form')
    expect(a.id).not.toBe(b.id)
    expect(a.id).not.toBe('name')
    expect(a).toHaveAttribute('name', 'name')
    expect(a).toHaveAttribute('data-field', 'name')
  })

  it('shows Standard Schema issues as text, never [object Object]', async () => {
    const { user } = renderForm((f) => <f.TextField name="email" label="Email" type="email" />, {
      defaultValues: { email: '' },
      validators: {
        onDynamic: {
          '~standard': {
            version: 1,
            vendor: 'test',
            validate: () => ({ issues: [{ message: 'Enter an email address', path: ['email'] }] }),
          },
        },
      },
    })
    await user.click(screen.getByLabelText('Email'))
    await user.tab()
    expect(await screen.findByText('Enter an email address')).toBeInTheDocument()
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument()
  })
})
