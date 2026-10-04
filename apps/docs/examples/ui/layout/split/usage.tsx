'use client'

import { Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'

const CHANGES = [
  'Route 7 now stops at Ferry Lane on weekdays.',
  'Night buses run every 15 minutes on Fridays.',
  'Kelso Bay Pier reopens on 3 November.',
]

export default function Usage() {
  return (
    <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
      <Heading level={3} size="2xl">
        Timetable changes this month
      </Heading>
      <Stack gap={4} dividers>
        {CHANGES.map((change) => (
          <Text key={change}>{change}</Text>
        ))}
      </Stack>
    </Split>
  )
}
