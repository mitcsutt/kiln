import { Box, Button, Grid, Inline, Stack, Text, TextField } from '@mitcsutt/kiln-ui'

export function Density() {
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

const STOPS = ['Harbour', 'Northpoint', 'Kelso Bay', 'Ferry Lane', 'Old Quay', 'Marram Point']

export function ResponsiveProps() {
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
