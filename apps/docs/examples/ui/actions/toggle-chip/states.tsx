'use client'

import { CheckIcon, Inline, ToggleChip } from '@mitcsutt/kiln-ui'

export default function States() {
  return (
    <Inline gap={2}>
      <ToggleChip size="sm">Small</ToggleChip>
      <ToggleChip>Off</ToggleChip>
      <ToggleChip defaultPressed>On</ToggleChip>
      <ToggleChip defaultPressed icon={<CheckIcon />}>
        Verified
      </ToggleChip>
      <ToggleChip disabled count={0}>
        Suspended
      </ToggleChip>
    </Inline>
  )
}
