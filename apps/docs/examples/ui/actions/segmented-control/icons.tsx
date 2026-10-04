'use client'

import { MoonIcon, SegmentedControl, Stack, SunIcon, SystemIcon } from '@mitcsutt/kiln-ui'

const MODES = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'System', icon: <SystemIcon /> },
]

export default function Icons() {
  return (
    <Stack gap={4} align="start">
      <SegmentedControl aria-label="Map style" options={MODES} defaultValue="dark" />
      <SegmentedControl
        aria-label="Map style"
        iconOnly
        size="sm"
        options={MODES}
        defaultValue="system"
      />
    </Stack>
  )
}
