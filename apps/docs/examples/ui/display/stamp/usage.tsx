'use client'

import { Card, Inline, Stamp, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Inline gap={6} align="start">
      <Stamp>Cancelled</Stamp>
      <Stamp tone="positive" rotate={-4}>
        Paid
      </Stamp>
      <Stamp tone="neutral" size="sm">
        Void
      </Stamp>
      <Card>
        <Card.Header>
          <Card.Title>Ticket 0417</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text tone="muted">Harbour Square to Kelso Bay, 14 October</Text>
        </Card.Body>
        <Stamp placement="corner" tone="caution" aria-label="Ticket 0417 refunded">
          Refunded
        </Stamp>
      </Card>
    </Inline>
  )
}
