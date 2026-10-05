import { AmountInput, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [value, setValue] = useState<number | null>(96)
  return (
    <Stack gap={3}>
      <AmountInput
        aria-label="Top-up amount"
        currency="GBP"
        locale="en-GB"
        value={value}
        onValueChange={setValue}
        min={5}
      />
      <Text size="sm" tone="muted">
        Value: {String(value)}
      </Text>
    </Stack>
  )
}
