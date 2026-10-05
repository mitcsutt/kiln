import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [sent, setSent] = useState('')
  const form = useAppForm({
    defaultValues: { route: 'Morning commute' },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSent(value.route)
    },
  })
  return (
    <Form form={form} aria-label="Rename route">
      <Stack gap={5}>
        <form.TextField name="route" label="Route name" />
        <Inline gap={3}>
          <SubmitButton>Save name</SubmitButton>
          <ResetButton>Undo changes</ResetButton>
        </Inline>
        {sent ? <Text tone="muted">Saved as {sent}.</Text> : null}
      </Stack>
    </Form>
  )
}

function Example({ state }: { state: 'disabled' | 'readOnly' }) {
  const form = useAppForm({ defaultValues: { name: 'Ines Varga', stop: 'Harbour Square' } })
  return (
    <Form
      form={form}
      aria-label={state}
      disabled={state === 'disabled'}
      readOnly={state === 'readOnly'}
    >
      <form.TextField
        name="name"
        label={state === 'disabled' ? 'Name (disabled)' : 'Name (read-only)'}
      />
      <form.TextField name="stop" label="Home stop" />
    </Form>
  )
}

export function States() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap={6}>
      <Example state="disabled" />
      <Example state="readOnly" />
    </Grid>
  )
}
