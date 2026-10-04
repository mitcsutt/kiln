'use client'

import { Field, Input, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
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
