import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Display/Progress',
  component: Progress,
  args: {
    label: 'Importing September invoices',
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
  args: { label: 'Fetching deploy status', value: null, showValue: false },
}

export const SizesAndTones: Story = {
  render: () => (
    <Stack gap={5}>
      <Progress size="sm" label="Uploading attachments" value={18} showValue />
      <Progress size="md" tone="positive" label="Calendar synced" value={100} showValue />
      <Progress size="lg" tone="info" label="Building site preview" value={71} showValue />
      <Progress size="md" tone="neutral" aria-label="Page load" value={40} />
    </Stack>
  ),
}

/**
 * `value={null}` is indeterminate: the task is under way but its length is unknown. `label` names
 * the bar, `showValue` prints the percentage (change the text with `formatValue`), and `tone`
 * marks success or trouble.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={5}>
        <Progress label="Uploading timetable.csv" value={64} showValue />
        <Progress label="Syncing saved routes" value={null} />
        <Progress label="Import finished" value={100} tone="positive" size="sm" />
      </Stack>
    )
  },
}
