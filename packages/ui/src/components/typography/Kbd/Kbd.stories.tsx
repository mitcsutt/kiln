import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Text } from '#components/typography/Text'
import { Kbd } from './Kbd'

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
        Search transactions with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </Text>
      <Text>
        Move between fixtures with <Kbd>J</Kbd> and <Kbd>K</Kbd>, open one with <Kbd>Enter</Kbd>
      </Text>
      <Text size="sm" tone="muted">
        Close any dialog with <Kbd size="sm">Esc</Kbd>
      </Text>
    </Stack>
  ),
}
