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
        'Harbour Hawks',
        'Millpond FC',
        'Quarry Lane',
        'Eastgate United',
        'Westbank Swifts',
        'Northside Rovers',
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
      <Title level={2}>Transactions</Title>
      <Inline gap={2}>
        <Button variant="outline" tone="neutral">
          Export CSV
        </Button>
        <Button>Add expense</Button>
      </Inline>
    </Inline>
  ),
}

/** Label and value on one line; `justify` can change per breakpoint. */
export const Responsive: Story = {
  render: () => (
    <Stack gap={3}>
      <Inline justify={{ base: 'start', md: 'between' }} gap={3}>
        <Body>Hawks 3–1 Millpond</Body>
        <Label>Round 3 · +3 pts</Label>
      </Inline>
      <Inline justify={{ base: 'start', md: 'between' }} gap={3}>
        <Body>Money left this fortnight</Body>
        <Figure>$1,284.60</Figure>
      </Inline>
    </Stack>
  ),
}
