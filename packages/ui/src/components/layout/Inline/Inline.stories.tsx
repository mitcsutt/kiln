import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Body, Cell, Figure, Label, Title } from '#components/layout/_story/StoryKit'
import { Inline } from './Inline'

const meta = {
  title: 'UI/Layout/Inline',
  component: Inline,
  args: { gap: 3, justify: 'start', align: 'center', wrap: true },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Inline>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Inline {...args}>
      {[
        'Atlas redesign',
        'Billing migration',
        'Mobile app',
        'Help centre',
        'Search revamp',
        'Status page',
      ].map((t) => (
        <Cell key={t}>{t}</Cell>
      ))}
    </Inline>
  ),
}

/** A header row: title on one side, actions on the other, wrapping on narrow screens. */
export const HeaderRow: Story = {
  render: () => (
    <Inline justify="between" gap={4} rowGap={3}>
      <Title level={2}>Invoices</Title>
      <Inline gap={2}>
        <Button variant="outline" tone="neutral">
          Export CSV
        </Button>
        <Button>New invoice</Button>
      </Inline>
    </Inline>
  ),
}

/** Label and value on one line; `justify` can change per breakpoint. */
export const Responsive: Story = {
  render: () => (
    <Stack gap={3}>
      <Inline justify={{ base: 'start', md: 'between' }} gap={3}>
        <Body>Atlas redesign</Body>
        <Label>Sprint 3 · 8 tasks closed</Label>
      </Inline>
      <Inline justify={{ base: 'start', md: 'between' }} gap={3}>
        <Body>Outstanding this month</Body>
        <Figure>$1,284.60</Figure>
      </Inline>
    </Stack>
  ),
}
