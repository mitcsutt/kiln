import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Inline, Stack, Toaster, toast } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Feedback/Toaster',
  component: Toaster,
  args: { position: 'bottom-end', max: 3, closeLabel: 'Dismiss' },
  render: (args) => (
    <Stack gap={4} align="start">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Invoice sent',
            description: 'Kittiwake Ltd, £1,240.00',
            tone: 'positive',
          })
        }}
      >
        Send invoice
      </Button>
      <Toaster {...args} />
    </Stack>
  ),
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/** Try `position` and `max` in the controls, then raise a few. */
export const Playground: Story = {}

/**
 * Mount one `Toaster` near the root, then call `toast()` from anywhere: an event handler, a
 * query's error callback, a socket listener. Each tone has its glyph and its tab on the top edge.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Stack gap={4} align="start">
      <Inline gap={3}>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: 'Invoice sent',
              description: 'Kittiwake Ltd, £1,240.00',
              tone: 'positive',
            })
          }}
        >
          Send invoice
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast('Link copied')
          }}
        >
          Copy link
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              id: 'bank-sync',
              title: 'Bank feed failed to sync',
              description: 'Leith Credit Union did not answer. Your ledger is unchanged.',
              tone: 'critical',
            })
          }}
        >
          Sync bank feed
        </Button>
      </Inline>
      <Toaster />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Send invoice' }))
    const region = await page.findByRole('region', { name: 'Notifications (F8)' })
    await waitFor(() => expect(within(region).getByText('Invoice sent')).toBeVisible())
    await userEvent.click(within(region).getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => expect(within(region).queryByText('Invoice sent')).not.toBeInTheDocument())
    toast.dismiss()
  },
}

/**
 * One action, such as Undo or Retry. Its `altText` tells screen reader users how to do the same
 * thing once the toast has gone.
 */
export const WithAction: Story = {
  tags: ['docs'],
  render: () => (
    <Stack gap={4} align="start">
      <Button
        variant="outline"
        tone="critical"
        onClick={() => {
          toast({
            title: 'Invoice HW-3104 archived',
            action: {
              label: 'Undo',
              altText: 'Restore it from the Archive page',
              onClick: () => {
                toast({ title: 'Invoice HW-3104 restored', tone: 'positive' })
              },
            },
          })
        }}
      >
        Archive invoice
      </Button>
      <Toaster />
    </Stack>
  ),
}

/**
 * `toast.promise` shows a loading toast while the work runs, then turns it into the success or
 * error message. Loading toasts can't be dismissed, and an error stays until it's read.
 */
export const FromAPromise: Story = {
  name: 'From a promise',
  tags: ['docs'],
  render: () => (
    <Stack gap={4} align="start">
      <Button
        variant="outline"
        onClick={() => {
          const exported = new Promise<number>((resolve) => {
            setTimeout(() => {
              resolve(1284)
            }, 1500)
          })
          void toast.promise(exported, {
            loading: 'Exporting the March ledger',
            success: (rows) => ({
              title: 'Export ready',
              description: `${rows.toLocaleString('en-GB')} rows in march-ledger.csv`,
            }),
            error: 'The export failed. Try again in a minute.',
          })
        }}
      >
        Export CSV
      </Button>
      <Toaster />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Export CSV' }))
    await waitFor(() => expect(page.getByText('Exporting the March ledger')).toBeVisible())
    await waitFor(() => expect(page.getByText('Export ready')).toBeVisible(), { timeout: 4000 })
    toast.dismiss()
  },
}

/**
 * Raise a toast with an `id` and calling it again updates that toast instead of stacking a second,
 * so a repeated failure shows once. `toast.update` and `toast.dismiss` take the same id.
 */
export const Updating: Story = {
  tags: ['docs'],
  render: function Updating() {
    return (
      <Stack gap={4} align="start">
        <Inline gap={3}>
          <Button
            variant="outline"
            onClick={() => {
              toast({ id: 'upload', title: 'Uploading 3 receipts', loading: true })
            }}
          >
            Upload receipts
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.update('upload', {
                title: '3 receipts uploaded',
                tone: 'positive',
                loading: false,
              })
            }}
          >
            Finish upload
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              toast.dismiss('upload')
            }}
          >
            Dismiss
          </Button>
        </Inline>
        <Toaster />
      </Stack>
    )
  },
}

/** Pinned to the top centre, as for a short confirmation on a phone. */
export const TopCenter: Story = {
  args: { position: 'top-center' },
}
