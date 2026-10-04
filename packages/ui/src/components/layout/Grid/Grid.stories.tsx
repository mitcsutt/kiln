import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { AspectRatio } from '#components/layout/AspectRatio'
import { Body, Cell, Figure, Label, Title, Bar, Artwork } from '#components/layout/_story/StoryKit'
import { Grid } from './Grid'

const meta = {
  title: 'UI/Layout/Grid',
  component: Grid,
  args: { columns: { base: 2, md: 4 }, gap: 3 },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

const boards = [
  { project: 'Atlas redesign', owner: 'Priya', open: 7 },
  { project: 'Billing migration', owner: 'Tomás', open: 4 },
  { project: 'Mobile app', owner: 'Hana', open: 3 },
  { project: 'Help centre', owner: 'Sam', open: 2 },
]

export const Playground: Story = {
  render: (args) => (
    <Grid {...args}>
      {boards.map((b) => (
        <Cell key={b.project}>
          <strong>{b.project}</strong>
          <Inline gap={2} justify="between">
            <Label>{b.owner}</Label>
            <Figure size="sm">{b.open} open</Figure>
          </Inline>
        </Cell>
      ))}
    </Grid>
  ),
}

const projects = [
  {
    name: 'Release planner',
    kind: 'board' as const,
    blurb: 'Releases, tasks and a live board for a six-person team.',
  },
  {
    name: 'Billing migration',
    kind: 'chart' as const,
    blurb: 'Moving every plan to the new billing provider by March.',
  },
  {
    name: 'Mobile app',
    kind: 'screen' as const,
    blurb: 'Invoices, receipts and payment alerts on the phone.',
  },
  {
    name: 'Help centre',
    kind: 'screen' as const,
    blurb: 'Searchable guides for the forty most common questions.',
  },
]

/**
 * `minItemWidth` fits as many columns as there's room for — no breakpoints. Resize the
 * canvas: four across on a wide screen, one on a phone.
 */
export const AutoFill: Story = {
  args: { minItemWidth: 'xs', columns: undefined, gap: 5, rowGap: 6 },
  render: (args) => (
    <Grid {...args}>
      {projects.map((p) => (
        <Stack key={p.name} gap={3}>
          <AspectRatio ratio="4/3">
            <Artwork kind={p.kind} label={`${p.name} preview`} />
          </AspectRatio>
          <Stack gap={1}>
            <Title level={3} size="md">
              {p.name}
            </Title>
            <Body size="sm" tone="muted">
              {p.blurb}
            </Body>
          </Stack>
        </Stack>
      ))}
    </Grid>
  ),
}

/** `Grid.Item` spans and starts on a 12-column grid. */
export const Spans: Story = {
  args: { columns: 12, gap: 3 },
  render: (args) => (
    <Grid {...args}>
      <Grid.Item span="full">
        <Cell>span full</Cell>
      </Grid.Item>
      <Grid.Item span={{ base: 'full', md: 8 }}>
        <Cell>span full → 8 at md</Cell>
      </Grid.Item>
      <Grid.Item span={{ base: 'full', md: 4 }}>
        <Cell>span full → 4 at md</Cell>
      </Grid.Item>
      <Grid.Item span={{ base: 'full', md: 6 }} start={{ md: 4 }}>
        <Cell>span 6, start 4</Cell>
      </Grid.Item>
      <Grid.Item span={3}>
        <Cell>span 3</Cell>
      </Grid.Item>
      <Grid.Item span={9}>
        <Cell>span 9</Cell>
      </Grid.Item>
    </Grid>
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

/**
 * A dashboard: the month's total is the hero (8 of 12), payments due hang beside it, and
 * clients flow into an auto-fill grid underneath. Not a row of stat cards.
 */
export const Dashboard: Story = {
  parameters: { layout: 'padded' },
  args: { columns: { base: 1, md: 12 }, gap: { base: 6, md: 7 }, rowGap: 7 },
  render: (args) => (
    <Grid {...args}>
      <Grid.Item span={{ base: 'full', md: 8 }}>
        <Stack gap={3}>
          <Label>Invoiced in October</Label>
          <Figure size="xl">$35,396.80</Figure>
          <Body tone="muted">
            $28,940.00 paid, $6,456.80 due. Quarry Lane Bakery is $430.00 over its estimate.
          </Body>
        </Stack>
      </Grid.Item>
      <Grid.Item span={{ base: 'full', md: 4 }}>
        <Stack gap={3} dividers>
          <Title level={3} size="md">
            Due this week
          </Title>
          <Inline justify="between" gap={3} wrap={false}>
            <Body size="sm">Office lease</Body>
            <Figure size="sm">$1,480.00</Figure>
          </Inline>
          <Inline justify="between" gap={3} wrap={false}>
            <Body size="sm">Software</Body>
            <Figure size="sm">$79.00</Figure>
          </Inline>
          <Inline justify="between" gap={3} wrap={false}>
            <Body size="sm">Insurance</Body>
            <Figure size="sm">$96.35</Figure>
          </Inline>
        </Stack>
      </Grid.Item>
      <Grid.Item span="full">
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
              <Body size="sm" tone="subtle">
                of {usd(c.target)}
              </Body>
            </Stack>
          ))}
        </Grid>
      </Grid.Item>
    </Grid>
  ),
}
