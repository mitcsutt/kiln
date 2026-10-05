import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Heading, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { Body, Cell, Figure, Label, Title } from '#components/layout/_story/StoryKit'

const meta = {
  title: 'UI/Layout/Stack',
  component: Stack,
  args: { gap: 3, dividers: false, align: 'stretch' },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Stack {...args}>
      <Cell>Starter</Cell>
      <Cell>Team</Cell>
      <Cell>Business</Cell>
    </Stack>
  ),
}

/** Rules between items instead of boxes around them. The rule sits in the middle of the gap. */
export const DividedList: Story = {
  render: () => (
    <Stack as="ul" gap={4} dividers>
      {[
        ['Design', '$2,340.00'],
        ['Development', '$612.85'],
        ['Hosting', '$214.30'],
        ['Support', '$186.00'],
      ].map(([k, v]) => (
        <li key={k}>
          <Inline justify="between" gap={3} wrap={false}>
            <Body>{k}</Body>
            <Figure>{v}</Figure>
          </Inline>
        </li>
      ))}
    </Stack>
  ),
}

/** Gap is responsive: tight on phones, looser from `md`. Nest stacks for hierarchy. */
export const Responsive: Story = {
  render: () => (
    <Stack gap={{ base: 5, md: 7 }}>
      <Stack gap={2}>
        <Label>Release 2.4</Label>
        <Title level={2}>Billing migration lands on Thursday</Title>
      </Stack>
      <Stack gap={2}>
        <Label>Release 2.5</Label>
        <Title level={2}>Mobile app enters beta a week early</Title>
      </Stack>
    </Stack>
  ),
}

/**
 * `align` sets the cross-axis alignment (`stretch` by default, so children fill the width). Use
 * `align="start"` when a child like a button should keep its own width.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4} align="start">
        <Heading level={3} size="xl">
          Night bus N14
        </Heading>
        <Text tone="muted">Every 20 minutes from Harbour Square until 04:40.</Text>
        <Button size="sm">Save route</Button>
      </Stack>
    )
  },
}

const STOPS = [
  { name: 'Harbour Square', time: '23:10' },
  { name: 'Northpoint Library', time: '23:18' },
  { name: 'Kelso Bay Pier', time: '23:31' },
]

/**
 * `dividers` draws a hairline between every child, centred in the gap. It's usually better than a
 * card per item: lists, settings rows and timelines read as one document.
 */
export const Dividers: Story = {
  name: 'Rules between items',
  tags: ['docs'],
  render: function Dividers() {
    return (
      <Stack gap={{ base: 3, md: 4 }} dividers>
        {STOPS.map((stop) => (
          <Inline key={stop.name} justify="between">
            <Text>{stop.name}</Text>
            <Text numeric tone="muted">
              {stop.time}
            </Text>
          </Inline>
        ))}
      </Stack>
    )
  },
}
