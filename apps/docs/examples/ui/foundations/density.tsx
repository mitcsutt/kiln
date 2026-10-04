'use client'

import { Button, Inline, Stack, Text, TextField } from '@mitcsutt/kiln-ui'

export default function Density() {
  return (
    <Inline gap={7} align="start">
      {(['compact', undefined, 'comfortable'] as const).map((density) => (
        <div key={density ?? 'default'} data-density={density}>
          <Stack gap={4}>
            <Text size="sm" tone="muted">
              {density ?? 'Theme default'}
            </Text>
            <TextField label="Berth" defaultValue="3" />
            <Button size="sm">Board now</Button>
          </Stack>
        </div>
      ))}
    </Inline>
  )
}
