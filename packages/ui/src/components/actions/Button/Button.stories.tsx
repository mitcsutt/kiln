import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpRightIcon, PlusIcon } from '#icons'
import { Stack } from '#components/layout/Stack'
import { Button } from './Button'

const meta = {
  title: 'UI/Actions/Button',
  component: Button,
  args: { children: 'Publish fixtures', variant: 'solid', tone: 'accent', size: 'md' },
  argTypes: {
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** One solid button per view — it *is* the primary action. Everything else steps down. */
export const Hierarchy: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button>Save budget</Button>
      <Button variant="outline" tone="neutral">
        Export CSV
      </Button>
      <Button variant="ghost" tone="neutral">
        Cancel
      </Button>
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <Stack gap={4}>
      {(['accent', 'neutral', 'critical'] as const).map((tone) => (
        <div key={tone} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button tone={tone}>Solid</Button>
          <Button tone={tone} variant="outline">
            Outline
          </Button>
          <Button tone={tone} variant="ghost">
            Ghost
          </Button>
        </div>
      ))}
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button leadingIcon={<PlusIcon />}>Add expense</Button>
      <Button variant="outline" tone="neutral" trailingIcon={<ArrowUpRightIcon />} asChild>
        <a href="https://github.com/mitcsutt/kiln">Source on GitHub</a>
      </Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </div>
  ),
}
