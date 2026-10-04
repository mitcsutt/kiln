'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { departs: '07:10' } })
  const value = useFieldValue(form, 'departs')
  return (
    <Form form={form} aria-label="TimeField example">
      <Stack gap={4}>
        <form.TimeField name="departs" label="Departs" step={300} />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
