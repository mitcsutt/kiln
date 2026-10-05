import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({
    defaultValues: { nickname: 'Morning commute' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  })
  return (
    <Form form={form} aria-label="Route nickname">
      <Stack gap={5}>
        <form.TextField name="nickname" label="Nickname" />
        {/* Change the name to enable it. It stays focusable while it waits. */}
        <SubmitButton requireChanges>Save nickname</SubmitButton>
      </Stack>
    </Form>
  )
}
