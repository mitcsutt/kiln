'use client'

import { formatAbsoluteTime, formatRelativeTime, Stack, Text } from '@mitcsutt/kiln-ui'

const SAILING = new Date('2026-10-14T07:10:00')
const NOW = new Date('2026-10-14T06:45:00').getTime()

export default function Format() {
  return (
    <Stack gap={2}>
      <Text>{formatRelativeTime(SAILING, NOW, 'en-GB')}</Text>
      <Text>{formatAbsoluteTime(SAILING, 'en-GB')}</Text>
    </Stack>
  )
}
