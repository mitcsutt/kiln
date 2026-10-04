'use client'

import { ErrorSummary, Form, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export default function Usage() {
  const form = useAppForm({ defaultValues: { name: '', email: '', reference: '' } })
  return (
    <Form form={form} aria-label="Claim a refund">
      <Stack gap={5}>
        <ErrorSummary title="Check these before you claim" />
        <form.TextField name="name" label="Full name" validators={required('Enter your name')} />
        <form.TextField
          name="email"
          label="Email"
          type="email"
          validators={required('Enter your email')}
        />
        <form.TextField
          name="reference"
          label="Booking reference"
          validators={required('Enter the booking reference')}
        />
        <SubmitButton>Claim refund</SubmitButton>
      </Stack>
    </Form>
  )
}
