import { Alert, Button, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [shown, setShown] = useState(true)
  return (
    <Stack gap={4}>
      <Alert
        tone="critical"
        title="Couldn't load live departures"
        action={
          <Button size="sm" variant="outline" tone="neutral">
            Try again
          </Button>
        }
      >
        The departures board didn't answer. Times below are from the printed timetable.
      </Alert>
      <Alert tone="caution" title="Kelso Bay Pier works">
        Boarding moves to berth 3 until Friday 17 October.
      </Alert>
      {shown ? (
        <Alert
          tone="info"
          variant="soft"
          onDismiss={() => {
            setShown(false)
          }}
        >
          Annual passes now include the night buses.
        </Alert>
      ) : null}
      <Alert tone="positive" title="Seat booked">
        Ferry to Kelso Bay, 07:10 tomorrow, seat 14C.
      </Alert>
    </Stack>
  )
}
