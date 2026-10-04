'use client'

import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'

const STOPS = [
  { name: 'Harbour Square', time: '23:10' },
  { name: 'Northpoint Library', time: '23:18' },
  { name: 'Kelso Bay Pier', time: '23:31' },
]

export default function Dividers() {
  return (
    <Stack gap={{ base: 3, md: 4 }} dividers>
      {STOPS.map((stop) => (
        <Inline key={stop.name} justify="between">
          <Text>{stop.name}</Text>
          <Text numeric tone="muted">
            {stop.time}
          </Text>
        </Inline>
      ))}
    </Stack>
  )
}
