'use client'

import { OneTimeCodeInput, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Usage() {
  const [done, setDone] = useState('')
  return (
    <Stack gap={3}>
      <OneTimeCodeInput aria-label="Verification code" length={6} onComplete={setDone} />
      <Text size="sm" tone="muted">
        {done ? `Checking ${done}` : 'Paste or type the code from the text message'}
      </Text>
    </Stack>
  )
}
