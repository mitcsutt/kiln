import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '#components/actions/Button'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Muted, Row, Spacer, Strong } from '#components/overlays/_story/StoryKit'
import { Popover, type PopoverContentProps } from './Popover'

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

function MatchDetails({ open, ...args }: PopoverContentProps & { open?: boolean }) {
  return (
    <Popover open={open}>
      <Popover.Trigger asChild>
        <Button variant="outline" tone="neutral">
          Hawks v Millpond
        </Button>
      </Popover.Trigger>
      <Popover.Content aria-label="Match details" {...args}>
        <Stack gap={3}>
          <Stack gap={0}>
            <Strong>Division two · Round 1</Strong>
            <Muted>Sun 14 June, 10:30 · Harbour Park, pitch 2</Muted>
          </Stack>
          <Stack gap={0}>
            <Row label="Harbour Hawks" value="3" />
            <Row label="Millpond FC" value="0" />
          </Stack>
          <Inline gap={2}>
            <Popover.Close asChild>
              <Button size="sm" variant="ghost" tone="neutral">
                Dismiss
              </Button>
            </Popover.Close>
            <Button size="sm" variant="outline" tone="neutral">
              Full match report
            </Button>
          </Inline>
        </Stack>
      </Popover.Content>
    </Popover>
  )
}

export const Playground: Story = {
  render: (args) => <MatchDetails {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Hawks v Millpond' })
    await userEvent.click(trigger)
    const details = await screen.findByRole('dialog', { name: 'Match details' })
    await userEvent.click(within(details).getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** Tap a fixture for its details. Pinned open (controlled) so each theme column shows its own. */
export const MatchDetailsOpen: Story = {
  render: (args) => (
    <Stack gap={0} align="start">
      <MatchDetails {...args} open />
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
            Division two
          </Button>
        </Popover.Trigger>
        <Popover.Content aria-label="What is division two?" {...args}>
          <Stack gap={1}>
            <Strong>Division two</Strong>
            <Muted>
              Eight clubs. The top two go up at the end of the season; the bottom one goes down.
            </Muted>
          </Stack>
        </Popover.Content>
      </Popover>
      <Spacer />
    </Stack>
  ),
}
