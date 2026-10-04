import { useState as useStateHook } from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { FieldPresentation } from '#core/binding/presentation'
import { kit, useFields } from '#kit'
import { renderForm } from '#test/renderForm'
import { resolveFormPath } from '#core/kit/formPath'

type Info = Record<string, { instance: { options: { validators?: object } } | null } | undefined>
const fieldInfo = (form: object) => (form as unknown as { fieldInfo: Info }).fieldInfo
const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

const Account = kit.withFieldGroup({
  defaultValues: { email: '', city: '' },
  render: function Account({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.TextField name="email" label="Email" />
        <group.AppField name="city">{(field) => <field.TextField label="City" />}</group.AppField>
      </>
    )
  },
})

describe('view mode without a TanStack field', () => {
  it('canonical path: form.AppField in view mode creates no instance and renders the value', () => {
    const { form } = renderForm(
      (f) => <f.AppField name="name">{(field) => <field.TextField label="Name" />}</f.AppField>,
      { defaultValues: { name: 'Ada' }, formProps: { mode: 'view' } },
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(fieldInfo(form).name?.instance ?? null).toBeNull()
  })

  it('canonical path: edit mode is unchanged', async () => {
    const { form, user } = renderForm(
      (f) => <f.AppField name="name">{(field) => <field.TextField label="Name" />}</f.AppField>,
      { defaultValues: { name: '' } },
    )
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Grace')
    expect(form.state.values.name).toBe('Grace')
    expect(fieldInfo(form).name?.instance).not.toBeNull()
  })

  it('canonical-path review copy: invalid submit is blocked and focuses the real field; unmounting keeps its errors', async () => {
    const onSubmit = vi.fn()
    let hide: () => void = () => undefined
    function Review({ children }: { children: React.ReactNode }) {
      const [shown, setShown] = useStateHook(true)
      hide = () => {
        setShown(false)
      }
      return shown ? <FieldPresentation mode="view">{children}</FieldPresentation> : null
    }
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Full name" validators={{ onDynamic: required }} />
          <Review>
            <f.AppField name="name">{(field) => <field.TextField label="Full name" />}</f.AppField>
          </Review>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: '' }, onSubmit },
    )
    expect(fieldInfo(form).name?.instance?.options.validators).toHaveProperty('onDynamic')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveFocus())
    expect(onSubmit).not.toHaveBeenCalled()
    act(() => {
      hide()
    })
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(fieldInfo(form).name?.instance?.options.validators).toHaveProperty('onDynamic')
  })

  it('field group: view mode resolves the group path (shorthand and canonical) with no instance', () => {
    const { form } = renderForm((f) => <Account form={f} fields="account" />, {
      defaultValues: { account: { email: 'ada@example.com', city: 'Leeds' } },
      formProps: { mode: 'view' },
    })
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Leeds')).toBeInTheDocument()
    expect(fieldInfo(form)['account.email']?.instance ?? null).toBeNull()
    expect(fieldInfo(form)['account.city']?.instance ?? null).toBeNull()
  })

  it('resolveFormPath maps nested group names to the form path', () => {
    const root = { fieldInfo: {} }
    const outer = { form: root, getFormFieldName: (n: string) => `profile.${n}` }
    const inner = { form: outer, getFormFieldName: (n: string) => `address.${n}` }
    const resolved = resolveFormPath(inner, 'city')
    expect(resolved.name).toBe('profile.address.city')
    expect(resolved.form).toBe(root)
    expect(resolveFormPath(root, 'name')).toEqual({ form: root, name: 'name' })
  })
})
