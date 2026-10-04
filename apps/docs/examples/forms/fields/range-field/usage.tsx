'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { window: [7, 10] as [number, number] } })
  const value = useFieldValue(form, 'window')
  return (
    <Form form={form} aria-label="RangeField example">
      <Stack gap={4}>
        <form.RangeField
          name="window"
          label="Departure window"
          min={5}
          max={23}
          thumbLabels={['Earliest', 'Latest']}
          showValue
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
