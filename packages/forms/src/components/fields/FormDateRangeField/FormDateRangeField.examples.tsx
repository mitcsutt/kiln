import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { trip: { start: '', end: '' } } })
  const value = useFieldValue(form, 'trip')
  return (
    <Form form={form} aria-label="DateRangeField example">
      <Stack gap={4}>
        <form.DateRangeField
          name="trip"
          label="Travel dates"
          startLabel="First day"
          endLabel="Last day"
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
