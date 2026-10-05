import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { topUp: 20 } })
  const value = useFieldValue(form, 'topUp')
  return (
    <Form form={form} aria-label="AmountField example">
      <Stack gap={4}>
        <form.AmountField name="topUp" label="Top-up" currency="GBP" locale="en-GB" min={5} />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
