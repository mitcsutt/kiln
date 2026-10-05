import { Form, FormSection, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  const form = useAppForm({
    defaultValues: { name: 'Ines Varga', email: 'ines@example.com', card: '4417', expiry: '09/28' },
  })
  return (
    <Form form={form} aria-label="Account">
      <Stack gap={7}>
        <FormSection title="Contact details" description="Where we send tickets and receipts.">
          <form.TextField name="name" label="Full name" />
          <form.TextField name="email" label="Email" type="email" />
        </FormSection>
        <FormSection
          title="Saved card"
          description="Managed by your bank. Contact them to change it."
          readOnly
        >
          <form.TextField name="card" label="Card ending" />
          <form.TextField name="expiry" label="Expires" />
        </FormSection>
      </Stack>
    </Form>
  )
}
