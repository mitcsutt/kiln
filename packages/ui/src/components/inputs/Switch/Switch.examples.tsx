import { Stack, Switch } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [alerts, setAlerts] = useState(true)
  return (
    <Stack gap={4}>
      <Switch label="Delay alerts" checked={alerts} onCheckedChange={setAlerts} />
      <Switch label="Quiet hours" size="sm" />
      <Switch label="Share my location" disabled />
    </Stack>
  )
}
