'use client'

import { Form, FormReview, useAppForm } from '@mitcsutt/kiln-forms'

export default function Usage() {
  const form = useAppForm({
    defaultValues: {
      from: 'Harbour Square',
      to: 'Kelso Bay Pier',
      date: '2026-10-14',
      ticket: 'return',
      fare: 8.4,
    },
  })
  return (
    <Form form={form} aria-label="Your booking">
      <FormReview title="Your booking">
        <form.TextField name="from" label="From" />
        <form.TextField name="to" label="To" />
        <form.DateField name="date" label="Date" />
        <form.SegmentedField
          name="ticket"
          label="Ticket"
          options={[
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
          ]}
        />
        <form.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
      </FormReview>
    </Form>
  )
}
