import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({ defaultValues: { plan: null as string | null } })
  const value = useFieldValue(form, 'plan')
  return (
    <Form form={form} aria-label="ChoiceCardsField example">
      <Stack gap={4}>
        <form.ChoiceCardsField
          name="plan"
          label="Pass"
          columns={{ base: 1, sm: 2 }}
          options={[
            { value: 'month', label: 'Month', description: 'Renews automatically' },
            { value: 'year', label: 'Year', description: 'Two months free' },
          ]}
          optionMeta={(value) => (value === 'month' ? '£82' : '£790')}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
