import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, EmptyState, Stack } from '@mitcsutt/kiln-ui'
import { PlusIcon } from '#icons'

const meta = {
  title: 'UI/Display/EmptyState',
  component: EmptyState,
  args: {
    title: 'No invoices yet',
    description:
      'Create your first invoice, or import a CSV export from your accounting tool. Clients fill in as you go.',
    align: 'start',
    framed: false,
  },
  argTypes: { action: { control: false }, media: { control: false } },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** An invoices screen's first run. One primary action, one quieter alternative. */
export const NoInvoicesYet: Story = {
  args: {
    framed: true,
    action: (
      <>
        <Button leadingIcon={<PlusIcon />}>New invoice</Button>
        <Button variant="ghost" tone="neutral">
          Import CSV
        </Button>
      </>
    ),
  },
}

/** An activity feed before a project starts: the whole panel, so centred. */
export const QuietFeed: Story = {
  args: {
    title: 'Quiet so far',
    description:
      'Comments, reviews and deploys land here once the Atlas redesign starts on 14 June.',
    align: 'center',
    titleAs: 'h2',
  },
}

/** A filtered list with no matches — no action needed beyond clearing the filter. */
export const NoMatches: Story = {
  args: {
    title: 'No projects tagged "Rust"',
    description: 'Try another tag, or see every project.',
    action: (
      <Button variant="outline" tone="neutral" size="sm">
        Clear filter
      </Button>
    ),
  },
}

/**
 * `framed` marks the frame with printer's crop marks rather than a dashed box. `align="center"`
 * suits an empty state that fills a region; left-aligned (the default) suits one inside a page.
 * `media` adds an illustration, and `titleAs` sets the heading level.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={6}>
        <EmptyState
          title="No saved routes yet"
          description="Save a route from any timetable and its next departures show up here."
          action={<Button>Find a route</Button>}
        />
        <EmptyState
          framed
          align="center"
          title="No sailings match"
          description="Try a different day, or include services that need a booking."
          action={
            <Button variant="outline" tone="neutral">
              Clear filters
            </Button>
          }
        />
      </Stack>
    )
  },
}
