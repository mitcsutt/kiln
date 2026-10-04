'use client'

import {
  ErrorSummary,
  Form,
  FormTab,
  FormTabs,
  SubmitButton,
  useAppForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

export default function Usage() {
  const form = useAppForm({ defaultValues: { name: '', email: '', stop: '', notes: '' } })
  return (
    <Form form={form} aria-label="New member">
      <Stack gap={5}>
        <ErrorSummary />
        <FormTabs label="Member details">
          <FormTab value="person" label="Person">
            <form.TextField name="name" label="Full name" validators={required('Enter a name')} />
            <form.TextField name="email" label="Email" validators={required('Enter an email')} />
          </FormTab>
          <FormTab value="travel" label="Travel">
            <form.TextField
              name="stop"
              label="Home stop"
              validators={required('Enter a home stop')}
            />
            <form.TextareaField name="notes" label="Notes" optional />
          </FormTab>
        </FormTabs>
        <SubmitButton>Add member</SubmitButton>
      </Stack>
    </Form>
  )
}
