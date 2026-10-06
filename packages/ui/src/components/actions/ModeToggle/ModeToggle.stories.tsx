import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, ModeToggle, Stack } from '@mitcsutt/kiln-ui'

/**
 * Needs a ThemeProvider (Storybook's decorator supplies one). In the story frame the
 * toolbar owns the real `data-mode`, so these toggles change their own state only.
 */
const meta = {
  title: 'UI/Actions/ModeToggle',
  component: ModeToggle,
  args: { variant: 'icon', size: 'md', iconOnly: false },
} satisfies Meta<typeof ModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A header control: one quiet button that cycles. */
export const Icon: Story = {
  render: () => (
    <Inline gap={3}>
      <ModeToggle size="sm" />
      <ModeToggle />
      <ModeToggle buttonVariant="outline" />
    </Inline>
  ),
}

/** Every mode on show, for a settings page or the site footer. */
export const Segmented: Story = {
  render: () => (
    <Stack gap={4} align="start">
      <ModeToggle variant="segmented" />
      <ModeToggle variant="segmented" iconOnly size="sm" />
    </Stack>
  ),
}

/**
 * The toggles above change these docs' real mode. `variant="icon"` (the default) is one quiet
 * button that cycles light, dark and system; its icon shows the current mode, and its accessible
 * name says what a press switches to. `variant="segmented"` shows all three at once, for a
 * settings page or a footer.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={5} align="start">
        <Inline gap={3}>
          <ModeToggle size="sm" />
          <ModeToggle />
          <ModeToggle buttonVariant="outline" />
        </Inline>
        <ModeToggle variant="segmented" />
        <ModeToggle variant="segmented" iconOnly size="sm" />
      </Stack>
    )
  },
}
