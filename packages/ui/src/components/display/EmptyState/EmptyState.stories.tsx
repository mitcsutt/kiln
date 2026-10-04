import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { PlusIcon } from '#icons'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'UI/Display/EmptyState',
  component: EmptyState,
  args: {
    title: 'No expenses yet',
    description:
      'Add what you spent this month, or import a CSV export from your bank. Categories fill in as you go.',
    align: 'start',
    framed: false,
  },
  argTypes: { action: { control: false }, media: { control: false } },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** An expenses screen's first run. One primary action, one quieter alternative. */
export const NoExpensesYet: Story = {
  args: {
    framed: true,
    action: (
      <>
        <Button leadingIcon={<PlusIcon />}>Add expense</Button>
        <Button variant="ghost" tone="neutral">
          Import CSV
        </Button>
      </>
    ),
  },
}

/** A match feed before kick-off: the whole panel, so centred. */
export const QuietFeed: Story = {
  args: {
    title: 'Quiet so far',
    description:
      'Goals, cards and substitutions land here once Hawks and Millpond kick off on 14 June.',
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
