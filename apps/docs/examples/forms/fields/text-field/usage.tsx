'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { destination: '' } })
  const value = useFieldValue(form, 'destination')
  return (
    <Form form={form} aria-label="TextField example">
      <Stack gap={4}>
        <form.TextField
          name="destination"
          label="Destination"
          placeholder="Kelso Bay"
          autoComplete="off"
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
