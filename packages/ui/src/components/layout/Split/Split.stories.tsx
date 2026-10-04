import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Container } from '#components/layout/Container'
import { Section } from '#components/layout/Section'
import { AspectRatio } from '#components/layout/AspectRatio'
import { Artwork, Body, Cell, Label, Title } from '#components/layout/_story/StoryKit'
import { Split } from './Split'

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

const work = [
  {
    name: 'Harbour transit map',
    year: '2026',
    role: 'Cartography',
    blurb:
      'Every bus, ferry and tram line in a coastal city on one sheet, with a large-print edition.',
  },
  {
    name: 'Library signage',
    year: '2026',
    role: 'Wayfinding',
    blurb: 'Signs for four floors and a reading garden, set in one typeface at three sizes.',
  },
  {
    name: 'Field guide',
    year: '2025',
    role: 'Book design',
    blurb: 'Coastal birds, printed on stock that survives rain and set for reading outdoors.',
  },
]

/** A studio's recent projects: the heading hangs in the narrow column, the list takes the wide one. */
export const RecentProjects: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Section space={{ base: 7, md: 9 }}>
      <Container>
        <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
          <Stack gap={3}>
            <Title level={2} size="xl">
              Recent projects
            </Title>
            <Body tone="muted">
              Maps, signs and books the studio finished in the last two years.
            </Body>
          </Stack>
          <Stack as="ul" gap={6} dividers>
            {work.map((w) => (
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
        ['Pay period', 'Fortnightly, from Thursday 2 October'],
        ['Income', '$3,725.00 per pay · $7,450.00 per month'],
        ['Savings target', '$600.00 per pay, moved on pay day'],
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
              kind={reverse ? 'chart' : 'pitch'}
              label={reverse ? 'Budget trend chart' : 'Pitch diagram'}
            />
          </AspectRatio>
          <Stack gap={3}>
            <Title level={3} size="lg">
              {reverse ? 'Budget, by pay period' : 'Live standings, every minute'}
            </Title>
            <Body tone="muted">
              {reverse
                ? 'Categories reset when you’re paid, not on the first of the month.'
                : 'Scores arrive from three sources in turn; the first that answers wins.'}
            </Body>
          </Stack>
        </Split>
      ))}
    </Stack>
  ),
}

export const Ratios: Story = {
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
