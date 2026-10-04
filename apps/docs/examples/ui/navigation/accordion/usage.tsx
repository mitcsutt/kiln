'use client'

import { Accordion, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Accordion type="single" defaultValue="bikes">
      <Accordion.Item value="bikes">
        <Accordion.Trigger>Can I bring a bike?</Accordion.Trigger>
        <Accordion.Content>
          <Text>Yes, outside the morning peak. Fold-up bikes ride at any time.</Text>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="dogs">
        <Accordion.Trigger>Are dogs allowed?</Accordion.Trigger>
        <Accordion.Content>
          <Text>Dogs on a lead travel free on every ferry and bus.</Text>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="refunds">
        <Accordion.Trigger>How do refunds work?</Accordion.Trigger>
        <Accordion.Content>
          <Text>Unused tickets are refunded in full up to an hour before departure.</Text>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}
