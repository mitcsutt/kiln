import { Button, Container, Heading, Inline, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Section space={7}>
      <Container width="text">
        <Stack gap={5}>
          <Heading level={1} size="display-sm">
            Maps for people in a hurry
          </Heading>
          <Text size="lg" tone="muted">
            Every ferry, tram and night bus in the bay, on one timetable that fits in a pocket.
          </Text>
          <Inline gap={3}>
            <Button>Download the timetable</Button>
            <Button variant="outline" tone="neutral">
              See the route map
            </Button>
          </Inline>
        </Stack>
      </Container>
    </Section>
  )
}
