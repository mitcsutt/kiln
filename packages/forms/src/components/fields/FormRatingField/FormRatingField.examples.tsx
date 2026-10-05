import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { rating: null as number | null } })
  const value = useFieldValue(form, 'rating')
  return (
    <Form form={form} aria-label="RatingField example">
      <Stack gap={4}>
        <form.RatingField name="rating" label="How was your crossing?" clearable />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
