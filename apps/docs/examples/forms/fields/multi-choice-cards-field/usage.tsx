'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { extras: [] as string[] } })
  const value = useFieldValue(form, 'extras')
  return (
    <Form form={form} aria-label="MultiChoiceCardsField example">
      <Stack gap={4}>
        <form.MultiChoiceCardsField
          name="extras"
          label="Add-ons"
          columns={{ base: 1, sm: 2 }}
          options={[
            { value: 'bike', label: 'Bike space', description: 'Reserved on every crossing' },
            { value: 'lounge', label: 'Lounge', description: 'Quiet seats and a hot drink' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
