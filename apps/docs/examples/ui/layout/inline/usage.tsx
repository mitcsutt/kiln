'use client'

import { Badge, Button, Inline, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Inline gap={3} justify={{ base: 'start', md: 'between' }}>
      <Inline gap={2}>
        <Text weight="strong">Route 7</Text>
        <Badge tone="caution">Diverted</Badge>
      </Inline>
      <Inline gap={2}>
        <Button size="sm" variant="outline" tone="neutral">
          Share
        </Button>
        <Button size="sm">Track live</Button>
      </Inline>
    </Inline>
  )
}
