import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { Stack } from '#components/layout/Stack'
import { Tag, type TagColor } from '#components/display/Tag'
import { Amount } from '#components/typography/Amount'
import { Numeral } from '#components/typography/Numeral'
import { Text } from '#components/typography/Text'
import { LiveIndicator } from '#components/feedback/LiveIndicator'
import { StatusDot } from '#components/feedback/StatusDot'
import { Table, type TableSort } from './Table'

const meta = {
  title: 'UI/Display/Table',
  component: Table,
  args: { density: 'regular', variant: 'rules', striped: false, stickyHeader: false },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

/** A small timetable. Try `variant`, `density`, `striped` and `stickyHeader` in the controls. */
export const Playground: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '32rem' }}>
      <Table {...args}>
        <Table.Caption>Ferry timetable, weekdays</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Route</Table.HeaderCell>
            <Table.HeaderCell>Departs</Table.HeaderCell>
            <Table.HeaderCell numeric>Minutes</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {[
            ['Quay to Point', '07:15', 25],
            ['Quay to Island', '07:40', 50],
            ['Point to Quay', '08:05', 25],
            ['Island to Quay', '08:45', 50],
          ].map(([route, departs, minutes]) => (
            <Table.Row key={String(route)}>
              <Table.Cell rowHeader>{route}</Table.Cell>
              <Table.Cell>{departs}</Table.Cell>
              <Table.Cell numeric>{minutes}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Stack>
  ),
}

interface ProjectRow {
  project: string
  owner: string
  open: number
  done: number
  due: string
  points: number
  yours?: boolean
}

// Sprint 14, week 2 (story data).
const SPRINT: ProjectRow[] = [
  { project: 'Atlas redesign', owner: 'Priya Nair', open: 4, done: 8, due: '14 Oct', points: 21 },
  {
    project: 'Billing migration',
    owner: 'Tomás Ortega',
    open: 4,
    done: 6,
    due: '21 Oct',
    points: 18,
    yours: true,
  },
  { project: 'Mobile app', owner: 'Hana Kobayashi', open: 5, done: 4, due: '4 Nov', points: 13 },
  { project: 'Help centre', owner: 'Sam Okafor', open: 4, done: 2, due: '11 Nov', points: 5 },
]

/** A sprint's projects as a table. Your project is highlighted; Points sorts. */
export const SprintProjects: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<TableSort>('desc')
    const rows = useMemo(
      () =>
        [...SPRINT].sort((a, b) => (sort === 'asc' ? a.points - b.points : b.points - a.points)),
      [sort],
    )
    return (
      <Stack style={{ maxWidth: '40rem' }}>
        <Table {...args} label="Sprint 14 projects">
          <Table.Caption>Sprint 14 · week 2</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Project</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
              <Table.HeaderCell numeric>Done</Table.HeaderCell>
              <Table.HeaderCell>Due</Table.HeaderCell>
              <Table.HeaderCell
                numeric
                sort={sort}
                onSort={() => {
                  setSort((s) => (s === 'desc' ? 'asc' : 'desc'))
                }}
              >
                <abbr title="Story points">Points</abbr>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((r) => (
              <Table.Row key={r.project} highlighted={r.yours}>
                <Table.Cell rowHeader>{r.project}</Table.Cell>
                <Table.Cell>{r.owner}</Table.Cell>
                <Table.Cell numeric>{r.open}</Table.Cell>
                <Table.Cell numeric>{r.done}</Table.Cell>
                <Table.Cell>{r.due}</Table.Cell>
                <Table.Cell numeric>
                  <strong>{r.points}</strong>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Stack>
    )
  },
}

interface Invoice {
  date: string
  client: string
  service: string
  color: TagColor
  amount: number
}

const INVOICES: Invoice[] = [
  { date: '26 Sep', client: 'Northwind Studio', service: 'Design', color: 1, amount: 4200 },
  { date: '25 Sep', client: 'Brightline Labs', service: 'Development', color: 2, amount: 8650 },
  { date: '24 Sep', client: 'Orchard & Co (credit)', service: 'Support', color: 4, amount: -350 },
  { date: '23 Sep', client: 'Harbourview Clinic', service: 'Hosting', color: 3, amount: 186.45 },
  { date: '22 Sep', client: 'Fernhill Press', service: 'Consulting', color: 5, amount: 1240 },
  { date: '21 Sep', client: 'Tidewater Books', service: 'Training', color: 6, amount: 960.5 },
  { date: '20 Sep', client: 'Larkspur Health', service: 'Licences', color: 7, amount: 239.99 },
]

/** A ledger: compact, ruled, figures right-aligned and tabular, with a totals row. */
export const Invoices: Story = {
  args: { density: 'compact' },
  render: (args) => {
    const total = INVOICES.reduce((sum, t) => sum + t.amount, 0)
    return (
      <Stack style={{ maxWidth: '40rem' }}>
        <Table {...args} label="September invoices">
          <Table.Caption>Invoices issued · September</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Issued</Table.HeaderCell>
              <Table.HeaderCell>Client</Table.HeaderCell>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell numeric>Amount</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {INVOICES.map((t) => (
              <Table.Row key={t.client} interactive>
                <Table.Cell numeric align="start">
                  {t.date}
                </Table.Cell>
                <Table.Cell rowHeader>{t.client}</Table.Cell>
                <Table.Cell>
                  <Tag color={t.color}>{t.service}</Tag>
                </Table.Cell>
                <Table.Cell numeric>
                  <Amount value={t.amount} accounting />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Foot>
            <Table.Row>
              <Table.Cell colSpan={3}>Total for the period</Table.Cell>
              <Table.Cell numeric>
                <Amount value={total} accounting />
              </Table.Cell>
            </Table.Row>
          </Table.Foot>
        </Table>
      </Stack>
    )
  },
}

/** `plain` drops the row rules; `striped` adds fills. Use one or the other. */
export const PlainAndStriped: Story = {
  render: () => (
    <Stack gap={7} style={{ maxWidth: '32rem' }}>
      {(
        [
          { variant: 'plain', striped: false },
          { variant: 'plain', striped: true },
        ] as const
      ).map((v) => (
        <Table key={String(v.striped)} variant={v.variant} striped={v.striped} density="compact">
          <Table.Caption>{v.striped ? 'Plain, striped' : 'Plain'}</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Reviewer</Table.HeaderCell>
              <Table.HeaderCell>Project</Table.HeaderCell>
              <Table.HeaderCell numeric>Reviews</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {[
              ['Priya Nair', 'Atlas redesign', 14],
              ['Tomás Ortega', 'Billing migration', 11],
              ['Hana Kobayashi', 'Mobile app', 9],
              ['Sam Okafor', 'Help centre', 6],
            ].map(([reviewer, project, reviews]) => (
              <Table.Row key={String(reviewer)}>
                <Table.Cell rowHeader>{reviewer}</Table.Cell>
                <Table.Cell>{project}</Table.Cell>
                <Table.Cell numeric>{reviews}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ))}
    </Stack>
  ),
}

/**
 * On a phone the table drops to what matters: `hideBelow="md"` on a column's header
 * and cells removes the owner and done columns under 48em; `width="fill"` gives the
 * project column the spare width and `width="min"` keeps the points column tight. Resize
 * the canvas to see it.
 */
export const ResponsiveColumns: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '40rem' }}>
      <Table {...args} label="Sprint 14 projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="fill">Project</Table.HeaderCell>
            <Table.HeaderCell hideBelow="md">Owner</Table.HeaderCell>
            <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
            <Table.HeaderCell numeric hideBelow="md">
              Done
            </Table.HeaderCell>
            <Table.HeaderCell>Due</Table.HeaderCell>
            <Table.HeaderCell numeric width="min">
              Points
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {SPRINT.map((r) => (
            <Table.Row key={r.project} highlighted={r.yours}>
              <Table.Cell rowHeader>{r.project}</Table.Cell>
              <Table.Cell hideBelow="md">{r.owner}</Table.Cell>
              <Table.Cell numeric>{r.open}</Table.Cell>
              <Table.Cell numeric hideBelow="md">
                {r.done}
              </Table.Cell>
              <Table.Cell>{r.due}</Table.Cell>
              <Table.Cell numeric>
                <strong>{r.points}</strong>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Stack>
  ),
}

/**
 * A highlighted row re-points the colour roles for its cells, so muted text, tone-coloured
 * figures and live/status markers stay legible on the highlight (gold in Fiesta night).
 */
export const HighlightedWithTones: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '40rem' }}>
      <Table {...args} label="Workspaces with a deploy today">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="fill">Workspace</Table.HeaderCell>
            <Table.HeaderCell>Deploy</Table.HeaderCell>
            <Table.HeaderCell numeric>Seats today</Table.HeaderCell>
            <Table.HeaderCell numeric>Balance</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {[
            {
              name: 'Northwind Studio',
              deploy: 'Release 2.4 to production',
              live: true,
              today: 3,
              balance: 12.5,
            },
            {
              name: 'Brightline Labs (your workspace)',
              deploy: 'Release 2.4 to staging',
              live: true,
              today: -1,
              balance: -4.5,
              you: true,
            },
            {
              name: 'Orchard & Co',
              deploy: 'Hotfix 2.3.1',
              live: false,
              today: 0,
              balance: 0,
            },
          ].map((o) => (
            <Table.Row key={o.name} highlighted={o.you}>
              <Table.Cell rowHeader>
                {o.name}
                <Text as="span" size="xs" tone="muted">
                  {' '}
                  · 3 projects
                </Text>
              </Table.Cell>
              <Table.Cell>
                {o.live ? (
                  <LiveIndicator size="sm" label={`${o.deploy} · 4 min`} />
                ) : (
                  <StatusDot size="sm" tone="positive" label={`${o.deploy} · done`} />
                )}
              </Table.Cell>
              <Table.Cell numeric>
                <Numeral value={o.today} signDisplay="exceptZero" tone="auto" />
              </Table.Cell>
              <Table.Cell numeric>
                <Amount value={o.balance} accounting />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Stack>
  ),
}
