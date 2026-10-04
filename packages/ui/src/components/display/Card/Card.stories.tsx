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
          <Card.Title>Atlas redesign</Card.Title>
          <Card.Meta>Due 14 Nov</Card.Meta>
        </Card.Header>
        <Card.Description>
          A new navigation, settings and billing area for the web app, with a high-contrast mode
          shipped alongside.
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
        <a href="#billing-migration">
          <Card.Header>
            <Card.Title level={2}>Billing migration</Card.Title>
            <Card.Meta>Q4</Card.Meta>
          </Card.Header>
          <Card.Description>
            Twelve hundred accounts moved to the new invoicing service without downtime. Finance
            sees every invoice as it is issued, and clients get a receipt within a second.
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

/** A release: one deploy with its facts. Not interactive, so no hover. */
export const Release: Story = {
  render: () => (
    <Stack style={{ maxWidth: '24rem' }}>
      <Card variant="outline" padding={4}>
        <Card.Header>
          <Card.Meta>Atlas redesign · Release 2.4</Card.Meta>
          <Badge tone="accent" variant="solid" dot>
            Live
          </Badge>
        </Card.Header>
        <Card.Title>Release 2.4 to production</Card.Title>
        <DataList divided>
          <DataList.Item label="Region">Sydney, ap-southeast-2</DataList.Item>
          <DataList.Item label="Started">Thu 14 Nov, 10:30</DataList.Item>
          <DataList.Item label="Owner">Elena Petrova</DataList.Item>
        </DataList>
      </Card>
    </Stack>
  ),
}

/** A plan summary — a small object with a status and an action. */
export const Plan: Story = {
  render: () => (
    <Stack style={{ maxWidth: '22rem' }}>
      <Card variant="plain" padding={4}>
        <Card.Header>
          <Card.Title level={4}>Team plan</Card.Title>
          <Badge tone="positive">On track</Badge>
        </Card.Header>
        <Card.Body>
          <DataList>
            <DataList.Item label="Billed so far">$612.35</DataList.Item>
            <DataList.Item label="Monthly cap">$800.00</DataList.Item>
            <DataList.Item label="Remaining">$187.65</DataList.Item>
          </DataList>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="outline" tone="neutral">
            Change plan
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
          <Card.Title>Priya Nair</Card.Title>
        </Card.Header>
        <Card.Description>
          Design lead in Lisbon. Owns the design system, onboarding and the help centre.
        </Card.Description>
        <Card.Footer>
          <Button
            size="sm"
            variant="ghost"
            tone="neutral"
            trailingIcon={<ArrowUpRightIcon />}
            asChild
          >
            <a href="https://example.com">Website</a>
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

const USAGE = {
  plain: {
    title: 'Storage',
    edge: 'Fill, no edge',
    copy: '101.6 GB left of 680 GB this month. Design files are most of it.',
  },
  outline: {
    title: 'Seats',
    edge: 'Hairline · default',
    copy: '2 of 12 seats free — one more invite before the Team plan is full.',
  },
  raised: {
    title: 'API requests',
    edge: 'Surface shadow',
    copy: '12,500 over the 300,000 monthly quota after the import on Sunday.',
  },
} as const

/** `plain` groups inside a busy page; `outline` is the default; `raised` stands on the print offset in Fiesta. */
export const Variants: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: '24rem' }}>
      {(['plain', 'outline', 'raised'] as const).map((variant) => (
        <Card key={variant} variant={variant} interactive padding={4}>
          <Card.Header>
            <Card.Title level={4}>{USAGE[variant].title}</Card.Title>
            <Card.Meta>{USAGE[variant].edge}</Card.Meta>
          </Card.Header>
          <Card.Description>{USAGE[variant].copy}</Card.Description>
        </Card>
      ))}
    </Stack>
  ),
}
