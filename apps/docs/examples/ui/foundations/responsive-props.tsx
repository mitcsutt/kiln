'use client'

import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const STOPS = ['Harbour', 'Northpoint', 'Kelso Bay', 'Ferry Lane', 'Old Quay', 'Marram Point']

export default function ResponsiveProps() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 3, md: 5 }}>
      {STOPS.map((stop) => (
        <Box key={stop} padding={4} border radius="surface">
          <Text weight="medium">{stop}</Text>
        </Box>
      ))}
    </Grid>
  )
}
