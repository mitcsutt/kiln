'use client'

import { Button, Heading, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
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
