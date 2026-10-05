import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'UI/Display/Skeleton',
  component: Skeleton,
  args: { width: '2/3', height: 'heading', radius: 'field' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A member list loading: one busy region, many silent placeholders. */
export const MemberListLoading: Story = {
  render: () => (
    <Stack gap={4} dividers aria-busy="true" aria-label="Loading team members" role="status">
      {[0, 1, 2, 3].map((i) => (
        <Inline key={i} gap={4} wrap={false}>
          <Skeleton.Circle />
          <Stack gap={2} style={{ flex: 1 }}>
            <Skeleton width="1/3" />
            <Skeleton width="1/2" height={3} />
          </Stack>
          <Skeleton width={7} height="heading" />
        </Inline>
      ))}
    </Stack>
  ),
}

/** A help-centre article before the MDX arrives. */
export const ArticleLoading: Story = {
  render: () => (
    <Stack gap={5} style={{ maxWidth: '42rem' }}>
      <Skeleton height="block" radius="media" />
      <Skeleton width="3/4" height="heading" />
      <Skeleton.Text lines={4} />
      <Skeleton.Text lines={3} />
    </Stack>
  ),
}

export const Shapes: Story = {
  render: () => (
    <Inline gap={5} align="center">
      <Skeleton.Circle size="sm" />
      <Skeleton.Circle size="md" />
      <Skeleton.Circle size="lg" />
      <Skeleton width={9} height="control" radius="chip" />
      <Skeleton width={9} height={9} radius="surface" />
    </Inline>
  ),
}
