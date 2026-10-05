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

export function Usage() {
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
            <Stat
              label="Rides"
              value="2,418"
              delta={{ value: '9%', direction: 'up', tone: 'positive' }}
              rule
            />
            <Stat
              label="Bikes in service"
              value="164"
              delta={{ value: '6', direction: 'down', tone: 'critical' }}
              rule
            />
            <Stat
              label="Revenue"
              value="£6,935"
              delta={{ value: '£410', direction: 'up', tone: 'positive' }}
              rule
            />
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
                        <Meter
                          value={station.bikes}
                          max={station.docks}
                          low={station.docks * 0.25}
                          optimum={station.docks * 0.6}
                          size="sm"
                          label={`${station.name} occupancy`}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <StatusDot
                          tone={STATUS[station.status].tone}
                          label={STATUS[station.status].label}
                        />
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
