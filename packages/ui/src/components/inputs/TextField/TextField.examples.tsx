import { Stack, TextField } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [name, setName] = useState('')
  return (
    <Stack gap={5}>
      <TextField
        label="Route name"
        description="Shown on your home screen"
        placeholder="Morning commute"
        value={name}
        onValueChange={setName}
        maxLength={32}
        showCount
      />
      <TextField label="Email" type="email" autoComplete="email" required />
      <TextField
        label="Discount code"
        optional
        error="That code expired on 30 September"
        defaultValue="SUMMER26"
      />
    </Stack>
  )
}
