'use client'

import {
  Form,
  FormAccordion,
  FormAccordionItem,
  SubmitButton,
  useAppForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { wheelchair: false, assistance: '', bike: false, dog: false },
  })
  return (
    <Form form={form} aria-label="Travel needs">
      <Stack gap={5}>
        <FormAccordion defaultValue={['access']}>
          <FormAccordionItem
            value="access"
            title="Access"
            description="Ramps, spaces and help boarding"
          >
            <form.CheckboxField name="wheelchair" label="I need a wheelchair space" />
            <form.TextareaField name="assistance" label="Help boarding" optional />
          </FormAccordionItem>
          <FormAccordionItem value="travelling-with" title="Travelling with">
            <form.SwitchField name="bike" label="A bike" />
            <form.SwitchField name="dog" label="A dog" />
          </FormAccordionItem>
        </FormAccordion>
        <SubmitButton>Save needs</SubmitButton>
      </Stack>
    </Form>
  )
}
