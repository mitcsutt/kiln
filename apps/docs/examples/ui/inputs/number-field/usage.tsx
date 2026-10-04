'use client'

import { NumberField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <NumberField
      label="Passengers"
      description="Children under five travel free and don't need a seat"
      defaultValue={2}
      min={1}
      max={9}
      stepper
    />
  )
}
