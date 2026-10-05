import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileDrop } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'
import type { StoredFile } from './FileDrop'

const earlierReceipts: StoredFile[] = [
  { id: 'r-112', name: 'invoice-2026-09-28.pdf', size: 184_000, type: 'application/pdf' },
  { id: 'r-113', name: 'hosting-q3.pdf', size: 412_000, type: 'application/pdf' },
]

const meta = {
  title: 'UI/Inputs/FileDrop',
  component: FileDrop,
  args: {
    'aria-label': 'Receipts',
    accept: 'image/*,.pdf',
    multiple: true,
    maxFiles: 6,
    maxSize: 5_000_000,
    preview: 'list',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <FileDrop {...args} />
    </Stack>
  ),
} satisfies Meta<typeof FileDrop>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Earlier uploads arrive as StoredFiles; new picks are Files. */
export const Receipts: Story = {
  args: { defaultValue: earlierReceipts },
}

/** Image picks preview from object URLs (revoked when removed or unmounted). */
export const Thumbnails: Story = {
  args: { preview: 'thumbnails', defaultValue: earlierReceipts },
}

export const SingleFile: Story = {
  args: {
    'aria-label': 'Timesheet',
    accept: '.pdf,.csv',
    multiple: false,
    browseLabel: 'choose a timesheet',
    dropLabel: "Drop this month's timesheet here or",
  },
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: earlierReceipts },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { invalid: true },
}

/**
 * `accept`, `maxFiles` and `maxSize` constrain what's taken, and `onReject` says what was turned
 * away and why. `preview` shows the chosen files as a `list` or as `thumbnails`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <FileDrop
        aria-label="Proof of concession"
        accept="image/*,application/pdf"
        multiple
        maxFiles={2}
        maxSize={5_000_000}
        preview="thumbnails"
      />
    )
  },
}
