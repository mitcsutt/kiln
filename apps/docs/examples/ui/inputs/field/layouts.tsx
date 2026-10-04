'use client'

import { Stack, Text, TextField } from '@mitcsutt/kiln-ui'

export default function Layouts() {
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
