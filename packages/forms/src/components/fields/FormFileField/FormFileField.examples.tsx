import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text, type FileValue } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { photo: [] as readonly FileValue[] } })
  const value = useFieldValue(form, 'photo')
  return (
    <Form form={form} aria-label="FileField example">
      <Stack gap={4}>
        <form.FileField
          name="photo"
          label="Photo for your pass"
          accept="image/jpeg,image/png"
          maxSize={5_000_000}
          preview="thumbnails"
        />
        <Text size="sm" tone="muted">
          Value:{' '}
          <Code>{value.length ? value.map((file) => file.name).join(', ') : 'No files'}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
