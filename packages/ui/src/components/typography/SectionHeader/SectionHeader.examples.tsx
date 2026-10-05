import { Button, SectionHeader, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={7}>
      <SectionHeader
        title="Saved routes"
        description="Three routes, two with disruptions today."
        actions={<Button size="sm">Plan a route</Button>}
      />
      <SectionHeader level={3} size="lg" kicker="Coastal line" title="Weekend timetable" divider />
    </Stack>
  )
}
