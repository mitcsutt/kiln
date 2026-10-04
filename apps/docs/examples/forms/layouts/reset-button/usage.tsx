'use client'

import { Form, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Inline, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { from: 'Harbour Square', to: 'Kelso Bay Pier' } })
  return (
    <Form form={form} aria-label="Plan a trip">
      <Stack gap={5}>
        <form.TextField name="from" label="From" />
        <form.TextField name="to" label="To" />
        <Inline gap={3}>
          <SubmitButton>Find sailings</SubmitButton>
          <ResetButton>Start again</ResetButton>
        </Inline>
      </Stack>
    </Form>
  )
}
