'use client'

import { Link, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={3}>
      <Text>
        Read the <Link href="#accessibility">accessibility guide</Link> before you travel.
      </Text>
      <Text>
        Fares are set by the{' '}
        <Link href="https://example.com" external>
          regional transport board
        </Link>
        .
      </Text>
      <Text size="sm">
        <Link href="#terms" tone="muted" underline="hover">
          Terms of carriage
        </Link>
      </Text>
    </Stack>
  )
}
