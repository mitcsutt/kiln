import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Container } from '#components/layout/Container'
import { Section } from '#components/layout/Section'
import { AspectRatio } from '#components/layout/AspectRatio'
import { Artwork, Body, Cell, Label, Title } from '#components/layout/_story/StoryKit'

const meta = {
  title: 'UI/Layout/Split',
  component: Split,
  args: {
    ratio: '5/7',
    collapseBelow: 'md',
    gap: { base: 5, md: 7 },
    reverse: false,
    children: [<Cell key="a">First · 5</Cell>, <Cell key="b">Second · 7</Cell>],
  },
  argTypes: { as: { control: false }, children: { control: false } },
} satisfies Meta<typeof Split>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const releases = [
  {
    name: 'Recurring invoices',
    year: '2026',
    role: 'Billing',
    blurb: 'Bill a client on a schedule, with a reminder before each invoice goes out.',
  },
  {
    name: 'Client portal',
    year: '2026',
    role: 'Product',
    blurb: 'Clients see every invoice, pay by card and download receipts in one place.',
  },
  {
    name: 'Mobile app',
    year: '2025',
    role: 'Mobile',
    blurb: 'Send an invoice from your phone and get a notification when it is paid.',
  },
]

/** A product's recent releases: the heading hangs in the narrow column, the list takes the wide one. */
export const RecentReleases: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Section space={{ base: 7, md: 9 }}>
      <Container>
        <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
          <Stack gap={3}>
            <Title level={2} size="xl">
              Recent releases
            </Title>
            <Body tone="muted">What the team shipped in the last two years.</Body>
          </Stack>
          <Stack as="ul" gap={6} dividers>
            {releases.map((w) => (
              <li key={w.name}>
                <Stack gap={2}>
                  <Inline justify="between" gap={3} align="baseline">
                    <Title level={3} size="lg">
                      {w.name}
                    </Title>
                    <Label>{w.year}</Label>
                  </Inline>
                  <Body tone="muted">{w.blurb}</Body>
                </Stack>
              </li>
            ))}
          </Stack>
        </Split>
      </Container>
    </Section>
  ),
}

/** A hang column for labels (`1/3`), the ledger way: key on the left, value on the right. */
export const HangColumn: Story = {
  render: () => (
    <Stack gap={4} dividers>
      {[
        ['Billing cycle', 'Monthly, from Thursday 2 October'],
        ['Plan', 'Team · $49.00 per seat per month'],
        ['Seats', '12 of 15 in use, billed on the first'],
      ].map(([k, v]) => (
        <Split key={k} ratio="1/3" collapseBelow="sm" gap={{ base: 1, sm: 5 }} align="baseline">
          <Label>{k}</Label>
          <Body>{v}</Body>
        </Split>
      ))}
    </Stack>
  ),
}

/** `reverse` swaps sides visually when split; stacked (and DOM) order stays media-first. */
export const MediaAndCopy: Story = {
  render: () => (
    <Stack gap={8}>
      {[false, true].map((reverse) => (
        <Split
          key={String(reverse)}
          ratio="7/5"
          gap={{ base: 5, md: 7 }}
          align="center"
          reverse={reverse}
        >
          <AspectRatio ratio="4/3">
            <Artwork
              kind={reverse ? 'chart' : 'board'}
              label={reverse ? 'Revenue trend chart' : 'Task board'}
            />
          </AspectRatio>
          <Stack gap={3}>
            <Title level={3} size="lg">
              {reverse ? 'Revenue, by billing cycle' : 'A live task board, every minute'}
            </Title>
            <Body tone="muted">
              {reverse
                ? 'Plans renew on each client’s billing date, not on the first of the month.'
                : 'Updates arrive from three sources in turn; the first that answers wins.'}
            </Body>
          </Stack>
        </Split>
      ))}
    </Stack>
  ),
}

export const EveryRatio: Story = {
  render: () => (
    <Stack gap={3}>
      {(['1/1', '1/2', '2/1', '1/3', '3/1', '5/7', '7/5', '4/8', '8/4'] as const).map((ratio) => {
        const [a, b] = ratio.split('/')
        return (
          <Split key={ratio} ratio={ratio} gap={3} collapseBelow="sm">
            <Cell>{a}</Cell>
            <Cell>{b}</Cell>
          </Split>
        )
      })}
    </Stack>
  ),
}

const CHANGES = [
  'Route 7 now stops at Ferry Lane on weekdays.',
  'Night buses run every 15 minutes on Fridays.',
  'Kelso Bay Pier reopens on 3 November.',
]

/**
 * A heading and a list of changes in a 5/7 split, stacked on a phone.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
        <Heading level={3} size="2xl">
          Timetable changes this month
        </Heading>
        <Stack gap={4} dividers>
          {CHANGES.map((change) => (
            <Text key={change}>{change}</Text>
          ))}
        </Stack>
      </Split>
    )
  },
}

/**
 * `ratio` is one of `1/1`, `1/2`, `2/1`, `1/3`, `3/1`, `5/7`, `7/5`, `4/8` or `8/4`. `5/7` is the
 * default. `reverse` swaps the visual order without changing the reading order.
 */
export const Ratios: Story = {
  tags: ['docs'],
  render: function Ratios() {
    return (
      <Stack gap={4}>
        {(['1/1', '1/2', '1/3', '5/7'] as const).map((ratio) => (
          <Split key={ratio} ratio={ratio} gap={3} collapseBelow="sm">
            <Box padding={3} surface="sunken" radius="field">
              <Text size="sm">{ratio}</Text>
            </Box>
            <Box padding={3} border radius="field">
              <Text size="sm" tone="muted">
                The wider side
              </Text>
            </Box>
          </Split>
        ))}
      </Stack>
    )
  },
}
