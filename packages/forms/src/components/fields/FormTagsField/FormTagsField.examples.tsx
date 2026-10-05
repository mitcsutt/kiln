import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { labels: ['commute'] as readonly string[] } })
  const value = useFieldValue(form, 'labels')
  return (
    <Form form={form} aria-label="TagsField example">
      <Stack gap={4}>
        <form.TagsField name="labels" label="Labels" maxTags={5} normalise="lowercase" />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
