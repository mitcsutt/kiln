import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd, Text } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Typography/Kbd',
  component: Kbd,
  args: { children: 'K', size: 'md' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Shortcuts: Story = {
  render: () => (
    <Stack gap={3}>
      <Text>
        Search invoices with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </Text>
      <Text>
        Move between tasks with <Kbd>J</Kbd> and <Kbd>K</Kbd>, open one with <Kbd>Enter</Kbd>
      </Text>
      <Text size="sm" tone="muted">
        Close any dialog with <Kbd size="sm">Esc</Kbd>
      </Text>
    </Stack>
  ),
}

/**
 * A shortcut written as one key after another, and a small key.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Text>
        Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd size="sm">Esc</Kbd> to close.
      </Text>
    )
  },
}
