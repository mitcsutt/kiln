'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { days: ['mon', 'wed'] as string[] } })
  const value = useFieldValue(form, 'days')
  return (
    <Form form={form} aria-label="ChipsField example">
      <Stack gap={4}>
        <form.ChipsField
          name="days"
          label="Days you travel"
          options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => ({
            value: day.toLowerCase(),
            label: day,
          }))}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
