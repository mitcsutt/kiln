import type { Meta, StoryObj } from '@storybook/react-vite'
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

const meta = {
  title: 'Forms/Getting started/Component mode',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * `form` _is_ TanStack Form's form API, so everything from TanStack works: `form.AppField` with a
 * render prop, `form.Subscribe`, `form.store`, `form.setFieldValue`. The bound shorthand is a
 * convenience over `AppField`, not a replacement.
 *
 * Inside `AppField`, `field.TextField` isn't checked against the value type (TanStack can't do it
 * there); a development-only guard catches a mismatch at runtime instead.
 */
export const Canonical: Story = {
  name: 'The TanStack way still works',
  tags: ['docs'],
  render: function Canonical() {
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
  },
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

/**
 * `withForm` makes a component out of part of a form, typed against the same values. Share the
 * options between the form and its pieces with `formOptions`.
 *
 * For a component several levels below the form, read the form from context instead of passing it
 * down: see [Form context](/docs/forms/getting-started/form-context).
 */
export const WithForm: Story = {
  name: 'Splitting a big form',
  tags: ['docs'],
  render: function WithForm() {
    const form = useAppForm(passengerOptions)
    return (
      <Form form={form} aria-label="Passenger">
        <Stack gap={5}>
          <ContactDetails form={form} title="Lead passenger" />
          <SubmitButton>Continue</SubmitButton>
        </Stack>
      </Form>
    )
  },
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

/**
 * `withFieldGroup` makes a group of fields that binds wherever a form has the right shape, and
 * `useFields(group)` gives typed shorthand inside it. Bind the group with `fields="password"`:
 * TypeScript checks that `password` has the group's shape.
 */
export const FieldGroup: Story = {
  name: 'Reusable groups of fields',
  tags: ['docs'],
  render: function FieldGroup() {
    const form = useAppForm({ defaultValues: { password: { next: '', confirm: '' } } })
    return (
      <Form form={form} aria-label="Change password">
        <Stack gap={5}>
          <NewPassword form={form} fields="password" />
          <SubmitButton>Change password</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
