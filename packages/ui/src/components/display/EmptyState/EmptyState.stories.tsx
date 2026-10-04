import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { PlusIcon } from '#icons'
import { EmptyState } from './EmptyState'

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
