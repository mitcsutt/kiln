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

/** The bare frame: header, main and footer. Try `navBreakpoint` and `skipLinkLabel`. */
export const Playground: Story = {
  render: (args) => (
    <AppShell {...args}>
      <AppShell.Header>
        <Container width="wide">
          <Wordmark>Field notes</Wordmark>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={6}>
          <Container width="wide">
            <Stack gap={3}>
              <Title level={1} size="xl">
                This week
              </Title>
              <Body tone="muted">Three walks logged, 14.2 km in total.</Body>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container width="wide">
          <Body size="sm" tone="subtle">
            Synced 2 minutes ago
          </Body>
        </Container>
      </AppShell.Footer>
    </AppShell>
  ),
}

const projects = [
  { name: 'Atlas redesign', owner: 'Priya Nair', open: 32, change: '+4' },
  { name: 'Billing migration', owner: 'Tomás Ortega', open: 30, change: '+2' },
  { name: 'Mobile app', owner: 'Hana Kobayashi', open: 29, change: '0' },
  { name: 'Help centre', owner: 'Sam Okafor', open: 27, change: '+6', you: true },
  { name: 'Search revamp', owner: 'Elena Petrova', open: 24, change: '−1' },
  { name: 'Onboarding emails', owner: 'Priya Nair', open: 22, change: '+3' },
  { name: 'Status page', owner: 'Tomás Ortega', open: 19, change: '0' },
  { name: 'Audit log', owner: 'Hana Kobayashi', open: 15, change: '+1' },
]

const trackerNav = ['Projects', 'Releases', 'Tasks', 'People']

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
            <Wordmark>Tracker</Wordmark>
            <Inline as="nav" aria-label="Sections" gap={5} hideBelow="md">
              {trackerNav.map((n, i) => (
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
                  Projects
                </Title>
                <Body tone="muted">Sorted by open tasks. Counts update when a task closes.</Body>
              </Stack>
              <Stack as="ol" gap={4} dividers>
                {projects.map((row, i) => (
                  <li key={row.name}>
                    <Inline justify="between" gap={4} wrap={false}>
                      <Inline gap={4} wrap={false}>
                        <Figure size="sm" tone="muted">
                          {i + 1}
                        </Figure>
                        <Stack gap={0}>
                          <Title level={2} size="md">
                            {row.name}
                            {row.you ? ' (your project)' : ''}
                          </Title>
                          <Body size="sm" tone="subtle">
                            {row.owner}
                          </Body>
                        </Stack>
                      </Inline>
                      <Inline gap={4} wrap={false} align="baseline">
                        <Figure size="sm" tone="muted">
                          {row.change}
                        </Figure>
                        <Figure size="lg" tone={i === 0 ? 'accent' : 'default'}>
                          {row.open}
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
        <Container width="wide">Task counts refresh every five minutes.</Container>
      </AppShell.Footer>
      <AppShell.BottomBar>
        <Container>
          <Inline as="nav" aria-label="Sections" justify="between" gap={3}>
            {trackerNav.map((n, i) => (
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
          <NavLink>Payments</NavLink>
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
          <BottomNav.Item href="#payments" icon={<BillIcon />} label="Payments" badge={2} />
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
            <Wordmark>Brightline Labs</Wordmark>
            <Inline as="nav" aria-label="Primary" gap={5}>
              <NavLink current>Product</NavLink>
              <NavLink>Pricing</NavLink>
              <NavLink>Changelog</NavLink>
            </Inline>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Section space={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={5}>
              <Title level={1} size="display">
                Invoicing for small teams
              </Title>
              <Body size="lg" tone="muted">
                Send invoices, chase late payments and see what each client owes, in one place. Free
                for your first three clients.
              </Body>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container>
          <Inline justify="between" gap={4}>
            <span>© 2026 Brightline Labs</span>
            <span>Set in the house typeface</span>
          </Inline>
        </Container>
      </AppShell.Footer>
    </AppShell>
  ),
}
