'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { travelDate: '' } })
  const value = useFieldValue(form, 'travelDate')
  return (
    <Form form={form} aria-label="DateField example">
      <Stack gap={4}>
        <form.DateField name="travelDate" label="Travel date" min="2026-10-01" />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
