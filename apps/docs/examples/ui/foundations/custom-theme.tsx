'use client'

import { Box, Button, Heading, Inline, Stack, Text, ThemeScope } from '@mitcsutt/kiln-ui'

export default function CustomTheme() {
  return (
    <ThemeScope theme="harbour">
      <Box padding={6}>
        <Stack gap={4}>
          <Heading level={3} size="2xl">
            High water 06:42
          </Heading>
          <Text tone="muted">Next sailing to Kelso Bay boards at berth 3.</Text>
          <Inline gap={3}>
            <Button>Book a seat</Button>
            <Button variant="outline" tone="neutral">
              Tide table
            </Button>
          </Inline>
        </Stack>
      </Box>
    </ThemeScope>
  )
}
