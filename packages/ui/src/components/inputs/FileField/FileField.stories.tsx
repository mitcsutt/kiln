import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'
import type { StoredFile } from '#components/inputs/FileDrop'

const earlierReceipts: StoredFile[] = [
  { id: 'r-112', name: 'invoice-2026-09-28.pdf', size: 184_000, type: 'application/pdf' },
]

const meta = {
  title: 'UI/Inputs/FileField',
  component: FileField,
  args: {
    label: 'Receipts',
    description: 'JPG, PNG or PDF, up to 5 MB each',
    accept: 'image/*,.pdf',
    multiple: true,
    maxFiles: 6,
    maxSize: 5_000_000,
    preview: 'thumbnails',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <FileField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof FileField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Receipts: Story = {
  args: { defaultValue: earlierReceipts },
}

export const WithError: Story = {
  args: { required: true, error: 'office-scan.heic is not a JPG, PNG or PDF' },
}

/**
 * Put the constraints (types and size) in the description, so nobody finds out by being rejected.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <FileField
        label="Photo for your pass"
        description="A JPEG or PNG under 5 MB, face straight on"
        accept="image/jpeg,image/png"
        maxSize={5_000_000}
        preview="thumbnails"
      />
    )
  },
}
