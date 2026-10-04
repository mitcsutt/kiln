'use client'

import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const PIERS = ['North pier', 'South pier', 'Ferry terminal', 'Lifeboat station', 'Fish market']

export default function AutoFill() {
  return (
    <Grid minItemWidth="xs" gap={4}>
      {PIERS.map((pier) => (
        <Box key={pier} padding={4} surface="sunken" radius="surface">
          <Text>{pier}</Text>
        </Box>
      ))}
    </Grid>
  )
}
