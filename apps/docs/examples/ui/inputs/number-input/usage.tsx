'use client'

import { NumberInput, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <NumberInput aria-label="Passengers" defaultValue={2} min={1} max={9} stepper />
      <NumberInput
        aria-label="Distance"
        defaultValue={1450.5}
        step={0.5}
        trailing="km"
        formatOptions={{ maximumFractionDigits: 1 }}
      />
    </Stack>
  )
}
