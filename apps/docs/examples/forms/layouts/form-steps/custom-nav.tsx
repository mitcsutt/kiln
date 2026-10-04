'use client'

import { Form, FormStep, FormSteps, useAppForm, useFormSteps } from '@mitcsutt/kiln-forms'
import { Button, Inline, Text } from '@mitcsutt/kiln-ui'

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

export default function CustomNav() {
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
