'use client'

import { Form, Repeater, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

interface Passenger {
  name: string
  age: number | null
  bike: boolean
}

export default function Usage() {
  const form = useAppForm({
    defaultValues: { passengers: [{ name: 'Ines Varga', age: 34, bike: true }] as Passenger[] },
  })
  return (
    <Form form={form} aria-label="Passengers">
      <Stack gap={5}>
        <Repeater
          form={form}
          name="passengers"
          label="Passengers"
          newItem={{ name: '', age: null, bike: false }}
          min={1}
          max={6}
          itemLabel={(index) => `Passenger ${String(index + 1)}`}
          addLabel="Add a passenger"
        >
          {(item) => (
            <>
              <item.fields.TextField name="name" label="Name" />
              <item.fields.NumberField name="age" label="Age" min={0} />
              <item.fields.CheckboxField name="bike" label="Bringing a bike" />
            </>
          )}
        </Repeater>
        <SubmitButton>Continue</SubmitButton>
      </Stack>
    </Form>
  )
}
