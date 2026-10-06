import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, DataList, Popover } from '@mitcsutt/kiln-ui'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Muted, Row, Spacer, Strong } from '#components/overlays/_story/StoryKit'
import type { PopoverContentProps } from './Popover'

const meta = {
  title: 'UI/Overlays/Popover',
  component: Popover.Content,
  args: { side: 'bottom', align: 'start', arrow: false },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Popover.Content>

export default meta
type Story = StoryObj<typeof meta>

function InvoiceDetails({ open, ...args }: PopoverContentProps & { open?: boolean }) {
  return (
    <Popover open={open}>
      <Popover.Trigger asChild>
        <Button variant="outline" tone="neutral">
          INV-1042
        </Button>
      </Popover.Trigger>
      <Popover.Content aria-label="Invoice details" {...args}>
        <Stack gap={3}>
          <Stack gap={0}>
            <Strong>Northwind Studio · Design retainer</Strong>
            <Muted>Issued 14 September · due 14 October</Muted>
          </Stack>
          <Stack gap={0}>
            <Row label="Subtotal" value="$1,820.00" />
            <Row label="GST" value="$182.00" />
          </Stack>
          <Inline gap={2}>
            <Popover.Close asChild>
              <Button size="sm" variant="ghost" tone="neutral">
                Dismiss
              </Button>
            </Popover.Close>
            <Button size="sm" variant="outline" tone="neutral">
              Open invoice
            </Button>
          </Inline>
        </Stack>
      </Popover.Content>
    </Popover>
  )
}

export const Playground: Story = {
  render: (args) => <InvoiceDetails {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(storyRoot(canvasElement)).getByRole('button', {
      name: 'INV-1042',
    })
    await userEvent.click(trigger)
    const details = await screen.findByRole('dialog', { name: 'Invoice details' })
    await userEvent.click(within(details).getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** Tap an invoice for its details. Pinned open (controlled) so each theme column shows its own. */
export const InvoiceDetailsOpen: Story = {
  render: (args) => (
    <Stack gap={0} align="start">
      <InvoiceDetails {...args} open />
      <Spacer />
    </Stack>
  ),
}

/** With an arrow, for when the anchor is small or ambiguous. */
export const WithArrow: Story = {
  args: { arrow: true, align: 'center' },
  render: (args) => (
    <Stack gap={0} align="start">
      <Popover open>
        <Popover.Trigger asChild>
          <Button variant="ghost" tone="neutral">
            Team plan
          </Button>
        </Popover.Trigger>
        <Popover.Content aria-label="What is the Team plan?" {...args}>
          <Stack gap={1}>
            <Strong>Team plan</Strong>
            <Muted>
              Up to 25 seats, shared projects and priority support, billed monthly per seat.
            </Muted>
          </Stack>
        </Popover.Content>
      </Popover>
      <Spacer />
    </Stack>
  ),
}

/**
 * Give `Popover.Content` an `aria-label` (or a heading inside it). `arrow` draws a pointer to the
 * trigger. For a hint on hover, use a [Tooltip](/docs/ui/overlays/tooltip); for a list of
 * commands, a [DropdownMenu](/docs/ui/overlays/dropdown-menu).
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline" tone="neutral">
            Sailing details
          </Button>
        </Popover.Trigger>
        <Popover.Content aria-label="Sailing details" arrow>
          <DataList>
            <DataList.Item label="Vessel">MV Marram</DataList.Item>
            <DataList.Item label="Berth">3</DataList.Item>
            <DataList.Item label="Crossing">42 minutes</DataList.Item>
          </DataList>
        </Popover.Content>
      </Popover>
    )
  },
}
