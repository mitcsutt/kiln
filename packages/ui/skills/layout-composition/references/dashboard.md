<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Dashboard

> A week of operations at a glance, built from stats, a table and a list. No tiles, no gradients, no cards that don't need to be cards.

Source: https://kiln.mitchellsutton.com/docs/ui/patterns/dashboard

A dashboard's hero is the subject's most characteristic thing: here, the docking stations and which ones need a van. The figures above it are typographic `Stat`s on a hairline rule rather than three identical tiles with icons in tinted circles.

```tsx
import {
  Badge,
  Button,
  Container,
  Grid,
  Inline,
  List,
  Meter,
  Section,
  SectionHeader,
  Split,
  Stack,
  Stat,
  StatusDot,
  Table,
  Text,
} from '@mitcsutt/kiln-ui'

const STATIONS = [
  { name: 'Harbour Square', bikes: 18, docks: 24, status: 'ok' },
  { name: 'Northpoint Library', bikes: 3, docks: 16, status: 'low' },
  { name: 'Kelso Bay Pier', bikes: 11, docks: 20, status: 'ok' },
  { name: 'Ferry Lane', bikes: 0, docks: 12, status: 'empty' },
  { name: 'Old Quay Market', bikes: 9, docks: 14, status: 'ok' },
] as const

const STATUS = {
  ok: { tone: 'positive', label: 'Stocked' },
  low: { tone: 'caution', label: 'Running low' },
  empty: { tone: 'critical', label: 'Empty' },
} as const

export default function Dashboard() {
  return (
    <Section space={7}>
      <Container width="wide">
        <Stack gap={7}>
          <SectionHeader
            level={2}
            title="This week at Northpoint Cycle Hire"
            description="Monday 13 to Sunday 19 October"
            actions={
              <Inline gap={3}>
                <Button variant="outline" tone="neutral">
                  Export CSV
                </Button>
                <Button>Schedule a rebalance</Button>
              </Inline>
            }
          />
          <Grid columns={{ base: 1, sm: 3 }} gap={6}>
                                              </Grid>
          <Split ratio="7/5" gap={7}>
            <Stack gap={4}>
              <Text weight="strong">Docking stations</Text>
              <Table density="compact" label="Docking stations">
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Station</Table.HeaderCell>
                    <Table.HeaderCell numeric>Bikes</Table.HeaderCell>
                    <Table.HeaderCell hideBelow="sm">Occupancy</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {STATIONS.map((station) => (
                    <Table.Row key={station.name}>
                      <Table.Cell rowHeader>{station.name}</Table.Cell>
                      <Table.Cell numeric>
                        {station.bikes} / {station.docks}
                      </Table.Cell>
                      <Table.Cell hideBelow="sm">
                                              </Table.Cell>
                      <Table.Cell>
                                              </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Stack>
            <Stack gap={4}>
              <Inline justify="between">
                <Text weight="strong">Needs attention</Text>
                <Badge tone="critical">2</Badge>
              </Inline>
              <List divided>
                <List.Item>
                  <List.Content>
                    <Text weight="medium">Ferry Lane is empty</Text>
                    <List.Description>
                      Since 07:52. The nearest van is 12 minutes away.
                    </List.Description>
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content>
                    <Text weight="medium">Bike 0417 reported a flat tyre</Text>
                    <List.Description>Left at Kelso Bay Pier, dock 6.</List.Description>
                  </List.Content>
                </List.Item>
              </List>
            </Stack>
          </Split>
        </Stack>
      </Container>
    </Section>
  )
}
```

## What it's made of

- **`SectionHeader`** carries the title, the date range and both actions, so the header is one component with one alignment.
- **`Stat` with `rule`**: label, number and change on one baseline. The change takes a tone only where the direction is good or bad news.
- **`Table` with `numeric` cells** keeps the figures in tabular lining numerals that line up down the column. `hideBelow="sm"` drops the occupancy meters on a phone instead of squeezing them.
- **`Meter`** shows a level within a known range (bikes in docks), with `low` and `optimum` so the tone follows the value. A `Progress` would claim the stations are heading somewhere.
- **`StatusDot`** pairs colour with a word, so status never depends on colour alone.
- **`Split ratio="7/5"`**: an asymmetric split, the table given the room and the alerts beside it.

## Why it isn't cards

Cards are for self-contained, interactive objects. A dashboard's numbers are one document read top to bottom, so they sit on the canvas, separated by rules and space. Put a `Card` around something only when it's a thing you'd pick up, open or drag.
