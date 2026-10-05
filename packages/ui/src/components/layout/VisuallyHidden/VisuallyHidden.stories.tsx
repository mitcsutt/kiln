import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, Text, VisuallyHidden } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'
import { Button } from '#components/actions/Button'
import { PlusIcon } from '#icons'
import { Body } from '#components/layout/_story/StoryKit'

const meta = {
  title: 'UI/Layout/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Open invoices', as: 'span', focusable: false },
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
      <VisuallyHidden>New invoice</VisuallyHidden>
    </Button>
  ),
}

/** `focusable` reveals the content while it has focus. Press Tab. */
export const SkipLink: Story = {
  render: () => (
    <Stack gap={3}>
      <VisuallyHidden as="a" href="#invoices" focusable>
        Skip to invoices
      </VisuallyHidden>
      <Body tone="muted">Press Tab to reveal the skip link above this line.</Body>
    </Stack>
  ),
}

/**
 * Screen readers announce the rating above as "4.2 out of 5, from 318 passenger reviews". `as`
 * renders it as another element, such as a heading (`as="h2"`). `focusable` makes a hidden link
 * appear when it receives focus, which is how a skip link works.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={2}>
        <Text numeric weight="strong">
          4.2
        </Text>
        <Text tone="muted" aria-hidden="true">
          ★
        </Text>
        <VisuallyHidden>out of 5, from 318 passenger reviews</VisuallyHidden>
      </Inline>
    )
  },
}
