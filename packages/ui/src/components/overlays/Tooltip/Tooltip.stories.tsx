import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Button,
  CopyIcon,
  IconButton,
  Inline,
  SearchIcon,
  StarIcon,
  Tooltip,
  TooltipProvider,
} from '@mitcsutt/kiln-ui'
import { expect, fireEvent, fn, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Stack } from '#components/layout/Stack'
import { MoonIcon } from '#icons'
import { Clip, Muted, Spacer } from '#components/overlays/_story/StoryKit'

const meta = {
  title: 'UI/Overlays/Tooltip',
  component: Tooltip,
  args: {
    content: 'Copy share link',
    side: 'top',
    children: (
      <Button variant="ghost" tone="neutral" aria-label="Copy share link">
        <CopyIcon />
      </Button>
    ),
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <Stack gap={0} align="start">
        <Spacer size="sm" />
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or Tab to the button. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(
      within(storyRoot(canvasElement)).getByRole('button', { name: 'Copy share link' }),
    ).toHaveFocus()
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy share link')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  },
}

/**
 * Icon-only buttons in a toolbar. One provider, so after the first tooltip the rest
 * appear instantly as you move along. The first is pinned open (controlled) for the screenshot.
 */
export const IconButtons: Story = {
  render: () => (
    <TooltipProvider>
      <Inline gap={1}>
        <Tooltip content="Search invoices" open>
          <Button variant="ghost" tone="neutral" aria-label="Search invoices">
            <SearchIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Copy share link">
          <Button variant="ghost" tone="neutral" aria-label="Copy share link">
            <CopyIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Switch to night mode" side="bottom">
          <Button variant="ghost" tone="neutral" aria-label="Switch to night mode">
            <MoonIcon />
          </Button>
        </Tooltip>
      </Inline>
    </TooltipProvider>
  ),
}

/** A figure with context. Short sentences wrap and balance at a narrow measure. */
export const OnData: Story = {
  render: () => (
    <Tooltip
      content="Excludes the $120.00 credit note for Orchard & Co on 22 September."
      open
      side="right"
    >
      <Button variant="outline" tone="neutral">
        $612.35
      </Button>
    </Tooltip>
  ),
}

/** Portalled, so a card with `overflow: hidden` can't clip it. */
export const EscapesClipping: Story = {
  render: () => (
    <Clip>
      <Stack gap={2}>
        <Tooltip content="Northwind Studio, your largest client" open>
          <Button size="sm" variant="outline" tone="neutral">
            NWS
          </Button>
        </Tooltip>
        <Muted>This box has overflow: hidden; the tooltip above it is not cut off.</Muted>
      </Stack>
    </Clip>
  ),
}

/**
 * A tooltip supplements a name; it isn't one. An `IconButton` already has its `label` as its
 * accessible name, and the tooltip shows that same label to pointer users.
 *
 * `TooltipProvider` shares delays between tooltips, so moving along a toolbar shows each one
 * instantly after the first. Put one near the app root. Tooltips work without it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <TooltipProvider>
        <Inline gap={2}>
          <Tooltip content="Search stops">
            <IconButton label="Search stops" icon={<SearchIcon />} />
          </Tooltip>
          <Tooltip content="Copy share link">
            <IconButton label="Copy share link" icon={<CopyIcon />} />
          </Tooltip>
          <Tooltip content="Save route" side="bottom">
            <IconButton label="Save route" icon={<StarIcon />} />
          </Tooltip>
        </Inline>
      </TooltipProvider>
    )
  },
}

/**
 * `touch="longpress"` opens a tooltip when the trigger is held on a touch screen, and swallows
 * the tap that ends the press. A disabled trigger stays focusable (`aria-disabled`, with its
 * clicks blocked), so its tooltip still opens on hover, focus and long press, and can say why
 * it's disabled.
 */
export const TouchAndDisabled: Story = {
  name: 'Touch and disabled triggers',
  tags: ['docs'],
  render: function TouchAndDisabled() {
    return (
      <Inline gap={3}>
        <Tooltip content="Noor, Kofi and Ada" touch="longpress">
          <Button variant="outline" tone="neutral">
            3 reactions
          </Button>
        </Tooltip>
        <Tooltip content="You've used all three reactions" touch="longpress">
          <Button variant="outline" tone="neutral" disabled>
            React
          </Button>
        </Tooltip>
      </Inline>
    )
  },
}

const onReactionsClick = fn()

/**
 * A held touch opens the tooltip and swallows the tap; a quick tap still presses the button, and
 * so does a key press after a long press.
 */
export const LongPress: Story = {
  args: {
    content: 'Noor, Kofi and Ada',
    touch: 'longpress',
    children: (
      <Button variant="outline" tone="neutral" onClick={onReactionsClick}>
        3 reactions
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    onReactionsClick.mockClear()
    const trigger = within(storyRoot(canvasElement)).getByRole('button', { name: '3 reactions' })
    await userEvent.pointer({ keys: '[TouchA]', target: trigger })
    await expect(onReactionsClick).toHaveBeenCalledOnce()
    await expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    const longPress = async (whileHeld?: () => Promise<unknown>) => {
      await userEvent.pointer({ keys: '[TouchA>]', target: trigger })
      await expect(await screen.findByRole('tooltip', {}, { timeout: 2000 })).toHaveTextContent(
        'Noor, Kofi and Ada',
      )
      await whileHeld?.()
      await fireEvent.pointerUp(trigger, { pointerType: 'touch' })
    }
    const pressEnter = async (times: number) => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
      trigger.focus()
      await userEvent.keyboard('{Enter}')
      await expect(onReactionsClick).toHaveBeenCalledTimes(times)
      await userEvent.keyboard('{Escape}')
      trigger.blur()
    }

    // The tap that ends the press arrives after the finger lifts, and is swallowed.
    await longPress()
    await new Promise((resolve) => setTimeout(resolve, 100))
    await fireEvent.click(trigger)
    await expect(onReactionsClick).toHaveBeenCalledOnce()
    await pressEnter(2)

    // A phone opens its context menu during the hold and sends no tap; a later key press works.
    await longPress(async () => expect(await fireEvent.contextMenu(trigger)).toBe(false))
    await new Promise((resolve) => setTimeout(resolve, 1100))
    await pressEnter(3)
  },
}
