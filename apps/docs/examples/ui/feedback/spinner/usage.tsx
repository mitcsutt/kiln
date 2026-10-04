'use client'

import { Button, Inline, Spinner, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Inline gap={6}>
      <Spinner size="sm" label="Loading departures" />
      <Spinner label="Loading departures" />
      <Spinner size="lg" label="Loading departures" />
      <Text>
        Checking seats <Spinner size="inherit" label={null} />
      </Text>
      <Button loading>Booking</Button>
    </Inline>
  )
}
