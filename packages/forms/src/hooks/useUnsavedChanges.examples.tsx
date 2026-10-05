import { Form, SubmitButton, useAppForm, useUnsavedChanges } from '@mitcsutt/kiln-forms'
import { Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({
    defaultValues: { note: '' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 400)),
  })
  // Warns before the tab closes or reloads while there are unsaved changes.
  const dirty = useUnsavedChanges(form)
  return (
    <Form form={form} aria-label="Feedback">
      <Stack gap={5}>
        <form.TextareaField name="note" label="Feedback for the crew" />
        <Text size="sm" tone="muted">
          {dirty ? 'Unsaved: closing this tab will ask first.' : 'Nothing unsaved.'}
        </Text>
        <SubmitButton>Send</SubmitButton>
      </Stack>
    </Form>
  )
}
