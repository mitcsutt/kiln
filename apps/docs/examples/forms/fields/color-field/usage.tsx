'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { lineColour: '#1f6f8b' } })
  const value = useFieldValue(form, 'lineColour')
  return (
    <Form form={form} aria-label="ColorField example">
      <Stack gap={4}>
        <form.ColorField
          name="lineColour"
          label="Line colour"
          swatches={[
            { value: '#1f6f8b', label: 'Harbour blue' },
            { value: '#2e8b57', label: 'Coastal green' },
            { value: '#c4553d', label: 'Signal red' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
