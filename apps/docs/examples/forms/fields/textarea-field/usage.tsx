'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { notes: '' } })
  const value = useFieldValue(form, 'notes')
  return (
    <Form form={form} aria-label="TextareaField example">
      <Stack gap={4}>
        <form.TextareaField
          name="notes"
          label="Notes for the crew"
          description="A wheelchair space, a large bag, anything we should know"
          autoResize
          maxLength={300}
          showCount
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
