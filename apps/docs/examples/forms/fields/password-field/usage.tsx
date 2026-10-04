'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { password: '' } })
  const value = useFieldValue(form, 'password')
  return (
    <Form form={form} aria-label="PasswordField example">
      <Stack gap={4}>
        <form.PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          description="At least 12 characters"
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
