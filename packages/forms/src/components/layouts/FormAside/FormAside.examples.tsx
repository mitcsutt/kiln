import { Form, FormAside, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { name: 'Ines Varga', bio: '', alerts: true } })
  return (
    <Form form={form} aria-label="Profile">
      <Stack gap={8} dividers>
        <FormAside title="Profile" description="Shown to people you share routes with.">
          <form.TextField name="name" label="Display name" />
          <form.TextareaField name="bio" label="About you" optional />
        </FormAside>
        <FormAside title="Alerts" description="Email only. Nothing is sent to your phone.">
          <form.SwitchField name="alerts" label="Delays on saved routes" />
        </FormAside>
      </Stack>
    </Form>
  )
}
