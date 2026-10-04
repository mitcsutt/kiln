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
    title: 'Recent projects',
    description: 'Maps, signs and books the studio finished in the last two years.',
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
      title="September spending"
      description={
        <>
          <Amount value={4182.6} /> of <Amount value={5200} precision={0} /> budgeted, with 2 days
          to go.
        </>
      }
      actions={
        <>
          <Button variant="outline" tone="neutral">
            Export CSV
          </Button>
          <Button leadingIcon={<PlusIcon />}>Add expense</Button>
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
        title="Recent projects"
        description="Maps, signs and books the studio finished in the last two years."
        actions={
          <Button variant="ghost" tone="neutral" trailingIcon={<ArrowUpRightIcon />} asChild>
            <a href="#projects">All projects</a>
          </Button>
        }
      />
      <SectionHeader
        kicker="Round 2 of 14"
        title="Group B standings"
        description="Top two go through, plus the best third-placed teams."
        divider
      />
      <SectionHeader level={3} title="Recent writing" />
    </Stack>
  ),
}
