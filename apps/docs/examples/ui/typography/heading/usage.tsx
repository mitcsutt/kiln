'use client'

import { Heading, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <Heading level={2} size="display-sm">
        Summer timetable
      </Heading>
      <Heading level={3}>Coastal line</Heading>
      <Heading level={4} tone="muted">
        Weekend services
      </Heading>
    </Stack>
  )
}
