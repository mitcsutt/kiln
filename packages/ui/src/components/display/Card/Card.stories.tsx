import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpRightIcon } from '#icons'
import { Button } from '#components/actions/Button'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Badge } from '#components/display/Badge'
import { Tag, TagList } from '#components/display/Tag'
import { DataList } from '#components/display/DataList'
import { Card } from './Card'

const portrait = new URL('../Avatar/portrait.story.svg', import.meta.url).href

const meta = {
  title: 'UI/Display/Card',
  component: Card,
  args: { variant: 'outline', interactive: false },
  argTypes: { padding: { control: 'select', options: [3, 4, 5, 6] } },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Stack style={{ maxWidth: '26rem' }}>
      <Card {...args}>
        <Card.Header>
          <Card.Title>Harbour transit map</Card.Title>
          <Card.Meta>2026</Card.Meta>
        </Card.Header>
        <Card.Description>
          Every bus, ferry and tram line in a coastal city on one sheet, with a large-print edition
          for the stations.
        </Card.Description>
      </Card>
    </Stack>
  ),
}

/** A project is a self-contained object you open — the whole card is the link. */
export const Project: Story = {
  render: () => (
    <Stack style={{ maxWidth: '26rem' }}>
      <Card asChild variant="raised">
        <a href="#sunday-league">
          <Card.Header>
            <Card.Title level={2}>Sunday League</Card.Title>
            <Card.Meta>2026</Card.Meta>
          </Card.Header>
          <Card.Description>
            Eight clubs, fourteen rounds, one live table. Home clubs enter results from the
            touchline, and the table updates for everyone within a second.
          </Card.Description>
          <TagList aria-label="Stack">
            <Tag>React</Tag>
            <Tag>Postgres</Tag>
            <Tag>Offline-first</Tag>
            <Tag>Server-sent events</Tag>
          </TagList>
          <Card.Footer>
            <Card.Meta>Design and build · 6 weeks</Card.Meta>
          </Card.Footer>
        </a>
      </Card>
    </Stack>
  ),
}

/** A match: one fixture with its facts. Not interactive, so no hover. */
export const Match: Story = {
  render: () => (
    <Stack style={{ maxWidth: '24rem' }}>
      <Card variant="outline" padding={4}>
        <Card.Header>
          <Card.Meta>Division two · Round 1</Card.Meta>
          <Badge tone="accent" variant="solid" dot>
            Live
          </Badge>
        </Card.Header>
        <Card.Title>Harbour Hawks v Millpond FC</Card.Title>
        <DataList divided>
          <DataList.Item label="Venue">Harbour Park, pitch 2</DataList.Item>
          <DataList.Item label="Kick-off">Sun 14 June, 10:30</DataList.Item>
          <DataList.Item label="Referee">Ingrid Solberg</DataList.Item>
        </DataList>
      </Card>
    </Stack>
  ),
}

/** A spending envelope — a small object with a status and an action. */
export const Envelope: Story = {
  render: () => (
    <Stack style={{ maxWidth: '22rem' }}>
      <Card variant="plain" padding={4}>
        <Card.Header>
          <Card.Title level={4}>Groceries</Card.Title>
          <Badge tone="positive">On track</Badge>
        </Card.Header>
        <Card.Body>
          <DataList>
            <DataList.Item label="Spent">$612.35</DataList.Item>
            <DataList.Item label="Budget">$800.00</DataList.Item>
            <DataList.Item label="Left">$187.65</DataList.Item>
          </DataList>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="outline" tone="neutral">
            Move money
          </Button>
        </Card.Footer>
      </Card>
    </Stack>
  ),
}

/** Media bleeds to the edges; its corners follow the card's (outer − border). */
export const WithMedia: Story = {
  render: () => (
    <Inline gap={5} align="start">
      <Card style={{ width: '16rem' }}>
        <Card.Media ratio="4/3">
          <img src={portrait} alt="" />
        </Card.Media>
        <Card.Header>
          <Card.Title>About</Card.Title>
        </Card.Header>
        <Card.Description>
          Cartographer in Lisbon. Transit maps, wayfinding and the odd field guide.
        </Card.Description>
        <Card.Footer>
          <Button
            size="sm"
            variant="ghost"
            tone="neutral"
            trailingIcon={<ArrowUpRightIcon />}
            asChild
          >
            <a href="https://example.com/portfolio">Portfolio</a>
          </Button>
        </Card.Footer>
      </Card>
      <Card style={{ width: '16rem' }} variant="raised">
        <Card.Media ratio="1/1" inset>
          <img src={portrait} alt="" />
        </Card.Media>
        <Card.Title>Inset media</Card.Title>
        <Card.Description>Nested radius: outer minus padding.</Card.Description>
      </Card>
    </Inline>
  ),
}

const ENVELOPES = {
  plain: {
    title: 'Groceries',
    edge: 'Fill, no edge',
    copy: '$101.60 left of $680.00 for September. Corner Grocer is most of it.',
  },
  outline: {
    title: 'Transport',
    edge: 'Hairline · default',
    copy: '$50.00 left of $160.00 — one more travel-card top-up this month.',
  },
  raised: {
    title: 'Eating out',
    edge: 'Surface shadow',
    copy: '$112.50 over the $300.00 budget after Trattoria Nove on Sunday.',
  },
} as const

/** `plain` groups inside a busy page; `outline` is the default; `raised` stands on the print offset in Fiesta. */
export const Variants: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: '24rem' }}>
      {(['plain', 'outline', 'raised'] as const).map((variant) => (
        <Card key={variant} variant={variant} interactive padding={4}>
          <Card.Header>
            <Card.Title level={4}>{ENVELOPES[variant].title}</Card.Title>
            <Card.Meta>{ENVELOPES[variant].edge}</Card.Meta>
          </Card.Header>
          <Card.Description>{ENVELOPES[variant].copy}</Card.Description>
        </Card>
      ))}
    </Stack>
  ),
}
