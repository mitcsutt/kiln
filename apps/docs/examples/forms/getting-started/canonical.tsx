'use client'

import { Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Canonical() {
  const form = useAppForm({ defaultValues: { reference: '' } })
  return (
    <Form form={form} aria-label="Find a booking">
      <Stack gap={5}>
        <form.AppField
          name="reference"
          validators={{
            onBlur: ({ value }) =>
              /^BAY-\w{3}$/.test(value) ? undefined : 'References look like BAY-40Q',
          }}
        >
          {(field) => <field.TextField label="Booking reference" required />}
        </form.AppField>
        <SubmitButton>Find booking</SubmitButton>
      </Stack>
    </Form>
  )
}
