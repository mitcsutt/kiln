import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Progress } from './Progress'

const meta = {
  title: 'UI/Display/Progress',
  component: Progress,
  args: {
    label: 'Importing September transactions',
    value: 64,
    showValue: true,
    tone: 'accent',
    size: 'md',
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A count-based task: 48 files imported one at a time. */
export const ImportProgress: Story = {
  args: {
    label: 'Importing files',
    value: 29,
    max: 48,
    formatValue: (v, m) => `${String(v)} of ${String(m)}`,
  },
}

export const Indeterminate: Story = {
  args: { label: 'Fetching live scores', value: null, showValue: false },
}

export const SizesAndTones: Story = {
  render: () => (
    <Stack gap={5}>
      <Progress size="sm" label="Uploading receipts" value={18} showValue />
      <Progress size="md" tone="positive" label="Bank feed synced" value={100} showValue />
      <Progress size="lg" tone="info" label="Building site preview" value={71} showValue />
      <Progress size="md" tone="neutral" aria-label="Page load" value={40} />
    </Stack>
  ),
}
