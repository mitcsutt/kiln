import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Badge } from '#components/display/Badge'
import { List } from '#components/display/List'
import { Meter } from '#components/display/Meter'
import { Stat } from '#components/display/Stat'
import { Table } from '#components/display/Table'
import { Alert } from '#components/feedback/Alert'
import { AppShell } from '#components/layout/AppShell'
import { Container } from '#components/layout/Container'
import { Grid } from '#components/layout/Grid'
import { Inline } from '#components/layout/Inline'
import { Section } from '#components/layout/Section'
import { Split } from '#components/layout/Split'
import { Stack } from '#components/layout/Stack'
import { NavLinks } from '#components/navigation/NavLinks'
import { Heading } from '#components/typography/Heading'
import { SectionHeader } from '#components/typography/SectionHeader'
import { Text } from '#components/typography/Text'

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
