import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { journey: 'return' } })
  const value = useFieldValue(form, 'journey')
  return (
    <Form form={form} aria-label="SegmentedField example">
      <Stack gap={4}>
        <form.SegmentedField
          name="journey"
          label="Journey"
          options={[
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
