import { Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={3}>
      <Text size="lg">The coastal line runs every 20 minutes until midnight.</Text>
      <Text>Bikes travel free outside the morning peak.</Text>
      <Text size="sm" tone="muted">
        Updated 3 minutes ago
      </Text>
      <Text tone="critical" weight="medium">
        Kelso Bay Pier is closed for repairs.
      </Text>
      <Text numeric>Departures: 07:10, 07:30, 07:50</Text>
      <Text truncate={2} measure="narrow">
        Long service notices can be clamped to a number of lines, so a list of them stays even when
        one of the notices runs on much longer than the others do.
      </Text>
    </Stack>
  )
}
