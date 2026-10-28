import {
  Amount,
  Card,
  Grid,
  Inline,
  Link,
  Numeral,
  Progress,
  Page,
  Stack,
  Stat,
  StatusDot,
  Text,
} from '@mitcsutt/kiln-ui'
import { Sparkline } from '@mitcsutt/kiln-charts'
import { Link as RouterLink } from '@tanstack/react-router'

import { PageHeader } from '#components/PageHeader'
import { ThemeFit } from '#components/ThemeFit'
import { DEMO_THEMES, type DemoTheme } from '#constants/demoThemes'
import { CURRENT_USER } from '#data/currentUser'
import type { fetchBalance } from '#features/books/data/ledger'
import type { Workshop } from '#features/community/data/workshops'
import type { fetchKilnSummary } from '#features/firings/data/kilns'
import type { Member } from '#features/studio/data/members'

export interface HomeData {
  balance: Awaited<ReturnType<typeof fetchBalance>>
  kilns: Awaited<ReturnType<typeof fetchKilnSummary>>
  members: Member[]
  workshops: Workshop[]
}

const AREAS: { to: string; title: string; theme: DemoTheme; blurb: string }[] = [
  {
    to: '/studio',
    title: 'Studio',
    theme: 'paper',
    blurb: 'Members, the join form and studio settings.',
  },
  {
    to: '/books',
    title: 'Books',
    theme: 'ledger',
    blurb: 'The ledger, budgets and a new invoice.',
  },
  {
    to: '/firings',
    title: 'Kiln room',
    theme: 'flightdeck',
    blurb: 'Live firings and the loading schedule.',
  },
  {
    to: '/community',
    title: 'Community',
    theme: 'riso',
    blurb: 'Workshops, the gallery wall and open studio night.',
  },
]

/** One glance at the whole studio, and a door into each themed area. */
export function Home({ data }: { data: HomeData }) {
  const firing = data.kilns.filter((kiln) => kiln.status === 'firing')
  const places = data.workshops.reduce((sum, w) => sum + w.spaces, 0)
  const booked = data.workshops.reduce((sum, w) => sum + w.booked, 0)
  return (
    <Page>
      <PageHeader
        kicker={`Morning, ${CURRENT_USER.name.split(' ')[0] ?? ''}`}
        title="Slipcast"
        description="A pottery co-op run on Kiln. Every component in the toolkit is somewhere in this app, and each area is built for one of the four themes."
        theme="paper"
      />
      <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        <Stat
          label="Balance"
          value={<Amount value={data.balance.balance} currency="GBP" locale="en-GB" />}
          hint={
            <Sparkline
              data={data.balance.balanceTrend}
              label="Balance over the last twelve weeks"
            />
          }
        />
        <Stat
          label="Firing now"
          value={<Numeral value={firing.length} />}
          hint={firing.map((kiln) => kiln.name).join(', ') || 'Nothing in the kilns'}
        />
        <Stat
          label="Members"
          value={<Numeral value={data.members.length} />}
          hint="Including teachers and volunteers"
        />
        <Stat
          label="Workshop places"
          value={`${booked} of ${places}`}
          hint={<Progress value={booked} max={places} label="Workshop places booked" />}
        />
      </Grid>
      <Grid columns={{ base: 1, md: 2 }} gap={5}>
        {AREAS.map((area) => (
          <Card key={area.to} variant="outline">
            <Card.Header>
              <Card.Title>
                <Link asChild underline="hover" tone="default">
                  <RouterLink to={area.to}>{area.title}</RouterLink>
                </Link>
              </Card.Title>
              <Card.Meta>{DEMO_THEMES[area.theme].goal}</Card.Meta>
            </Card.Header>
            <Card.Body>
              <Stack gap={3}>
                <Text size="sm">{area.blurb}</Text>
                <ThemeFit theme={area.theme} />
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Grid>
      <Stack gap={2}>
        {data.kilns.map((kiln) => (
          <Inline key={kiln.id} gap={2} align="center">
            <StatusDot
              tone={kiln.status === 'firing' ? 'positive' : 'neutral'}
              label={kiln.status}
            />
            <Text size="sm">
              {kiln.name}, {kiln.temperature}°C
            </Text>
          </Inline>
        ))}
      </Stack>
    </Page>
  )
}
