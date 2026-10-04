'use client'

import { Accordion, Text } from '@mitcsutt/kiln-ui'

export default function Contained() {
  return (
    <Accordion type="multiple" variant="contained" size="sm">
      <Accordion.Item value="weekday">
        <Accordion.Trigger>Weekday fares</Accordion.Trigger>
        <Accordion.Content>
          <Text size="sm">Single £2.80, return £5.00, day pass £7.50.</Text>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="weekend">
        <Accordion.Trigger>Weekend fares</Accordion.Trigger>
        <Accordion.Content>
          <Text size="sm">Single £2.40, family day pass £14.00.</Text>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}
