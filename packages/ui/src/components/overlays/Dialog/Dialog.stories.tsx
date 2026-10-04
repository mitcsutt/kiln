import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Body, Row, Stage } from '#components/overlays/_story/StoryKit'
import { Dialog, type DialogContentProps } from './Dialog'

const meta = {
  title: 'UI/Overlays/Dialog',
  component: Dialog.Content,
  args: {
    size: 'sm',
    title: 'Delete invoice?',
    description:
      'INV-1042 for Northwind Studio, $1,820.00, issued 14 September. The client can no longer pay it.',
    hideClose: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Dialog.Content>

export default meta
type Story = StoryObj<typeof meta>

function ConfirmDelete({ defaultOpen, ...args }: DialogContentProps & { defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" tone="critical">
          Delete invoice
        </Button>
      </Dialog.Trigger>
      <Dialog.Content {...args}>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost" tone="neutral">
              Keep invoice
            </Button>
          </Dialog.Close>
          <Button tone="critical">Delete invoice</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

/** Click the trigger. In "All themes", each column's dialog opens in that column's theme. */
export const Playground: Story = {
  render: (args) => <ConfirmDelete {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(storyRoot(canvasElement)).getByRole('button', { name: 'Delete invoice' })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Delete invoice?' })
    await expect(dialog).toHaveAccessibleDescription(/Northwind Studio/)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/**
 * The destructive confirmation: the title asks the question, the description names
 * exactly what goes, and focus starts on the safe choice.
 */
export const ConfirmDestructive: Story = {
  render: (args) => (
    <Stage>{(container) => <ConfirmDelete {...args} container={container} defaultOpen />}</Stage>
  ),
}

/** `md` for a short breakdown; the footer stays pinned while the body scrolls. */
export const Breakdown: Story = {
  args: {
    size: 'md',
    title: 'Invoice INV-1042',
    description: 'Northwind Studio · due 14 October',
  },
  render: (args) => (
    <Stage size="lg">
      {(container) => (
        <Dialog defaultOpen>
          <Dialog.Trigger asChild>
            <Button variant="outline" tone="neutral">
              View breakdown
            </Button>
          </Dialog.Trigger>
          <Dialog.Content container={container} {...args}>
            <Stack gap={0}>
              <Row label="Design review, 6 hours" value="$720.00" />
              <Row label="Frontend build, 8 hours" value="$960.00" />
              <Row label="Hosting, September" value="$96.15" />
              <Row label="Support retainer" value="$25.25" />
              <Row label="Domain renewal" value="$18.60" />
              <Row label="Total due" value="$1,820.00" strong />
            </Stack>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="ghost" tone="neutral">
                  Done
                </Button>
              </Dialog.Close>
              <Button>Export CSV</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </Stage>
  ),
}

/** `lg` is a reading width, for rules and long explanations. */
export const Reading: Story = {
  args: {
    size: 'lg',
    title: 'How billing works',
    description: 'Team plan · 12 seats, billed monthly',
  },
  render: (args) => (
    <Stage size="lg">
      {(container) => (
        <Dialog defaultOpen>
          <Dialog.Trigger asChild>
            <Button variant="ghost" tone="neutral">
              Billing help
            </Button>
          </Dialog.Trigger>
          <Dialog.Content container={container} {...args}>
            <Stack gap={3}>
              <Body>
                Every seat is billed on the first of the month. Add a seat mid-cycle and you pay
                only for the days left in the period.
              </Body>
              <Body>
                Removing a seat credits the unused days to your next invoice. Credits never expire,
                and they apply to any plan.
              </Body>
              <Body>Invoices go to the billing contact as soon as they are issued.</Body>
            </Stack>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button>Got it</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </Stage>
  ),
}
