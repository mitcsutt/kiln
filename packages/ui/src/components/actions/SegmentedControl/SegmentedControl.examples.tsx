import { MoonIcon, SegmentedControl, Stack, SunIcon, SystemIcon, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [view, setView] = useState('list')
  return (
    <Stack gap={3} align="start">
      <SegmentedControl aria-label="Timetable view" value={view} onValueChange={setView}>
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="map">Map</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>
      <Text size="sm" tone="muted">
        Showing the {view} view
      </Text>
    </Stack>
  )
}

export function Responsive() {
  return (
    <SegmentedControl
      aria-label="Departures"
      size={{ base: 'lg', md: 'md' }}
      fullWidth={{ base: true, md: false }}
      defaultValue="today"
      options={[
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'weekend', label: 'Weekend' },
      ]}
    />
  )
}

const MODES = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'System', icon: <SystemIcon /> },
]

export function Icons() {
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
