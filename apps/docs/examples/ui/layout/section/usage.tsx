'use client'

import { Button, Container, Heading, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <>
      <Section space={7}>
        <Container width="text">
          <Stack gap={3}>
            <Heading level={3} size="2xl">
              Ride the coast for less
            </Heading>
            <Text tone="muted">An annual pass covers every ferry and bus in the bay.</Text>
          </Stack>
        </Container>
      </Section>
      <Section space={6} surface="inverse" divider="top">
        <Container width="text">
          <Stack gap={4} align="start">
            <Text>Commuting every day? The pass pays for itself in five weeks.</Text>
            <Button>Buy an annual pass</Button>
          </Stack>
        </Container>
      </Section>
    </>
  )
}
