import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Text } from '#components/typography/Text'
import { ActionBar } from './ActionBar'

const meta = {
  title: 'UI/Layout/ActionBar',
  component: ActionBar,
  args: { align: 'end' },
  render: (args) => (
    <ActionBar {...args}>
      <Button variant="ghost">Back</Button>
      <Button>Continue</Button>
    </ActionBar>
  ),
} satisfies Meta<typeof ActionBar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Start: Story = {
  args: { align: 'start' },
}

/** A status message on one side, the primary actions on the other. */
export const Between: Story = {
  args: { align: 'between' },
  render: (args) => (
    <ActionBar {...args}>
      <Text tone="muted" size="sm">
        Saved a moment ago
      </Text>
      <ActionBar align="end" gap={2}>
        <Button variant="ghost">Discard</Button>
        <Button>Save</Button>
      </ActionBar>
    </ActionBar>
  ),
}

/** Pinned to the bottom of a scrolling body — a long step in a multi-step form. */
export const Sticky: Story = {
  args: { sticky: true },
  render: (args) => (
    <div
      style={{
        blockSize: '16rem',
        overflowY: 'auto',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-surface)',
      }}
    >
      <Stack gap={4} style={{ padding: 'var(--space-5)' }}>
        <Text>Pick a winner for each group before continuing.</Text>
        <Text>Group A</Text>
        <Text>Group B</Text>
        <Text>Group C</Text>
        <Text>Group D</Text>
        <Text>Group E</Text>
      </Stack>
      <ActionBar {...args}>
        <Button variant="ghost">Back</Button>
        <Button>Continue</Button>
      </ActionBar>
    </div>
  ),
}

export const AsFooter: Story = {
  args: { as: 'footer' },
}
