'use client'

import { Form, FormStep, FormSteps, useAppForm } from '@mitcsutt/kiln-forms'
import { Alert } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Usage() {
  const [done, setDone] = useState(false)
  const form = useAppForm({
    defaultValues: { from: '', to: '', date: '', passengers: 1 },
    onSubmit: () => {
      setDone(true)
    },
  })
  if (done)
    return (
      <Alert tone="positive" title="Sailing booked">
        Your tickets are on their way.
      </Alert>
    )
  return (
    <Form form={form} aria-label="Book a sailing">
      <FormSteps label="Booking" headingLevel={3} submitLabel="Book sailing">
        <FormStep value="route" title="Route">
          <form.TextField
            name="from"
            label="From"
            validators={{
              onDynamic: ({ value }) => (value ? undefined : 'Where are you leaving from?'),
            }}
          />
          <form.TextField
            name="to"
            label="To"
            validators={{ onDynamic: ({ value }) => (value ? undefined : 'Where are you going?') }}
          />
        </FormStep>
        <FormStep value="when" title="When">
          <form.DateField
            name="date"
            label="Date"
            validators={{ onDynamic: ({ value }) => (value ? undefined : 'Choose a date') }}
          />
        </FormStep>
        <FormStep value="who" title="Passengers">
          <form.NumberField name="passengers" label="Passengers" min={1} max={9} stepper />
        </FormStep>
      </FormSteps>
    </Form>
  )
}
