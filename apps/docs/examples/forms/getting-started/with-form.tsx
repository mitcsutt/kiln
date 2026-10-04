'use client'

import {
  Form,
  FormSection,
  SubmitButton,
  formOptions,
  useAppForm,
  withForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const passengerOptions = formOptions({
  defaultValues: { name: '', email: '', phone: '' },
})

// A piece of a bigger form, typed against the same values.
const ContactDetails = withForm({
  ...passengerOptions,
  props: { title: 'Contact details' },
  render: function ContactDetails({ form, title }) {
    return (
      <FormSection title={title}>
        <form.TextField name="name" label="Full name" autoComplete="name" />
        <form.TextField name="email" label="Email" type="email" autoComplete="email" />
        <form.TextField name="phone" label="Mobile" type="tel" autoComplete="tel" optional />
      </FormSection>
    )
  },
})

export default function WithForm() {
  const form = useAppForm(passengerOptions)
  return (
    <Form form={form} aria-label="Passenger">
      <Stack gap={5}>
        <ContactDetails form={form} title="Lead passenger" />
        <SubmitButton>Continue</SubmitButton>
      </Stack>
    </Form>
  )
}
