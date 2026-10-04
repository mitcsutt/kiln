'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { alerts: true } })
  const value = useFieldValue(form, 'alerts')
  return (
    <Form form={form} aria-label="SwitchField example">
      <Stack gap={4}>
        <form.SwitchField
          name="alerts"
          label="Delay alerts"
          description="A notification when a saved route runs late"
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
