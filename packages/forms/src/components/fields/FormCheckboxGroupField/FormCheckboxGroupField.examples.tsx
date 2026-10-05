import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { facilities: ['step-free'] as string[] } })
  const value = useFieldValue(form, 'facilities')
  return (
    <Form form={form} aria-label="CheckboxGroupField example">
      <Stack gap={4}>
        <form.CheckboxGroupField
          name="facilities"
          label="Facilities you need"
          selectAllLabel="All of them"
          options={[
            { value: 'step-free', label: 'Step-free access' },
            { value: 'toilets', label: 'Accessible toilets' },
            { value: 'hearing', label: 'Hearing loop' },
          ]}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
