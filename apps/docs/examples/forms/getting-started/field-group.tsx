'use client'

import { Form, SubmitButton, useAppForm, useFields, withFieldGroup } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

// One reusable pair of fields, bound wherever a form has `{ next, confirm }`.
const NewPassword = withFieldGroup({
  defaultValues: { next: '', confirm: '' },
  render: function NewPassword({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.PasswordField
          name="next"
          label="New password"
          autoComplete="new-password"
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <fields.PasswordField
          name="confirm"
          label="Type it again"
          autoComplete="new-password"
          validators={{
            onChangeListenTo: ['next'],
            onDynamic: ({ value }) =>
              value === group.getFieldValue('next') ? undefined : "The two passwords don't match",
          }}
        />
      </>
    )
  },
})

export default function FieldGroup() {
  const form = useAppForm({ defaultValues: { password: { next: '', confirm: '' } } })
  return (
    <Form form={form} aria-label="Change password">
      <Stack gap={5}>
        <NewPassword form={form} fields="password" />
        <SubmitButton>Change password</SubmitButton>
      </Stack>
    </Form>
  )
}
