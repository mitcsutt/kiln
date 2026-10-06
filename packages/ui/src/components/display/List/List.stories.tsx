import type { Meta, StoryObj } from '@storybook/react-vite'
import { Amount, Avatar, ChevronRightIcon, List, Media, Stat, Text } from '@mitcsutt/kiln-ui'
import { expect } from 'storybook/test'
import { must } from '#test/must'
import { Stack } from '#components/layout/Stack'
import { Badge } from '#components/display/Badge'
import { Tag } from '#components/display/Tag'
import { Numeral } from '#components/typography/Numeral'
import { LiveIndicator } from '#components/feedback/LiveIndicator'
import { StatusDot } from '#components/feedback/StatusDot'

const portrait = new URL('../Avatar/portrait.story.svg', import.meta.url).href

const meta = {
  title: 'UI/Display/List',
  component: List,
  args: { divided: true, density: 'regular' },
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

/** A short reading list. Try `divided`, `density` and `as` in the controls. */
export const Playground: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '28rem' }}>
      <List {...args} aria-label="Reading list">
        {[
          { title: 'The shape of cities', author: 'Ines Duarte', pages: 312 },
          { title: 'Tidal notes', author: 'Rowan Achebe', pages: 188 },
          { title: 'A field guide to moss', author: 'Hana Sato', pages: 240 },
        ].map((book, i) => (
          <List.Item key={book.title}>
            <List.Leading>{i + 1}</List.Leading>
            <List.Content>
              {book.title}
              <List.Description>{book.author}</List.Description>
            </List.Content>
            <List.Trailing>{book.pages} pages</List.Trailing>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

const LEADERBOARD = [
  {
    name: 'Priya Nair',
    projects: 'Atlas redesign, Help centre, Design tokens',
    reviews: 58,
    active: 2,
  },
  {
    name: 'Tomás Ortega',
    projects: 'Billing migration, Invoices API, Audit log',
    reviews: 51,
    active: 1,
  },
  {
    name: 'Hana Kobayashi',
    projects: 'Mobile app, Onboarding, Push notifications',
    reviews: 47,
    active: 2,
    you: true,
  },
  { name: 'Sam Okafor', projects: 'Help centre, Search, Status page', reviews: 44, active: 1 },
  { name: 'Elena Petrova', projects: 'Atlas redesign, Reports, Exports', reviews: 39, active: 1 },
  {
    name: 'Felix Moreau',
    projects: 'Invoices API, Webhooks, Billing migration',
    reviews: 33,
    active: 0,
  },
  { name: 'Aisha Rahman', projects: 'Reports, Onboarding, Audit log', reviews: 31, active: 0 },
  { name: 'Jonas Lindqvist', projects: 'Search, Mobile app, Settings', reviews: 24, active: 0 },
]

/** A review leaderboard: rank, member, projects, reviews. Your row is highlighted; each row links. */
export const Leaderboard: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '34rem' }}>
      <List {...args} as="ol" aria-label="Code review leaderboard">
        {LEADERBOARD.map((o, i) => (
          <List.Item key={o.name} asChild highlighted={o.you}>
            <a href={`#member-${String(i + 1)}`} aria-current={o.you ? 'true' : undefined}>
              <List.Leading>{i + 1}</List.Leading>
              <Avatar name={o.name} src={o.you ? portrait : undefined} size="sm" alt="" />
              <List.Content>
                {o.you ? `${o.name} (you)` : o.name}
                <List.Description>{o.projects}</List.Description>
              </List.Content>
              <List.Trailing>
                {o.active === 0 ? <Badge variant="outline">Away</Badge> : null}
                {o.reviews}
              </List.Trailing>
            </a>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

/** Recent invoices as a compact, static list. */
export const RecentInvoices: Story = {
  args: { density: 'compact' },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <List {...args} aria-label="Recent invoices">
        {[
          {
            client: 'Northwind Studio',
            when: 'Today',
            status: 'Paid',
            color: 2 as const,
            amount: 4200,
          },
          {
            client: 'Orchard & Co',
            when: 'Yesterday',
            status: 'Credit note',
            color: 4 as const,
            amount: -350,
          },
          {
            client: 'Brightline Labs',
            when: 'Thu 25 Sep',
            status: 'Sent',
            color: 1 as const,
            amount: 8650,
          },
          {
            client: 'Harbourview Clinic',
            when: 'Tue 23 Sep',
            status: 'Draft',
            color: 3 as const,
            amount: 186.45,
          },
        ].map((t) => (
          <List.Item key={t.client}>
            <List.Content>
              {t.client}
              <List.Description>{t.when}</List.Description>
            </List.Content>
            <Tag color={t.color}>{t.status}</Tag>
            <List.Trailing>
              <Amount value={t.amount} showSign tone={t.amount > 0 ? 'positive' : undefined} />
            </List.Trailing>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

/** Navigation-style list: the open item is `selected`. */
export const Selected: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '22rem' }}>
      <List {...args} aria-label="Projects">
        {[
          { name: 'Atlas redesign', open: 7 },
          { name: 'Billing migration', open: 12 },
          { name: 'Mobile app', open: 4 },
          { name: 'Help centre', open: 2 },
        ].map((p, i) => (
          <List.Item key={p.name} asChild selected={i === 1}>
            <a href={`#project-${String(i)}`} aria-current={i === 1 ? 'page' : undefined}>
              <List.Content>{p.name}</List.Content>
              <List.Trailing>{p.open} open</List.Trailing>
            </a>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

/**
 * A highlighted row re-points the colour roles for everything inside it, so muted text,
 * tone-coloured figures and live/status markers stay legible on the highlight — check
 * Fiesta night, where the row is gold.
 */
export const HighlightedWithTones: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '34rem' }}>
      <List {...args} aria-label="Deploys running now">
        {[
          { name: 'Priya Nair', target: 'Atlas redesign · production', tasks: 3, live: true },
          {
            name: 'Hana Kobayashi',
            target: 'Mobile app · staging',
            tasks: -1,
            live: true,
            you: true,
          },
          { name: 'Sam Okafor', target: 'Help centre · production', tasks: 0, live: false },
        ].map((o) => (
          <List.Item key={o.name} highlighted={o.you}>
            <List.Content>
              {o.you ? `${o.name} (you)` : o.name}
              <List.Description>
                {o.live ? (
                  <LiveIndicator size="sm" label={`${o.target} · 4 min`} />
                ) : (
                  <StatusDot tone="positive" size="sm" label={`${o.target} · done`} />
                )}
              </List.Description>
            </List.Content>
            <List.Trailing>
              <Numeral value={o.tasks} signDisplay="exceptZero" tone="auto" suffix=" tasks" />
            </List.Trailing>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

const TRIPS = [
  { who: 'Ines Varga', route: 'Harbour Square to Kelso Bay', when: 'Today, 07:10', fare: 4.2 },
  { who: 'Tomasz Okoro', route: 'Old Quay to Northpoint', when: 'Today, 08:45', fare: 2.8 },
  { who: 'Priya Halvorsen', route: 'Marram Point to Harbour Square', when: 'Yesterday', fare: 6.5 },
]

/**
 * `density="compact"` tightens rows; `divided={false}` drops the rules; `as="ol"` makes it
 * ordered.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <List>
        {TRIPS.map((trip) => (
          <List.Item key={trip.who}>
            <List.Leading>
              <Avatar name={trip.who} size="sm" />
            </List.Leading>
            <List.Content>
              <Text weight="medium">{trip.route}</Text>
              <List.Description>
                {trip.who}, {trip.when}
              </List.Description>
            </List.Content>
            <List.Trailing>
              <Amount value={trip.fare} currency="GBP" locale="en-GB" />
            </List.Trailing>
          </List.Item>
        ))}
      </List>
    )
  },
}

const LINES = ['Coastal line', 'Harbour loop', 'Market shuttle']

/**
 * `interactive` gives a row a hover fill, and `asChild` lets the row be a link, so the whole row
 * is one target. `selected` marks the current row and `highlighted` marks "you".
 */
export const Interactive: Story = {
  name: 'Rows that act',
  tags: ['docs'],
  render: function Interactive() {
    return (
      <List density="compact">
        {LINES.map((line, index) => (
          <List.Item key={line} interactive asChild selected={index === 0}>
            <a href={`#${line.toLowerCase().replace(/ /g, '-')}`}>
              <List.Content>
                <Text weight="medium">{line}</Text>
              </List.Content>
              <List.Trailing>
                <ChevronRightIcon />
              </List.Trailing>
            </a>
          </List.Item>
        ))}
      </List>
    )
  },
}

const flag =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20"><rect width="30" height="20" fill="#2f5d8a"/><rect y="7" width="30" height="6" fill="#f2f0ea"/></svg>',
  )

/**
 * Block components in the slots: a sized `Media` at the start and a small `Stat` at the end,
 * whose label and value line up on the row's end edge.
 */
export const BlockContentInSlots: Story = {
  render: () => (
    <List>
      {[
        { name: 'Kelso Bay', points: 9 },
        { name: 'North Point', points: 6 },
      ].map((row) => (
        <List.Item key={row.name}>
          <List.Leading>
            <Media size="sm" ratio="3/2" src={flag} alt="" />
          </List.Leading>
          <List.Content>{row.name}</List.Content>
          <List.Trailing>
            <Stat size="sm" label="Pts" value={row.points} />
          </List.Trailing>
        </List.Item>
      ))}
    </List>
  ),
  play: async ({ canvas }) => {
    const label = canvas.getAllByText('Pts')[0]
    const value = canvas.getByText('9')
    const end = (el?: HTMLElement) => must(el, 'a Stat part').getBoundingClientRect().right
    await expect(Math.abs(end(label) - end(value))).toBeLessThan(2)
  },
}
