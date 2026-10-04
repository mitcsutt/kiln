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
      <Body>Group stage finished Saturday 27 June.</Body>
      <Divider {...args} />
      <Body>Round of 32 starts Sunday 28 June.</Body>
    </div>
  ),
}

/** A label names the separator for screen readers too. Start-aligned by default. */
export const Labelled: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Rovers 2–0 Swifts</Body>
        <Label>Ned</Label>
      </Inline>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Hawks 3–1 Millpond</Body>
        <Label>Noor</Label>
      </Inline>
      <Divider label="Knockout stage" spacing={2} />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>France 1–1 Netherlands</Body>
        <Label>Mei</Label>
      </Inline>
      <Divider label="Full time" labelPosition="center" spacing={2} />
    </Stack>
  ),
}

/** Strong rules close a ledger; hairlines separate its lines. */
export const Strong: Story = {
  render: () => (
    <Stack gap={3}>
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Rent</Body>
        <Figure>$2,340.00</Figure>
      </Inline>
      <Divider />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Groceries</Body>
        <Figure>$612.85</Figure>
      </Inline>
      <Divider />
      <Inline justify="between" gap={3} wrap={false}>
        <Body>Utilities</Body>
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
      <Label>Group A</Label>
      <Divider orientation="vertical" decorative />
      <Label>Harbour Park</Label>
      <Divider orientation="vertical" decorative />
      <Label>Kick-off 13:00</Label>
    </Inline>
  ),
}
