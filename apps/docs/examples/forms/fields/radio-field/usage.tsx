'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { deck: null as string | null } })
  const value = useFieldValue(form, 'deck')
  return (
    <Form form={form} aria-label="RadioField example">
      <Stack gap={4}>
        <form.RadioField
          name="deck"
          label="Deck"
          options={[
            { value: 'upper', label: 'Upper deck', description: 'Best views' },
            { value: 'lower', label: 'Lower deck', description: 'Closest to the café' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
