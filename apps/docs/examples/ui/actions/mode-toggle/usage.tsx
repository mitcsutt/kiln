'use client'

import { Inline, ModeToggle, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={5} align="start">
      <Inline gap={3}>
        <ModeToggle size="sm" />
        <ModeToggle />
        <ModeToggle buttonVariant="outline" />
      </Inline>
      <ModeToggle variant="segmented" />
      <ModeToggle variant="segmented" iconOnly size="sm" />
    </Stack>
  )
}
