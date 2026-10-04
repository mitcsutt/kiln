'use client'

import { Box, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <Box padding={{ base: 4, md: 5 }} surface="sunken" radius="surface">
        <Text>Sunken: a well for secondary content.</Text>
      </Box>
      <Box padding={5} border radius="surface">
        <Text>Bordered: a hairline frame.</Text>
      </Box>
      <Box padding={5} surface="inverse" radius="surface">
        <Text>Inverse: colour roles flip inside.</Text>
      </Box>
    </Stack>
  )
}
