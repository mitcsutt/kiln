'use client'

import {
  accepts,
  defineField,
  FieldView,
  Form,
  kit,
  SubmitButton,
  useFieldBinding,
  type CommonFieldProps,
} from '@mitcsutt/kiln-forms'
import { Stack, TextField, type TextFieldProps } from '@mitcsutt/kiln-ui'

type PhoneFieldProps = Omit<TextFieldProps, 'value' | 'defaultValue' | 'onValueChange' | 'type'> &
  CommonFieldProps<string>

/** A UK mobile number, stored as digits only: a field this app needs and Kiln doesn't ship. */
const PhoneField = defineField<string>()(function PhoneField({
  warn,
  excluded,
  ...props
}: PhoneFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>{binding.value ? `+44 ${binding.value}` : null}</FieldView>
    )
  }
  return (
    <TextField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      type="tel"
      autoComplete="tel-national"
      leading="+44"
      value={binding.value}
      onValueChange={(next) => {
        binding.setValue(next.replace(/\D/g, ''))
      }}
      onBlur={binding.onBlur}
    />
  )
})

// Register it once, in a module of your own: `phone` becomes form.PhoneField, field.PhoneField
// and { kind: 'phone' } in schemas. Import useAppForm from that module from then on.
const { useAppForm } = kit.extend({ fields: { phone: PhoneField } })

export default function CustomField() {
  const form = useAppForm({ defaultValues: { mobile: '' } })
  return (
    <Form form={form} aria-label="Text me updates">
      <Stack gap={5}>
        <form.PhoneField
          name="mobile"
          label="Mobile number"
          description="We'll text you if your sailing is delayed"
          validators={{
            onDynamic: ({ value }) =>
              value.length === 10 ? undefined : 'Enter the 10 digits after +44',
          }}
        />
        <SubmitButton>Save number</SubmitButton>
      </Stack>
    </Form>
  )
}
