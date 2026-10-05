import { Form, FormStep, FormSteps, useAppForm, useFormSteps } from '@mitcsutt/kiln-forms'
import { Alert, Button, Inline, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
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

function Nav() {
  const steps = useFormSteps()
  return (
    <Inline justify="between">
      <Text size="sm" tone="muted">
        {steps.index + 1} of {steps.count}
      </Text>
      <Inline gap={2}>
        {steps.isFirst ? null : (
          <Button
            variant="ghost"
            tone="neutral"
            onClick={() => {
              steps.back()
            }}
          >
            Back
          </Button>
        )}
        <Button
          type={steps.isLast ? 'submit' : 'button'}
          onClick={steps.isLast ? undefined : () => void steps.next()}
        >
          {steps.isLast ? 'Finish' : 'Next'}
        </Button>
      </Inline>
    </Inline>
  )
}

export function CustomNav() {
  const form = useAppForm({ defaultValues: { name: '', stop: '' } })
  return (
    <Form form={form} aria-label="Quick setup">
      <FormSteps label="Setup" nav="none" headingLevel={3}>
        <FormStep value="name" title="Your name">
          <form.TextField name="name" label="Name" />
          <Nav />
        </FormStep>
        <FormStep value="stop" title="Home stop">
          <form.TextField name="stop" label="Stop" />
          <Nav />
        </FormStep>
      </FormSteps>
    </Form>
  )
}
