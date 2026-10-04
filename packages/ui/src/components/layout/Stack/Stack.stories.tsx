import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Body, Cell, Figure, Label, Title } from '#components/layout/_story/StoryKit'
import { Stack } from './Stack'

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
      <Cell>Spain</Cell>
      <Cell>Uruguay</Cell>
      <Cell>Senegal</Cell>
    </Stack>
  ),
}

/** Rules between items instead of boxes around them. The rule sits in the middle of the gap. */
export const Dividers: Story = {
  render: () => (
    <Stack as="ul" gap={4} dividers>
      {[
        ['Rent', '$2,340.00'],
        ['Groceries', '$612.85'],
        ['Utilities', '$214.30'],
        ['Transport', '$186.00'],
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
        <Label>Group A</Label>
        <Title level={2}>Hawks top on goal difference</Title>
      </Stack>
      <Stack gap={2}>
        <Label>Group B</Label>
        <Title level={2}>Canada through with a game to spare</Title>
      </Stack>
    </Stack>
  ),
}
