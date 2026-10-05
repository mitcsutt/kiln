import { ErrorSummary, Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Alert, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter an email address like ines@example.com'),
  ticket: z.enum(['single', 'return', 'day']),
})

export function Usage() {
  const [booked, setBooked] = useState<string | null>(null)
  const form = useAppForm({
    defaultValues: { name: '', email: '', ticket: 'return' },
    schema,
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setBooked(value.email)
    },
  })
  return (
    <Form form={form} aria-label="Book a ferry ticket">
      <Stack gap={5}>
        <ErrorSummary />
        <form.TextField name="name" label="Full name" autoComplete="name" required />
        <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
        <form.SegmentedField
          name="ticket"
          label="Ticket"
          options={[
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
            { value: 'day', label: 'Day pass' },
          ]}
        />
        <SubmitButton>Book ticket</SubmitButton>
        {booked ? (
          <Alert tone="positive" title="Booked">
            Your ticket is on its way to {booked}.
          </Alert>
        ) : null}
      </Stack>
    </Form>
  )
}
