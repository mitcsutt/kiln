'use client'

import { SegmentedControl, Text, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Usage() {
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
