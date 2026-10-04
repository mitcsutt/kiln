'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { pass: null as 'week' | 'month' | 'year' | null } })
  const value = useFieldValue(form, 'pass')
  return (
    <Form form={form} aria-label="SelectField example">
      <Stack gap={4}>
        <form.SelectField
          name="pass"
          label="Pass"
          placeholder="Choose a pass"
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
