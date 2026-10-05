import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { terms: false } })
  const value = useFieldValue(form, 'terms')
  return (
    <Form form={form} aria-label="CheckboxField example">
      <Stack gap={4}>
        <form.CheckboxField
          name="terms"
          label="I've read the terms of carriage"
          description="Including the rules for bikes and dogs"
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
