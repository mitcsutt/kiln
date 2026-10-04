'use client'

import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

export default function Items() {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      <Grid.Item span={{ base: 1, md: 2 }}>
        <Box padding={5} border radius="surface">
          <Text weight="medium">Live map</Text>
        </Box>
      </Grid.Item>
      <Box padding={5} border radius="surface">
        <Text weight="medium">Next departures</Text>
      </Box>
      <Grid.Item span={{ base: 1, md: 3 }}>
        <Box padding={5} surface="sunken" radius="surface">
          <Text tone="muted">Service updates</Text>
        </Box>
      </Grid.Item>
    </Grid>
  )
}
