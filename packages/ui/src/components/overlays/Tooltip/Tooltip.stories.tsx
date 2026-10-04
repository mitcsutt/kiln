import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { CopyIcon, MoonIcon, SearchIcon } from '#icons'
import { Clip, Muted, Spacer } from '#components/overlays/_story/StoryKit'
import { Tooltip, TooltipProvider } from './Tooltip'

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
export const Playground: Story = {}

/**
 * Icon-only buttons in a toolbar. One provider, so after the first tooltip the rest
 * appear instantly as you move along. The first is pinned open (controlled) for the screenshot.
 */
export const IconButtons: Story = {
  render: () => (
    <TooltipProvider>
      <Inline gap={1}>
        <Tooltip content="Search fixtures" open>
          <Button variant="ghost" tone="neutral" aria-label="Search fixtures">
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
      content="Excludes the $120.00 refund from Fresh Market on 22 September."
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
        <Tooltip content="Harbour Hawks, top of division two" open>
          <Button size="sm" variant="outline" tone="neutral">
            HAW
          </Button>
        </Tooltip>
        <Muted>This box has overflow: hidden; the tooltip above it is not cut off.</Muted>
      </Stack>
    </Clip>
  ),
}
