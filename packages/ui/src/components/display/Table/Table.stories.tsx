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

interface TeamRow {
  team: string
  p: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
  yours?: boolean
}

// Division two after round 3 (story data): every result is consistent across the table.
const DIVISION: TeamRow[] = [
  { team: 'Harbour Hawks', p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, pts: 7 },
  { team: 'Eastgate United', p: 3, w: 1, d: 2, l: 0, gf: 4, ga: 3, pts: 5, yours: true },
  { team: 'Old Town Wanderers', p: 3, w: 1, d: 0, l: 2, gf: 4, ga: 5, pts: 3 },
  { team: 'Westbank Swifts', p: 3, w: 0, d: 1, l: 2, gf: 2, ga: 5, pts: 1 },
]

const gd = (r: TeamRow) => r.gf - r.ga
const signed = (n: number) => (n > 0 ? `+${String(n)}` : n < 0 ? `−${String(Math.abs(n))}` : '0')

/** A league table. Your club is highlighted; Pts sorts. */
export const LeagueTable: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<TableSort>('desc')
    const rows = useMemo(
      () => [...DIVISION].sort((a, b) => (sort === 'asc' ? a.pts - b.pts : b.pts - a.pts)),
      [sort],
    )
    return (
      <Stack style={{ maxWidth: '40rem' }}>
        <Table {...args} label="Division two table">
          <Table.Caption>Division two · after round 3</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell numeric>#</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Played">P</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Won">W</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Drawn">D</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Lost">L</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Goals for">GF</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Goals against">GA</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell numeric>
                <abbr title="Goal difference">GD</abbr>
              </Table.HeaderCell>
              <Table.HeaderCell
                numeric
                sort={sort}
                onSort={() => {
                  setSort((s) => (s === 'desc' ? 'asc' : 'desc'))
                }}
              >
                Pts
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((r) => (
              <Table.Row key={r.team} highlighted={r.yours}>
                <Table.Cell numeric>{DIVISION.indexOf(r) + 1}</Table.Cell>
                <Table.Cell rowHeader>{r.team}</Table.Cell>
                <Table.Cell numeric>{r.p}</Table.Cell>
                <Table.Cell numeric>{r.w}</Table.Cell>
                <Table.Cell numeric>{r.d}</Table.Cell>
                <Table.Cell numeric>{r.l}</Table.Cell>
                <Table.Cell numeric>{r.gf}</Table.Cell>
                <Table.Cell numeric>{r.ga}</Table.Cell>
                <Table.Cell numeric>{signed(gd(r))}</Table.Cell>
                <Table.Cell numeric>
                  <strong>{r.pts}</strong>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Stack>
    )
  },
}

interface Txn {
  date: string
  payee: string
  category: string
  color: TagColor
  amount: number
}

const TRANSACTIONS: Txn[] = [
  { date: '26 Sep', payee: 'Corner Grocer', category: 'Groceries', color: 1, amount: -84.2 },
  { date: '25 Sep', payee: 'Salary — Harbour Labs', category: 'Income', color: 2, amount: 3725 },
  { date: '24 Sep', payee: 'Metro Transit top-up', category: 'Transport', color: 4, amount: -50 },
  { date: '23 Sep', payee: 'City Power', category: 'Utilities', color: 3, amount: -186.45 },
  { date: '22 Sep', payee: 'Rent — Eastgate Lettings', category: 'Rent', color: 5, amount: -1240 },
  { date: '21 Sep', payee: 'Trattoria Nove', category: 'Eating out', color: 6, amount: -96.5 },
  { date: '20 Sep', payee: 'High Street Pharmacy', category: 'Health', color: 7, amount: -23.99 },
]

/** A ledger: compact, ruled, figures right-aligned and tabular, with a totals row. */
export const Transactions: Story = {
  args: { density: 'compact' },
  render: (args) => {
    const net = TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)
    return (
      <Stack style={{ maxWidth: '40rem' }}>
        <Table {...args} label="September transactions">
          <Table.Caption>Everyday account · September</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Payee</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell numeric>Amount</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {TRANSACTIONS.map((t) => (
              <Table.Row key={t.payee} interactive>
                <Table.Cell numeric align="start">
                  {t.date}
                </Table.Cell>
                <Table.Cell rowHeader>{t.payee}</Table.Cell>
                <Table.Cell>
                  <Tag color={t.color}>{t.category}</Tag>
                </Table.Cell>
                <Table.Cell numeric>
                  <Amount value={t.amount} accounting />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Foot>
            <Table.Row>
              <Table.Cell colSpan={3}>Net for the period</Table.Cell>
              <Table.Cell numeric>
                <Amount value={net} accounting />
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
              <Table.HeaderCell>Player</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell numeric>Goals</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {[
              ['Sione Taufa', 'Harbour Hawks', 3],
              ['Lena Brandt', 'Eastgate United', 2],
              ['Tomás Ferreira', 'Old Town Wanderers', 2],
              ['Kwame Asante', 'Westbank Swifts', 1],
            ].map(([player, team, goals]) => (
              <Table.Row key={String(player)}>
                <Table.Cell rowHeader>{player}</Table.Cell>
                <Table.Cell>{team}</Table.Cell>
                <Table.Cell numeric>{goals}</Table.Cell>
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
 * and cells removes W/D/L/GF/GA under 48em; `width="fill"` gives the team column the
 * spare width and `width="min"` keeps rank tight. Resize the canvas to see it.
 */
export const ResponsiveColumns: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '40rem' }}>
      <Table {...args} label="Division two table">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell numeric width="min">
              #
            </Table.HeaderCell>
            <Table.HeaderCell width="fill">Team</Table.HeaderCell>
            <Table.HeaderCell numeric>
              <abbr title="Played">P</abbr>
            </Table.HeaderCell>
            {(['W', 'D', 'L', 'GF', 'GA'] as const).map((h) => (
              <Table.HeaderCell key={h} numeric hideBelow="md">
                {h}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell numeric>
              <abbr title="Goal difference">GD</abbr>
            </Table.HeaderCell>
            <Table.HeaderCell numeric>Pts</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {DIVISION.map((r, i) => (
            <Table.Row key={r.team} highlighted={r.yours}>
              <Table.Cell numeric>{i + 1}</Table.Cell>
              <Table.Cell rowHeader>{r.team}</Table.Cell>
              <Table.Cell numeric>{r.p}</Table.Cell>
              {[r.w, r.d, r.l, r.gf, r.ga].map((n, j) => (
                <Table.Cell key={j} numeric hideBelow="md">
                  {n}
                </Table.Cell>
              ))}
              <Table.Cell numeric>{signed(gd(r))}</Table.Cell>
              <Table.Cell numeric>
                <strong>{r.pts}</strong>
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
      <Table {...args} label="Clubs with a match on now">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell width="fill">Club</Table.HeaderCell>
            <Table.HeaderCell>Match</Table.HeaderCell>
            <Table.HeaderCell numeric>Today</Table.HeaderCell>
            <Table.HeaderCell numeric>Fees due</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {[
            { name: 'Harbour Hawks', match: 'Hawks v Swifts', live: true, today: 3, balance: 12.5 },
            {
              name: 'Eastgate United (your club)',
              match: 'Eastgate v Wanderers',
              live: true,
              today: -1,
              balance: -4.5,
              you: true,
            },
            {
              name: 'Northside Rovers',
              match: 'Rovers v Millpond',
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
                  · 3 squads
                </Text>
              </Table.Cell>
              <Table.Cell>
                {o.live ? (
                  <LiveIndicator size="sm" label={`${o.match} · 67′`} />
                ) : (
                  <StatusDot size="sm" tone="positive" label={`${o.match} · FT`} />
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
