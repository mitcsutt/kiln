'use client'

import { Stat } from '@mitcsutt/kiln-ui'

export default function Hero() {
  return (
    <Stat
      size="hero"
      label="Fares collected this month"
      value="£214,880"
      delta={{ value: '£12,400', direction: 'up', tone: 'positive' }}
      rule
    />
  )
}
