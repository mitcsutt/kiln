'use client'

import { Form, useAppForm } from '@mitcsutt/kiln-forms'
import { Grid } from '@mitcsutt/kiln-ui'

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

export default function States() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap={6}>
      <Example state="disabled" />
      <Example state="readOnly" />
    </Grid>
  )
}
