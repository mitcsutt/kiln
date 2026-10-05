import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

const STOPS = [
  { value: 'harbour', label: 'Harbour Square' },
  { value: 'kelso', label: 'Kelso Bay Pier' },
  { value: 'marram', label: 'Marram Point' },
  { value: 'northpoint', label: 'Northpoint Library' },
  { value: 'quay', label: 'Old Quay' },
]

export function Usage() {
  const form = useAppForm({ defaultValues: { stops: ['harbour'] as string[] } })
  const value = useFieldValue(form, 'stops')
  return (
    <Form form={form} aria-label="MultiSelectField example">
      <Stack gap={4}>
        <form.MultiSelectField
          name="stops"
          label="Favourite stops"
          maxSelected={3}
          options={STOPS}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
