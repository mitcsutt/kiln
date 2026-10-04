'use client'

import { Form, Repeater, useAppForm } from '@mitcsutt/kiln-forms'

interface Leg {
  from: string
  to: string
  fare: number | null
}

export default function Table() {
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
