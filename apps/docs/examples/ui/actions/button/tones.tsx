'use client'

import { Button, Inline, Stack } from '@mitcsutt/kiln-ui'

export default function Tones() {
  return (
    <Stack gap={4}>
      {(['accent', 'neutral', 'critical'] as const).map((tone) => (
        <Inline key={tone} gap={3}>
          <Button tone={tone}>Solid</Button>
          <Button tone={tone} variant="outline">
            Outline
          </Button>
          <Button tone={tone} variant="ghost">
            Ghost
          </Button>
        </Inline>
      ))}
    </Stack>
  )
}
