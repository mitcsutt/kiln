import {
  formatAbsoluteTime,
  formatRelativeTime,
  RelativeTime,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'

export function Usage() {
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

const SAILING = new Date('2026-10-14T07:10:00')
const NOW = new Date('2026-10-14T06:45:00').getTime()

export function Format() {
  return (
    <Stack gap={2}>
      <Text>{formatRelativeTime(SAILING, NOW, 'en-GB')}</Text>
      <Text>{formatAbsoluteTime(SAILING, 'en-GB')}</Text>
    </Stack>
  )
}
