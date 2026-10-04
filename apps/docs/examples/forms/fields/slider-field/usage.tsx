'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { walk: 800 } })
  const value = useFieldValue(form, 'walk')
  return (
    <Form form={form} aria-label="SliderField example">
      <Stack gap={4}>
        <form.SliderField
          name="walk"
          label="Longest walk to a stop"
          min={200}
          max={2000}
          step={100}
          showValue
          formatOptions={{ style: 'unit', unit: 'meter' }}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
