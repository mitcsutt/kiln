import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, Skeleton, Stack } from '@mitcsutt/kiln-ui'

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

/**
 * Every piece is `aria-hidden`. Announce loading once, on the region that's loading (`aria-busy`,
 * or a [Spinner](/docs/ui/feedback/spinner) with a label), rather than once per bar. The shimmer
 * stops under reduced motion.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4} aria-busy="true" aria-label="Loading departures" role="status">
        <Inline gap={3}>
          <Skeleton.Circle size="md" />
          <Skeleton width="1/3" height="heading" />
        </Inline>
        <Skeleton.Text lines={3} />
      </Stack>
    )
  },
}
