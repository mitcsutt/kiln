'use client'

import { Inline, LiveIndicator } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Inline gap={5}>
      <LiveIndicator />
      <LiveIndicator label="Tracking" tone="positive" />
      <LiveIndicator label="Live map" variant="pill" />
      <LiveIndicator label="Paused" tone="neutral" pulse={false} size="sm" />
    </Inline>
  )
}
