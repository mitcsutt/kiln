import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionBar, Button, Stack, TextField } from '@mitcsutt/kiln-ui'
import { Text } from '#components/typography/Text'

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
        <Text>Assign an owner to each project before continuing.</Text>
        <Text>Atlas redesign</Text>
        <Text>Billing migration</Text>
        <Text>Mobile app</Text>
        <Text>Help centre</Text>
        <Text>Search revamp</Text>
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

/**
 * `sticky` keeps the bar at the bottom of the viewport while a long form scrolls, so save is
 * always in reach.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={5}>
        <TextField label="Route name" defaultValue="Morning commute" />
        <ActionBar>
          <Button variant="ghost" tone="neutral">
            Cancel
          </Button>
          <Button>Save route</Button>
        </ActionBar>
        <ActionBar align="between">
          <Button variant="outline" tone="critical">
            Delete route
          </Button>
          <Button>Save route</Button>
        </ActionBar>
      </Stack>
    )
  },
}
