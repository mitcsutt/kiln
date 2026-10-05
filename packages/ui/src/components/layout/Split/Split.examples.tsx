import { Box, Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'

const CHANGES = [
  'Route 7 now stops at Ferry Lane on weekdays.',
  'Night buses run every 15 minutes on Fridays.',
  'Kelso Bay Pier reopens on 3 November.',
]

export function Usage() {
  return (
    <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
      <Heading level={3} size="2xl">
        Timetable changes this month
      </Heading>
      <Stack gap={4} dividers>
        {CHANGES.map((change) => (
          <Text key={change}>{change}</Text>
        ))}
      </Stack>
    </Split>
  )
}

export function Ratios() {
  return (
    <Stack gap={4}>
      {(['1/1', '1/2', '1/3', '5/7'] as const).map((ratio) => (
        <Split key={ratio} ratio={ratio} gap={3} collapseBelow="sm">
          <Box padding={3} surface="sunken" radius="field">
            <Text size="sm">{ratio}</Text>
          </Box>
          <Box padding={3} border radius="field">
            <Text size="sm" tone="muted">
              The wider side
            </Text>
          </Box>
        </Split>
      ))}
    </Stack>
  )
}
