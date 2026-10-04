'use client'

import { Progress, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={5}>
      <Progress label="Uploading timetable.csv" value={64} showValue />
      <Progress label="Syncing saved routes" value={null} />
      <Progress label="Import finished" value={100} tone="positive" size="sm" />
    </Stack>
  )
}
