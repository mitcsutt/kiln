import {
  Form,
  formOptions,
  FormSection,
  SubmitButton,
  useAppForm,
  useFields,
  withFieldGroup,
  withForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Canonical() {
  const form = useAppForm({ defaultValues: { reference: '' } })
  return (
    <Form form={form} aria-label="Find a booking">
      <Stack gap={5}>
        <form.AppField
          name="reference"
          validators={{
            onBlur: ({ value }) =>
              /^BAY-\w{3}$/.test(value) ? undefined : 'References look like BAY-40Q',
          }}
        >
          {(field) => <field.TextField label="Booking reference" required />}
        </form.AppField>
        <SubmitButton>Find booking</SubmitButton>
      </Stack>
    </Form>
  )
}

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

export function WithForm() {
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

// One reusable pair of fields, bound wherever a form has `{ next, confirm }`.
const NewPassword = withFieldGroup({
  defaultValues: { next: '', confirm: '' },
  render: function NewPassword({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.PasswordField
          name="next"
          label="New password"
          autoComplete="new-password"
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <fields.PasswordField
          name="confirm"
          label="Type it again"
          autoComplete="new-password"
          validators={{
            onChangeListenTo: ['next'],
            onDynamic: ({ value }) =>
              value === group.getFieldValue('next') ? undefined : "The two passwords don't match",
          }}
        />
      </>
    )
  },
})

export function FieldGroup() {
  const form = useAppForm({ defaultValues: { password: { next: '', confirm: '' } } })
  return (
    <Form form={form} aria-label="Change password">
      <Stack gap={5}>
        <NewPassword form={form} fields="password" />
        <SubmitButton>Change password</SubmitButton>
      </Stack>
    </Form>
  )
}
