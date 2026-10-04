'use client'

import { meterTone, Text } from '@mitcsutt/kiln-ui'

export default function Tone() {
  return (
    <Text>
      Spending £94 of a £90 budget reads as{' '}
      <strong>{meterTone(94, { min: 0, max: 90, high: 80, optimum: 0 })}</strong>.
    </Text>
  )
}
