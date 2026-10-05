import { Form, FormGrid, FormGridItem, useAppForm } from '@mitcsutt/kiln-forms'

export function Usage() {
  const form = useAppForm({
    defaultValues: { street: '', town: '', postcode: '', country: 'GB' },
  })
  return (
    <Form form={form} aria-label="Delivery address">
      <FormGrid columns={{ base: 1, md: 3 }}>
        <FormGridItem span={{ base: 1, md: 3 }}>
          <form.TextField name="street" label="Street" autoComplete="address-line1" />
        </FormGridItem>
        <FormGridItem span={{ base: 1, md: 2 }}>
          <form.TextField name="town" label="Town" autoComplete="address-level2" />
        </FormGridItem>
        <form.TextField name="postcode" label="Postcode" autoComplete="postal-code" />
        <form.SelectField
          name="country"
          label="Country"
          options={[
            { value: 'GB', label: 'United Kingdom' },
            { value: 'IE', label: 'Ireland' },
          ]}
        />
      </FormGrid>
    </Form>
  )
}
