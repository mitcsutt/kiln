import { Button, EmptyState, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={6}>
      <EmptyState
        title="No saved routes yet"
        description="Save a route from any timetable and its next departures show up here."
        action={<Button>Find a route</Button>}
      />
      <EmptyState
        framed
        align="center"
        title="No sailings match"
        description="Try a different day, or include services that need a booking."
        action={
          <Button variant="outline" tone="neutral">
            Clear filters
          </Button>
        }
      />
    </Stack>
  )
}
