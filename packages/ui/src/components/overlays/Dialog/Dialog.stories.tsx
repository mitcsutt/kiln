import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Body, Row, Stage } from '#components/overlays/_story/StoryKit'
import { Dialog, type DialogContentProps } from './Dialog'

const meta = {
  title: 'UI/Overlays/Dialog',
  component: Dialog.Content,
  args: {
    size: 'sm',
    title: 'Delete expense?',
    description: 'Corner Grocer, $182.40 on 14 September. It also comes off your Groceries total.',
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
          Delete expense
        </Button>
      </Dialog.Trigger>
      <Dialog.Content {...args}>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost" tone="neutral">
              Keep expense
            </Button>
          </Dialog.Close>
          <Button tone="critical">Delete expense</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

/** Click the trigger. In "All themes", each column's dialog opens in that column's theme. */
export const Playground: Story = {
  render: (args) => <ConfirmDelete {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Delete expense' })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Delete expense?' })
    await expect(dialog).toHaveAccessibleDescription(/Corner Grocer/)
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
    title: 'Groceries, September',
    description: '14 transactions against an $850.00 limit.',
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
              <Row label="Corner Grocer" value="$182.40" />
              <Row label="Fresh Market" value="$96.15" />
              <Row label="Bulk Foods Co-op" value="$141.72" />
              <Row label="Rise Bakery" value="$18.60" />
              <Row label="Corner Grocer, delivery" value="$173.48" />
              <Row label="Spent so far" value="$612.35" strong />
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
    title: 'How the league works',
    description: 'Division two · 8 clubs, 14 rounds',
  },
  render: (args) => (
    <Stage size="lg">
      {(container) => (
        <Dialog defaultOpen>
          <Dialog.Trigger asChild>
            <Button variant="ghost" tone="neutral">
              Rules
            </Button>
          </Dialog.Trigger>
          <Dialog.Content container={container} {...args}>
            <Stack gap={3}>
              <Body>
                Every club plays every other club twice, once at home and once away. Fixtures are
                published before the first round and only move for weather.
              </Body>
              <Body>
                A win scores 3 and a draw 1. Clubs level on points are split by goal difference,
                then goals scored, then the result between them.
              </Body>
              <Body>The table updates as soon as the home club confirms the result.</Body>
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
