'use client'

import { Field, useFieldControl } from '@mitcsutt/kiln-ui'

function SeatPicker() {
  // The surrounding Field's id, description ids and state, for your own control.
  const field = useFieldControl()
  return (
    <select
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid ? true : undefined}
      disabled={field?.disabled}
    >
      <option>Window</option>
      <option>Aisle</option>
    </select>
  )
}

export default function CustomControl() {
  return (
    <Field label="Seat" description="Your own control, wired by the Field">
      <SeatPicker />
    </Field>
  )
}
