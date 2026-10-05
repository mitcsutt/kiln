import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const LINES = ['Red', 'Harbour', 'Coastal', 'Night', 'Airport', 'Orbital', 'Market', 'University']

export function Columns() {
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

const PIERS = ['North pier', 'South pier', 'Ferry terminal', 'Lifeboat station', 'Fish market']

export function AutoFill() {
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

export function Items() {
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
