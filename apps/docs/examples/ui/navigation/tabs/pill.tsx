'use client'

import { Tabs, Text } from '@mitcsutt/kiln-ui'

export default function Pill() {
  return (
    <Tabs defaultValue="map" variant="pill">
      <Tabs.List aria-label="Route view">
        <Tabs.Trigger value="map">Map</Tabs.Trigger>
        <Tabs.Trigger value="stops">Stops</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="map">
        <Text tone="muted">The route on a map of the bay.</Text>
      </Tabs.Content>
      <Tabs.Content value="stops">
        <Text tone="muted">Fourteen stops, from Harbour Square to Marram Point.</Text>
      </Tabs.Content>
    </Tabs>
  )
}
