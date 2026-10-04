import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Button } from '#components/actions/Button'
import { PlusIcon } from '#icons'
import { Body } from '#components/layout/_story/StoryKit'
import { VisuallyHidden } from './VisuallyHidden'

const meta = {
  title: 'UI/Layout/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Group standings', as: 'span', focusable: false },
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing to see — inspect the accessibility tree. */
export const Playground: Story = {}

/** An icon-only button still has a name. */
export const IconLabel: Story = {
  render: () => (
    <Button variant="outline" tone="neutral">
      <PlusIcon aria-hidden />
      <VisuallyHidden>Add expense</VisuallyHidden>
    </Button>
  ),
}

/** `focusable` reveals the content while it has focus. Press Tab. */
export const SkipLink: Story = {
  render: () => (
    <Stack gap={3}>
      <VisuallyHidden as="a" href="#standings" focusable>
        Skip to standings
      </VisuallyHidden>
      <Body tone="muted">Press Tab to reveal the skip link above this line.</Body>
    </Stack>
  ),
}
