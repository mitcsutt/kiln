'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { source: 'timetable-page' } })
  const value = useFieldValue(form, 'source')
  return (
    <Form form={form} aria-label="HiddenField example">
      <Stack gap={4}>
        <form.HiddenField name="source" />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
