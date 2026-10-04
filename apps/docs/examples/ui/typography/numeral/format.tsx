'use client'

import { formatNumeral, signOf, Stack, Text } from '@mitcsutt/kiln-ui'

const change = -0.042

export default function Format() {
  return (
    <Stack gap={2}>
      <Text>Plain string: {formatNumeral(18432)}</Text>
      <Text>
        Sign of {change}: {signOf(change)}
      </Text>
    </Stack>
  )
}
