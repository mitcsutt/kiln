'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { code: '' } })
  const value = useFieldValue(form, 'code')
  return (
    <Form form={form} aria-label="OneTimeCodeField example">
      <Stack gap={4}>
        <form.OneTimeCodeField
          name="code"
          label="Verification code"
          description="Six digits, sent to the number ending 4417"
          length={6}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
