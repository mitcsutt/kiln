'use client'

import { ErrorSummary, Form, FormSubmitError, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const TAKEN = ['ines', 'harbourmaster', 'admin']

export default function Validation() {
  const form = useAppForm({
    defaultValues: { username: '', seats: null as number | null, promo: '' },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // The server has the last word: its errors land on the fields they belong to.
      if (value.promo !== '' && value.promo !== 'BAYLINE') {
        throw new FormSubmitError({ fields: { promo: "That code isn't valid for this sailing" } })
      }
    },
  })
  return (
    <Form form={form} aria-label="Create an account">
      <Stack gap={5}>
        <ErrorSummary />
        <form.TextField
          name="username"
          label="Username"
          description="Letters and numbers only"
          required
          warn={(value) => (/[A-Z]/.test(value) ? 'Usernames are case-sensitive' : undefined)}
          validators={{
            onDynamic: ({ value }) =>
              /^[a-z0-9]+$/i.test(value) ? undefined : 'Use letters and numbers only',
            onDynamicAsync: async ({ value }) => {
              await new Promise((resolve) => setTimeout(resolve, 400))
              return TAKEN.includes(value.toLowerCase()) ? 'That username is taken' : undefined
            },
          }}
        />
        <form.NumberField
          name="seats"
          label="Seats"
          min={1}
          max={9}
          validators={{
            onDynamic: ({ value }) => (value === null ? 'How many seats?' : undefined),
          }}
        />
        <form.TextField name="promo" label="Promo code" optional description="Try BAYLINE" />
        <SubmitButton>Create account</SubmitButton>
      </Stack>
    </Form>
  )
}
