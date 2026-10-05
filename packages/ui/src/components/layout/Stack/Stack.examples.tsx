import { Button, Heading, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4} align="start">
      <Heading level={3} size="xl">
        Night bus N14
      </Heading>
      <Text tone="muted">Every 20 minutes from Harbour Square until 04:40.</Text>
      <Button size="sm">Save route</Button>
    </Stack>
  )
}

const STOPS = [
  { name: 'Harbour Square', time: '23:10' },
  { name: 'Northpoint Library', time: '23:18' },
  { name: 'Kelso Bay Pier', time: '23:31' },
]

export function Dividers() {
  return (
    <Stack gap={{ base: 3, md: 4 }} dividers>
      {STOPS.map((stop) => (
        <Inline key={stop.name} justify="between">
          <Text>{stop.name}</Text>
          <Text numeric tone="muted">
            {stop.time}
          </Text>
        </Inline>
      ))}
    </Stack>
  )
}
