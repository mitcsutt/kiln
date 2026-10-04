'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { pickup: '' } })
  const value = useFieldValue(form, 'pickup')
  return (
    <Form form={form} aria-label="DateTimeField example">
      <Stack gap={4}>
        <form.DateTimeField name="pickup" label="Pick-up time" />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
