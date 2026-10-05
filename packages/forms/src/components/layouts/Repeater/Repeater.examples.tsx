import { Form, Repeater, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'

interface Passenger {
  name: string
  age: number | null
  bike: boolean
}

export function Usage() {
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

interface Leg {
  from: string
  to: string
  fare: number | null
}

export function Table() {
  const form = useAppForm({
    defaultValues: {
      legs: [
        { from: 'Harbour Square', to: 'Kelso Bay', fare: 4.2 },
        { from: 'Kelso Bay', to: 'Marram Point', fare: 2.8 },
      ] as Leg[],
    },
  })
  return (
    <Form form={form} aria-label="Journey legs">
      <Repeater
        form={form}
        name="legs"
        label="Legs"
        variant="table"
        reorderable
        newItem={{ from: '', to: '', fare: null }}
        columns={[{ header: 'From' }, { header: 'To' }, { header: 'Fare', width: 'min' }]}
        addLabel="Add a leg"
      >
        {(item) => (
          <>
            <item.fields.TextField name="from" label="From" />
            <item.fields.TextField name="to" label="To" />
            <item.fields.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
          </>
        )}
      </Repeater>
    </Form>
  )
}
