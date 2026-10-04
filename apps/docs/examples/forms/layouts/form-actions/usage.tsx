'use client'

import { Form, FormActions, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({ defaultValues: { name: 'Coastal line' } })
  return (
    <Form form={form} aria-label="Line name">
      <Stack gap={5}>
        <form.TextField name="name" label="Line name" />
        <FormActions align="between" status>
          <ResetButton>Discard changes</ResetButton>
          <SubmitButton requireChanges>Save line</SubmitButton>
        </FormActions>
      </Stack>
    </Form>
  )
}
