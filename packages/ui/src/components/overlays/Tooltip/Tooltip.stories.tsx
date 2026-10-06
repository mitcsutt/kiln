import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CopyIcon,
  IconButton,
  Inline,
  SearchIcon,
  StarIcon,
  Tooltip,
  TooltipProvider,
} from '@mitcsutt/kiln-ui'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Button } from '#components/actions/Button'
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
