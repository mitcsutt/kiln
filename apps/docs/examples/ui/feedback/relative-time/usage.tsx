'use client'

import { RelativeTime, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={2}>
      <Text size="sm" tone="muted">
        <RelativeTime date="2026-10-01T08:15:00Z" prefix="Timetable updated" />
      </Text>
      <Text>
        Winter timetable starts <RelativeTime date="2026-11-01T00:00:00Z" format="long" />
      </Text>
      <Text>
        Pier reopened <RelativeTime date="2026-06-12T09:00:00Z" format="narrow" />
      </Text>
    </Stack>
  )
}
