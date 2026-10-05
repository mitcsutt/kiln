import { Divider, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <Text>Morning departures</Text>
      <Divider />
      <Divider label="Afternoon" spacing={4} />
      <Divider label="Evening" labelPosition="center" strong />
      <Inline gap={3}>
        <Text size="sm">Timetable</Text>
        <Divider orientation="vertical" />
        <Text size="sm">Fares</Text>
        <Divider orientation="vertical" />
        <Text size="sm">Accessibility</Text>
      </Inline>
    </Stack>
  )
}
