'use client'

import { Container, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      {(['narrow', 'text', 'content'] as const).map((width) => (
        <Container key={width} width={width}>
          <Text size="sm" tone="muted">
            width=&quot;{width}&quot;: the timetable for the coastal line, laid out to this width.
          </Text>
        </Container>
      ))}
    </Stack>
  )
}
