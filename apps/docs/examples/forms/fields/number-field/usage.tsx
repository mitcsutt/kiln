'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { passengers: 2 } })
  const value = useFieldValue(form, 'passengers')
  return (
    <Form form={form} aria-label="NumberField example">
      <Stack gap={4}>
        <form.NumberField name="passengers" label="Passengers" min={1} max={9} stepper />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
