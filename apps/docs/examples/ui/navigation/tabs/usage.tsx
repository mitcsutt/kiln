'use client'

import { Tabs, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Tabs defaultValue="weekdays">
      <Tabs.List aria-label="Coastal line timetable">
        <Tabs.Trigger value="weekdays">Weekdays</Tabs.Trigger>
        <Tabs.Trigger value="saturday">Saturday</Tabs.Trigger>
        <Tabs.Trigger value="sunday">Sunday and holidays</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="weekdays">
        <Text>Every 20 minutes from 06:10 to 23:50.</Text>
      </Tabs.Content>
      <Tabs.Content value="saturday">
        <Text>Every 30 minutes from 07:00 to 23:30.</Text>
      </Tabs.Content>
      <Tabs.Content value="sunday">
        <Text>Hourly from 08:00 to 22:00.</Text>
      </Tabs.Content>
    </Tabs>
  )
}
