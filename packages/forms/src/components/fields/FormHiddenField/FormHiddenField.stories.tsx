import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, StoryForm } from '#stories/_kit'
import { FormHiddenField } from './FormHiddenField'

const meta = {
  title: 'Forms/Fields/HiddenField',
  component: FormHiddenField,
} satisfies Meta<typeof FormHiddenField>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Nothing renders — the only markup is `<input type="hidden">`, carrying a value into native
 * `FormData` without a control. Check the submitted output below to see it went through.
 */
export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: 'pricing-page' }} label="Sales enquiry">
      {(form) => (
        <>
          <Text size="sm" tone="muted">
            Nothing renders here — open "Submitted" below after submitting.
          </Text>
          <form.HiddenField name="value" />
        </>
      )}
    </FieldDemo>
  ),
}

export const States: Story = {
  render: () => (
    <Text size="sm" tone="muted">
      A hidden field has no visible state: no label, no error, no disabled look. It only carries a
      value — see "In a form" and "View mode" below.
    </Text>
  ),
}

export const InAForm: Story = {
  name: 'In a form',
  render: () => (
    <StoryForm
      defaultValues={{ name: '', email: '', message: '', source: 'pricing-page', website: '' }}
      label="Sales enquiry"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Name" autoComplete="name" required />
          <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
          <form.TextareaField name="message" label="Message" rows={4} required />
          {/* A honeypot: real visitors never see or fill this in; bots usually do. */}
          <form.HiddenField name="website" />
          <form.HiddenField name="source" />
        </>
      )}
    </StoryForm>
  ),
}

/** View mode renders nothing — a hidden field is never shown in a read-only review either. */
export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'pricing-page' }} mode="view" label="Sales enquiry">
      {(form) => (
        <>
          <Text size="sm" tone="muted">
            Nothing renders in view mode either — a hidden field has no display value.
          </Text>
          <form.HiddenField name="value" />
        </>
      )}
    </FieldDemo>
  ),
}

/**
 * It's the only markup kiln-forms renders itself, and it renders nothing in view mode. You rarely
 * need it: values that aren't typed by the reader can simply be form values. Use it when a native
 * form submission must include the value.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { source: 'timetable-page' } })
    const value = useFieldValue(form, 'source')
    return (
      <Form form={form} aria-label="HiddenField example">
        <Stack gap={4}>
          <form.HiddenField name="source" />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
