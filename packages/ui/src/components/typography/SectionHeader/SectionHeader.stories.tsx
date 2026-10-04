import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpRightIcon, PlusIcon } from '#icons'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Amount } from '#components/typography/Amount'
import { SectionHeader } from './SectionHeader'

const meta = {
  title: 'UI/Typography/SectionHeader',
  component: SectionHeader,
  args: {
    title: 'Active projects',
    description: 'Projects with work due this quarter, newest first.',
    level: 2,
    divider: false,
  },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A page header: level 1, a display size, and the one primary action. */
export const PageHeader: Story = {
  render: () => (
    <SectionHeader
      level={1}
      size={{ base: '3xl', md: 'display-sm' }}
      kicker="2025–26 financial year"
      title="September invoices"
      description={
        <>
          <Amount value={4182.6} /> of a <Amount value={5200} precision={0} /> target, with 2 days
          to go.
        </>
      }
      actions={
        <>
          <Button variant="outline" tone="neutral">
            Export CSV
          </Button>
          <Button leadingIcon={<PlusIcon />}>New invoice</Button>
        </>
      }
      divider
    />
  ),
}

/** Section headers in context. The kicker only appears where it adds information. */
export const Sections: Story = {
  render: () => (
    <Stack gap={9}>
      <SectionHeader
        title="Active projects"
        description="Projects with work due this quarter, newest first."
        actions={
          <Button variant="ghost" tone="neutral" trailingIcon={<ArrowUpRightIcon />} asChild>
            <a href="#projects">All projects</a>
          </Button>
        }
      />
      <SectionHeader
        kicker="Sprint 2 of 14"
        title="Open tasks by project"
        description="Sorted by due date, with overdue tasks first."
        divider
      />
      <SectionHeader level={3} title="Recent releases" />
    </Stack>
  ),
}
