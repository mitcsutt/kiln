'use client'

import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Usage() {
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
