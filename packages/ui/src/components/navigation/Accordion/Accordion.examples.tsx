import { Accordion, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
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

export function Contained() {
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
