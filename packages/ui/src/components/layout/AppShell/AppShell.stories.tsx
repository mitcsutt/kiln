import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Container } from '#components/layout/Container'
import { Section } from '#components/layout/Section'
import { Split } from '#components/layout/Split'
import { Grid } from '#components/layout/Grid'
import { Divider } from '#components/layout/Divider'
import { Button } from '#components/actions/Button'
import { BottomNav } from '#components/navigation/BottomNav'
import { createIcon, SearchIcon } from '#icons'
import {
  Bar,
  Body,
  Figure,
  Label,
  NavLink,
  Title,
  Wordmark,
} from '#components/layout/_story/StoryKit'
import { AppShell } from './AppShell'

const meta = {
  title: 'UI/Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { skipLinkLabel: 'Skip to content' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const table = [
  { club: 'Harbour Hawks', played: 14, pts: 32, form: '+4' },
  { club: 'Northside Rovers', played: 14, pts: 30, form: '+2' },
  { club: 'Riverside Athletic', played: 13, pts: 29, form: '0' },
  { club: 'Eastgate United', played: 14, pts: 27, form: '+6', you: true },
  { club: 'Millpond FC', played: 14, pts: 24, form: '−1' },
  { club: 'Quarry Lane', played: 13, pts: 22, form: '+3' },
  { club: 'Old Town Wanderers', played: 14, pts: 19, form: '0' },
  { club: 'Westbank Swifts', played: 14, pts: 15, form: '+1' },
]

const leagueNav = ['Table', 'Fixtures', 'Results', 'Clubs']

/**
 * A header-and-bottom-bar frame: sticky header with the section links on wide screens,
 * a bottom bar with the same links on phones. No sidebar, so the hand-over happens at
 * `navBreakpoint="md"` — the header links use `hideBelow="md"` to match.
 */
export const HeaderAndBottomBar: Story = {
  args: { navBreakpoint: 'md' },
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header>
        <Container width="wide">
          <Inline justify="between" gap={5}>
            <Wordmark>Sunday League</Wordmark>
            <Inline as="nav" aria-label="Sections" gap={5} hideBelow="md">
              {leagueNav.map((n, i) => (
                <NavLink key={n} current={i === 0}>
                  {n}
                </NavLink>
              ))}
            </Inline>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={{ base: 6, md: 8 }}>
          <Container width="wide">
            <Split ratio="1/3" collapseBelow="lg" gap={{ base: 5, lg: 8 }}>
              <Stack gap={3}>
                <Title level={1} size="xl">
                  Table
                </Title>
                <Body tone="muted">After round 14. Points update when a result is confirmed.</Body>
              </Stack>
              <Stack as="ol" gap={4} dividers>
                {table.map((row, i) => (
                  <li key={row.club}>
                    <Inline justify="between" gap={4} wrap={false}>
                      <Inline gap={4} wrap={false}>
                        <Figure size="sm" tone="muted">
                          {i + 1}
                        </Figure>
                        <Stack gap={0}>
                          <Title level={2} size="md">
                            {row.club}
                            {row.you ? ' (your club)' : ''}
                          </Title>
                          <Body size="sm" tone="subtle">
                            {row.played} played
                          </Body>
                        </Stack>
                      </Inline>
                      <Inline gap={4} wrap={false} align="baseline">
                        <Figure size="sm" tone="muted">
                          {row.form}
                        </Figure>
                        <Figure size="lg" tone={i === 0 ? 'accent' : 'default'}>
                          {row.pts}
                        </Figure>
                      </Inline>
                    </Inline>
                  </li>
                ))}
              </Stack>
            </Split>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container width="wide">
          Results are entered by each home club within an hour of full time.
        </Container>
      </AppShell.Footer>
      <AppShell.BottomBar>
        <Container>
          <Inline as="nav" aria-label="Sections" justify="between" gap={3}>
            {leagueNav.map((n, i) => (
              <NavLink key={n} current={i === 0}>
                {n}
              </NavLink>
            ))}
          </Inline>
        </Container>
      </AppShell.BottomBar>
    </AppShell>
  ),
}

const clients = [
  { name: 'Harbour Labs', invoiced: 12400, target: 12400 },
  { name: 'Atlas Freight', invoiced: 8615.5, target: 10000 },
  { name: 'Quarry Lane Bakery', invoiced: 2430, target: 2000 },
  { name: 'Northside Clinic', invoiced: 6142.3, target: 9000 },
  { name: 'Millpond Print Works', invoiced: 3860, target: 5200 },
  { name: 'Eastgate Council', invoiced: 1949, target: 4500 },
]
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

/* Story-only glyphs on the library's 20px grid. */
const OverviewIcon = createIcon(
  'OverviewIcon',
  <path d="M3.5 16.5h13M5.5 13.5v-4M10 13.5v-8M14.5 13.5v-6" />,
)
const ListIcon = createIcon(
  'ListIcon',
  <path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9M3.5 5.5h1M3.5 10h1M3.5 14.5h1" />,
)
const BillIcon = createIcon(
  'BillIcon',
  <path d="M5.5 3.5h9v13l-2.25-1.5L10 16.5l-2.25-1.5-2.25 1.5zM8 7.5h4M8 10.5h4" />,
)

/**
 * A dashboard frame: a sidebar from `lg` up, a bottom tab bar below it, the month's total
 * as the hero. `navBreakpoint` defaults to `lg`, so the sidebar and the bottom bar swap at
 * the same width; the `BottomNav` inside says `hideAbove="lg"` to match.
 */
export const DashboardWithSidebar: Story = {
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header>
        <Container width="full">
          <Inline justify="between" gap={4}>
            <Wordmark>Invoicing</Wordmark>
            <Button size="sm">New invoice</Button>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Invoicing sections">
        <Stack as="nav" gap={3} align="start">
          <NavLink current>Overview</NavLink>
          <NavLink>Invoices</NavLink>
          <NavLink>Clients</NavLink>
          <NavLink>Expenses</NavLink>
          <Divider decorative spacing={2} />
          <NavLink>Settings</NavLink>
        </Stack>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Section space={{ base: 6, md: 7 }}>
          <Container width="full">
            <Stack gap={7}>
              <Stack gap={3}>
                <Label>Invoiced in October</Label>
                <Figure size="xl">$35,396.80</Figure>
                <Body tone="muted">
                  $28,940.00 paid, $6,456.80 due. Quarry Lane Bakery is $430.00 over its estimate.
                </Body>
              </Stack>
              <Grid minItemWidth="xs" gap={5} rowGap={6}>
                {clients.map((c) => (
                  <Stack key={c.name} gap={2}>
                    <Inline justify="between" gap={2} wrap={false}>
                      <Body size="sm">{c.name}</Body>
                      <Figure size="sm" tone={c.invoiced > c.target ? 'critical' : 'default'}>
                        {usd(c.invoiced)}
                      </Figure>
                    </Inline>
                    <Bar
                      value={c.invoiced}
                      max={c.target}
                      tone={c.invoiced > c.target ? 'critical' : 'accent'}
                    />
                  </Stack>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container width="full">Figures in USD · Last synced 9:42 am</Container>
      </AppShell.Footer>
      <AppShell.BottomBar>
        <BottomNav label="Invoicing sections" position="static" hideAbove="lg">
          <BottomNav.Item href="#overview" icon={<OverviewIcon />} label="Overview" active />
          <BottomNav.Item href="#invoices" icon={<ListIcon />} label="Invoices" />
          <BottomNav.Item href="#expenses" icon={<BillIcon />} label="Expenses" badge={2} />
          <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
        </BottomNav>
      </AppShell.BottomBar>
    </AppShell>
  ),
}

/** A site frame: a quiet header, content-width sections, a footer. No sidebar, no bottom bar. */
export const Site: Story = {
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header>
        <Container>
          <Inline justify="between" gap={5}>
            <Wordmark>Fieldwork</Wordmark>
            <Inline as="nav" aria-label="Primary" gap={5}>
              <NavLink current>Studio</NavLink>
              <NavLink>Journal</NavLink>
              <NavLink>Contact</NavLink>
            </Inline>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={5}>
              <Title level={1} size="display">
                Maps, signage and wayfinding for public places
              </Title>
              <Body size="lg" tone="muted">
                A four-person studio. This year: a transit map for a coastal city and the signs for
                a new library.
              </Body>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container>
          <Inline justify="between" gap={4}>
            <span>© 2026 Fieldwork</span>
            <span>Set in the house typeface</span>
          </Inline>
        </Container>
      </AppShell.Footer>
    </AppShell>
  ),
}
