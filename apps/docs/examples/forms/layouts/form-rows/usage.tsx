'use client'

import { Form, FormRows, useAppForm } from '@mitcsutt/kiln-forms'

export default function Usage() {
  const form = useAppForm({
    defaultValues: {
      name: 'Coastal line',
      colour: '#1f6f8b',
      frequency: 20,
      night: false,
    },
  })
  return (
    <Form form={form} aria-label="Line settings">
      <FormRows>
        <form.TextField name="name" label="Line name" />
        <form.ColorField name="colour" label="Colour" description="Used on the map" />
        <form.NumberField
          name="frequency"
          label="Every"
          description="Minutes between sailings"
          min={5}
        />
        <form.SwitchField name="night" label="Runs at night" />
      </FormRows>
    </Form>
  )
}
