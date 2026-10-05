import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Body, Figure, Label } from '#components/layout/_story/StoryKit'
import { Divider } from './Divider'

const meta = {
  title: 'UI/Layout/Divider',
  component: Divider,
  args: { orientation: 'horizontal', strong: false, spacing: 5, labelPosition: 'start' },
  argTypes: { label: { control: 'text' } },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div>
      <Body>Release 2.3 shipped Saturday 27 June.</Body>
      <Divider {...args} />
      <Body>Work on release 2.4 starts Sunday 28 June.</Body>
    </div>
  ),
}

/** A label names the separator for screen readers too. Start-aligned by default. */
export const Labelled: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Fix the login redirect</Body>
        <Label>Priya</Label>
      </Inline>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Update the pricing page</Body>
        <Label>Tomás</Label>
      </Inline>
      <Divider label="Earlier this week" spacing={2} />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Migrate billing webhooks</Body>
        <Label>Hana</Label>
      </Inline>
      <Divider label="End of sprint" labelPosition="center" spacing={2} />
    </Stack>
  ),
}

/** Strong rules close an invoice; hairlines separate its lines. */
export const Strong: Story = {
  render: () => (
    <Stack gap={3}>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Design</Body>
        <Figure>$2,340.00</Figure>
      </Inline>
      <Divider />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Development</Body>
        <Figure>$612.85</Figure>
      </Inline>
      <Divider />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Hosting</Body>
        <Figure>$214.30</Figure>
      </Inline>
      <Divider strong />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Total</Body>
        <Figure>$3,167.15</Figure>
      </Inline>
    </Stack>
  ),
}

/** Vertical rules separate items in a meta line. */
export const Vertical: Story = {
  render: () => (
    <Inline gap={3} align="stretch">
      <Label>Release 2.4</Label>
      <Divider orientation="vertical" decorative />
      <Label>Atlas redesign</Label>
      <Divider orientation="vertical" decorative />
      <Label>Ships 13:00</Label>
    </Inline>
  ),
}
