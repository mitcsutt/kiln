'use client'

import { Inline, Skeleton, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4} aria-busy="true" aria-label="Loading departures">
      <Inline gap={3}>
        <Skeleton.Circle size="md" />
        <Skeleton width="1/3" height="heading" />
      </Inline>
      <Skeleton.Text lines={3} />
    </Stack>
  )
}
