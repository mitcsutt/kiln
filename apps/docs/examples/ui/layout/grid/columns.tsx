'use client'

import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const LINES = ['Red', 'Harbour', 'Coastal', 'Night', 'Airport', 'Orbital', 'Market', 'University']

export default function Columns() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      {LINES.map((line) => (
        <Box key={line} padding={4} border radius="surface">
          <Text weight="medium">{line} line</Text>
        </Box>
      ))}
    </Grid>
  )
}
