'use client'

import { Button, Inline } from '@mitcsutt/kiln-ui'

export default function Sizes() {
  return (
    <Inline gap={3}>
      <Button size="sm">Book a seat</Button>
      <Button size="md">Book a seat</Button>
      <Button size="lg">Book a seat</Button>
    </Inline>
  )
}
