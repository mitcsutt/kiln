import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Avatar } from '#components/display/Avatar'
import { Badge } from '#components/display/Badge'
import { Tag } from '#components/display/Tag'
import { Amount } from '#components/typography/Amount'
import { Numeral } from '#components/typography/Numeral'
import { LiveIndicator } from '#components/feedback/LiveIndicator'
import { StatusDot } from '#components/feedback/StatusDot'
import { List } from './List'

const portrait = new URL('../Avatar/portrait.story.svg', import.meta.url).href

const meta = {
  title: 'UI/Display/List',
  component: List,
  args: { divided: true, density: 'regular' },
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

const LEADERBOARD = [
  { name: 'Noor Nguyen', routes: 'Coast path, Ridge loop, Quarry steps', points: 58, active: 2 },
  { name: 'Kofi Grant', routes: 'Harbour run, Mill lane, Old town', points: 51, active: 1 },
  {
    name: 'Ada Okafor',
    routes: 'Ridge loop, River walk, Lighthouse',
    points: 47,
    active: 2,
    you: true,
  },
  { name: 'Ingrid Tran', routes: 'Park circuit, Coast path, Bridge', points: 44, active: 1 },
  { name: 'Mei Walker', routes: 'Old town, Quarry steps, Canal', points: 39, active: 1 },
  { name: 'Theo Oduya', routes: 'Harbour run, Bridge, Hill fort', points: 33, active: 0 },
  { name: 'Amara Raman', routes: 'Canal, Lighthouse, Mill lane', points: 31, active: 0 },
  { name: 'Diego Kelly', routes: 'River walk, Park circuit, Heath', points: 24, active: 0 },
]

/** A club leaderboard: rank, runner, routes, points. Your row is highlighted; each row links. */
export const Leaderboard: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '34rem' }}>
      <List {...args} as="ol" aria-label="Running club leaderboard">
        {LEADERBOARD.map((o, i) => (
          <List.Item key={o.name} asChild highlighted={o.you}>
            <a href={`#runner-${String(i + 1)}`} aria-current={o.you ? 'true' : undefined}>
              <List.Leading>{i + 1}</List.Leading>
              <Avatar name={o.name} src={o.you ? portrait : undefined} size="sm" alt="" />
              <List.Content>
                {o.you ? `${o.name} (you)` : o.name}
                <List.Description>{o.routes}</List.Description>
              </List.Content>
              <List.Trailing>
                {o.active === 0 ? <Badge variant="outline">Resting</Badge> : null}
                {o.points}
              </List.Trailing>
            </a>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}

/** Recent transactions as a compact, static list. */
export const Transactions: Story = {
  args: { density: 'compact' },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <List {...args} aria-label="Recent transactions">
        {[
          {
            payee: 'Corner Grocer',
            when: 'Today',
            cat: 'Groceries',
            color: 1 as const,
            amount: -84.2,
          },
          {
            payee: 'Metro Transit top-up',
            when: 'Yesterday',
            cat: 'Transport',
            color: 4 as const,
            amount: -50,
          },
          {
            payee: 'Salary — Harbour Labs',
            when: 'Thu 25 Sep',
            cat: 'Income',
            color: 2 as const,
            amount: 3725,
          },
          {
            payee: 'City Power',
            when: 'Tue 23 Sep',
            cat: 'Utilities',
            color: 3 as const,
            amount: -186.45,
          },
        ].map((t) => (
          <List.Item key={t.payee}>
            <List.Content>
              {t.payee}
              <List.Description>{t.when}</List.Description>
            </List.Content>
            <Tag color={t.color}>{t.cat}</Tag>
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
        {['Harbour transit map', 'Library signage', 'Field guide', 'Annual report'].map((p, i) => (
          <List.Item key={p} asChild selected={i === 1}>
            <a href={`#project-${String(i)}`} aria-current={i === 1 ? 'page' : undefined}>
              <List.Content>{p}</List.Content>
              <List.Trailing>{2026 - Math.floor(i / 2)}</List.Trailing>
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
      <List {...args} aria-label="Runners out now">
        {[
          { name: 'Noor Nguyen', team: 'Coast path · 8.2 km', pts: 3, live: true },
          { name: 'Ada Okafor', team: 'Ridge loop · 5.4 km', pts: -1, live: true, you: true },
          { name: 'Ingrid Tran', team: 'Park circuit · 10 km', pts: 0, live: false },
        ].map((o) => (
          <List.Item key={o.name} highlighted={o.you}>
            <List.Content>
              {o.you ? `${o.name} (you)` : o.name}
              <List.Description>
                {o.live ? (
                  <LiveIndicator size="sm" label={`${o.team} · 41 min`} />
                ) : (
                  <StatusDot tone="positive" size="sm" label={`${o.team} · finished`} />
                )}
              </List.Description>
            </List.Content>
            <List.Trailing>
              <Numeral value={o.pts} signDisplay="exceptZero" tone="auto" suffix=" today" />
            </List.Trailing>
          </List.Item>
        ))}
      </List>
    </Stack>
  ),
}
