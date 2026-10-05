import { Form, SubmitButton, useAppForm, When } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [submitted, setSubmitted] = useState('')
  const form = useAppForm({
    defaultValues: { delivery: 'collect', address: '' },
    onSubmit: ({ value }) => {
      setSubmitted(JSON.stringify(value))
    },
  })
  return (
    <Form form={form} aria-label="Pass delivery">
      <Stack gap={5}>
        <form.RadioField
          name="delivery"
          label="How do you want your pass?"
          options={[
            { value: 'collect', label: 'Collect it at Harbour Square' },
            { value: 'post', label: 'Post it to me' },
          ]}
        />
        <When form={form} is={(values) => values.delivery === 'post'}>
          <form.TextareaField name="address" label="Postal address" autoComplete="street-address" />
        </When>
        <SubmitButton>Order pass</SubmitButton>
        {submitted ? (
          <Text size="sm" tone="muted">
            Submitted: <Code>{submitted}</Code>
          </Text>
        ) : null}
      </Stack>
    </Form>
  )
}
