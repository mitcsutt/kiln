import {
  Form,
  FormActions,
  FormAside,
  SubmitButton,
  useAppForm,
  useUnsavedChanges,
} from '@mitcsutt/kiln-forms'
import { Text, toast } from '@mitcsutt/kiln-ui'

import { delay } from '#utils/delay'

/** A form of its own with an explicit button: a half-typed password should never autosave. */
export function PasswordForm() {
  const form = useAppForm({
    defaultValues: { current: '', next: '' },
    afterSubmit: 'reset',
    onSubmit: async () => {
      await delay(null, 700)
      toast({ title: 'Password changed', tone: 'positive' })
    },
  })
  const unsaved = useUnsavedChanges(form)
  return (
    <Form form={form} aria-label="Change password">
      <FormAside
        headingLevel={2}
        title="Password"
        description="Changing it signs you out of the studio tablet too."
      >
        <form.PasswordField
          name="current"
          label="Current password"
          autoComplete="current-password"
          required
        />
        <form.PasswordField
          name="next"
          label="New password"
          autoComplete="new-password"
          required
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <FormActions>
          {unsaved ? (
            <Text size="sm" tone="muted">
              Leaving now will ask first.
            </Text>
          ) : null}
          <SubmitButton>Update password</SubmitButton>
        </FormActions>
      </FormAside>
    </Form>
  )
}
