'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

const POSTCODES: Record<string, string> = { GB: 'KB4 2PQ', IE: 'D02 X285' }

export default function Usage() {
  const form = useAppForm({ defaultValues: { country: 'GB', postcode: '' } })
  const country = useFieldValue(form, 'country')
  return (
    <Form form={form} aria-label="Address">
      <Stack gap={5}>
        <form.SelectField
          name="country"
          label="Country"
          options={[
            { value: 'GB', label: 'United Kingdom' },
            { value: 'IE', label: 'Ireland' },
          ]}
          listeners={{
            onChange: () => {
              form.resetField('postcode')
            },
          }}
        />
        <form.TextField
          name="postcode"
          label={country === 'IE' ? 'Eircode' : 'Postcode'}
          placeholder={POSTCODES[country === 'IE' ? 'IE' : 'GB']}
        />
      </Stack>
    </Form>
  )
}
