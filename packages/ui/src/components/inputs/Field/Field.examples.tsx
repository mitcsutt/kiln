import { Field, Input, Stack, Text, TextField, useFieldControl } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={5}>
      <Field label="Fare" description="Before any railcard discount">
        <Input numeric leading="£" placeholder="0.00" />
      </Field>
      <Field label="Booking reference" error="That reference doesn't match a booking" required>
        <Input defaultValue="BAY-40Q" />
      </Field>
      <Field label="Username" warning="Usernames are case-sensitive">
        <Input defaultValue="InesV" />
      </Field>
    </Stack>
  )
}

export function Layouts() {
  return (
    <Stack gap={6}>
      <TextField label="Stack (default)" description="Label above the control" />
      <TextField
        layout="horizontal"
        label="Horizontal"
        description="Label and control in columns"
      />
      <Text>
        Leave at{' '}
        <TextField layout="inline" label="Departure time" defaultValue="07:10" htmlSize={6} /> from
        Harbour Square.
      </Text>
    </Stack>
  )
}

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

export function CustomControl() {
  return (
    <Field label="Seat" description="Your own control, wired by the Field">
      <SeatPicker />
    </Field>
  )
}
