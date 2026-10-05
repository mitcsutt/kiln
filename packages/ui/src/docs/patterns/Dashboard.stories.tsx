import type { Meta, StoryObj } from '@storybook/react-vite'
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
import { Alert } from '#components/feedback/Alert'
import { AppShell } from '#components/layout/AppShell'
import { NavLinks } from '#components/navigation/NavLinks'
import { Heading } from '#components/typography/Heading'

/*
 * UI/Patterns/Dashboard: a day at a shared workshop that rents out bench time and tools,
 * built only from library components (no CSS module, no className, no inline style).
 * Every figure is invented and consistent with the others.
 */

const meta = {
  title: 'UI/Patterns/Dashboard',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type Status = 'in' | 'due' | 'late'

const BOOKINGS: { member: string; bench: string; from: string; until: string; status: Status }[] = [
  {
    member: 'Ines Duarte',
    bench: 'Woodshop, bench 2',
    from: '09:00',
    until: '12:00',
    status: 'in',
  },
  { member: 'Rowan Achebe', bench: 'Laser cutter', from: '10:30', until: '11:30', status: 'in' },
  { member: 'Hana Sato', bench: 'Ceramics, wheel 1', from: '11:00', until: '14:00', status: 'due' },
  { member: 'Tomás Ferreira', bench: 'Metal bay', from: '13:00', until: '16:00', status: 'due' },
  {
    member: 'Lena Brandt',
    bench: 'Woodshop, bench 4',
    from: '08:00',
    until: '10:00',
    status: 'late',
  },
]

const STATUS_LABEL: Record<Status, string> = {
  in: 'Checked in',
  due: 'Arriving later',
  late: 'Overran',
}

const STATUS_TONE = { in: 'positive', due: 'neutral', late: 'critical' } as const

const ACTIVITY = [
  { what: 'Band saw blade replaced', who: 'Kwame Asante', when: '08:40' },
  { what: 'Three new members joined', who: 'Front desk', when: '08:15' },
  { what: 'Kiln firing finished, 1,040°C', who: 'Ceramics', when: '07:55' },
]

export const Dashboard: Story = {
  render: () => (
    <AppShell>
      <AppShell.Header>
        <Container width="wide">
          <Inline justify="between" gap={5}>
            <Text weight="strong">Long Bench workshop</Text>
            <NavLinks label="Sections" hideBelow="md">
              <NavLinks.Item href="#today" active>
                Today
              </NavLinks.Item>
              <NavLinks.Item href="#members">Members</NavLinks.Item>
              <NavLinks.Item href="#tools">Tools</NavLinks.Item>
            </NavLinks>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={{ base: 6, md: 8 }}>
          <Container width="wide">
            <Stack gap={8}>
              <Inline justify="between" gap={4} align="end">
                <Stack gap={2}>
                  <Heading level={1} size="xl">
                    Thursday 8 October
                  </Heading>
                  <Text tone="muted">Open 08:00 to 20:00. Two staff on the floor.</Text>
                </Stack>
                <Button>Book a bench</Button>
              </Inline>

              <Alert tone="caution" title="Laser cutter needs a filter change">
                It has run 38 hours since the last one. Book it out for 30 minutes before Friday.
              </Alert>

              <Grid minItemWidth="xs" gap={6}>
                <Stat
                  rule
                  label="Bookings today"
                  value="14"
                  delta={{ value: '3', direction: 'up' }}
                  hint="vs last Thursday"
                />
                <Stat rule label="Members in now" value="6" hint="Capacity is 18" />
                <Stat
                  rule
                  label="Tools out on loan"
                  value="9"
                  delta={{ value: '2 overdue', direction: 'up', tone: 'critical' }}
                />
              </Grid>

              <Split ratio="2/1" collapseBelow="lg" gap={{ base: 7, lg: 8 }}>
                <Stack gap={5}>
                  <SectionHeader title="Bench bookings" level={2} size="lg" />
                  <Table density="compact">
                    <Table.Caption>Bench bookings for today</Table.Caption>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>Member</Table.HeaderCell>
                        <Table.HeaderCell hideBelow="md">Bench</Table.HeaderCell>
                        <Table.HeaderCell>Time</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {BOOKINGS.map((b) => (
                        <Table.Row key={b.member}>
                          <Table.Cell rowHeader>{b.member}</Table.Cell>
                          <Table.Cell hideBelow="md">{b.bench}</Table.Cell>
                          <Table.Cell>
                            {b.from} to {b.until}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge tone={STATUS_TONE[b.status]} variant="soft" dot>
                              {STATUS_LABEL[b.status]}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Stack>
                <Stack gap={7}>
                  <Stack gap={5}>
                    <SectionHeader title="Room use" level={2} size="lg" />
                    <Meter label="Woodshop" value={0.75} showValue />
                    <Meter label="Ceramics" value={0.5} showValue />
                    <Meter label="Metal bay" value={0.25} showValue />
                  </Stack>
                  <Stack gap={4}>
                    <SectionHeader title="Earlier today" level={2} size="lg" />
                    <List density="compact" aria-label="Earlier today">
                      {ACTIVITY.map((a) => (
                        <List.Item key={a.what}>
                          <List.Content>
                            {a.what}
                            <List.Description>{a.who}</List.Description>
                          </List.Content>
                          <List.Trailing>{a.when}</List.Trailing>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </Stack>
              </Split>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
    </AppShell>
  ),
}

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

/**
 * The week at a cycle hire scheme: stats on a rule, the stations in a table and the alerts beside
 * it.
 */
export const Usage: Story = {
  tags: ['docs'],
  parameters: { layout: 'fullscreen' },
  render: function Usage() {
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
  },
}
