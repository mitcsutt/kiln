'use client'

import { Form, FormStatus, useAppForm, useAutosave } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { notes: 'Window seat if possible.' } })
  useAutosave(form, () => new Promise((resolve) => setTimeout(resolve, 900)), { debounceMs: 600 })
  return (
    <Form form={form} aria-label="Trip notes">
      <Stack gap={4}>
        <Inline justify="between">
          <Text weight="strong">Trip notes</Text>
          <FormStatus />
        </Inline>
        <form.TextareaField name="notes" label="Notes" labelHidden autoResize />
      </Stack>
    </Form>
  )
}
