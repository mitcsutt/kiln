import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpRightIcon, Button, Inline, PlusIcon, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const meta = {
  title: 'UI/Actions/Button',
  component: Button,
  args: { children: 'Send invoice', variant: 'solid', tone: 'accent', size: 'md' },
  argTypes: {
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Every prop as a control. */
export const Playground: Story = {}

/**
 * One solid button per view: it _is_ the primary action. Secondary actions are `outline`, and
 * the quiet ones (cancel, dismiss) are `ghost`. Labels are specific verbs: "Publish
 * timetable", not "Submit"; "Export CSV", not "Learn more".
 */
export const Hierarchy: Story = {
  tags: ['docs'],
  render: () => (
    <Inline gap={3}>
      <Button>Publish timetable</Button>
      <Button variant="outline" tone="neutral">
        Export CSV
      </Button>
      <Button variant="ghost" tone="neutral">
        Cancel
      </Button>
    </Inline>
  ),
}

/**
 * `accent` (the default) is the theme's action colour. `neutral` is ink, for actions that
 * shouldn't compete. `critical` is for destructive actions only, and works best behind a
 * confirmation.
 */
export const Tones: Story = {
  tags: ['docs'],
  render: () => (
    <Stack gap={4}>
      {(['accent', 'neutral', 'critical'] as const).map((tone) => (
        <Inline key={tone} gap={3}>
          <Button tone={tone}>Solid</Button>
          <Button tone={tone} variant="outline">
            Outline
          </Button>
          <Button tone={tone} variant="ghost">
            Ghost
          </Button>
        </Inline>
      ))}
    </Stack>
  ),
}

/**
 * `sm`, `md` (the default) and `lg` share the control heights with inputs and selects, so a
 * button lines up with a field of the same size.
 */
export const Sizes: Story = {
  tags: ['docs'],
  render: () => (
    <Inline gap={3}>
      <Button size="sm">Book a seat</Button>
      <Button size="md">Book a seat</Button>
      <Button size="lg">Book a seat</Button>
    </Inline>
  ),
}

/**
 * `leadingIcon` and `trailingIcon` take any icon. Use a trailing icon only when it adds
 * meaning, like an external link, never a decorative arrow. With `asChild`, the button renders
 * its child (an `<a>`, or your router's link) and merges its styles onto it:
 *
 * ```tsx
 * import NextLink from 'next/link'
 *
 * ;<Button asChild>
 *   <NextLink href="/routes/new">Plan a route</NextLink>
 * </Button>
 * ```
 */
export const IconsAndLinks: Story = {
  tags: ['docs'],
  render: () => (
    <Inline gap={3}>
      <Button leadingIcon={<PlusIcon />}>Add a stop</Button>
      <Button asChild variant="outline" tone="neutral" trailingIcon={<ArrowUpRightIcon />}>
        <a href="https://github.com/mitcsutt/kiln">Source on GitHub</a>
      </Button>
    </Inline>
  ),
}

/**
 * `loading` shows a spinner, sets `aria-busy` and ignores presses while keeping the button's
 * width, so the layout doesn't jump. Press the first button to see it.
 *
 * Avoid `disabled` on a form's submit button: a disabled button can't be focused, so keyboard
 * and screen reader users never learn why they can't continue. kiln-forms' `SubmitButton` uses
 * `aria-disabled` with a reason instead.
 */
export const LoadingAndDisabled: Story = {
  tags: ['docs'],
  render: function LoadingAndDisabled() {
    const [saving, setSaving] = useState(false)
    return (
      <Inline gap={3}>
        <Button
          loading={saving}
          onClick={() => {
            setSaving(true)
            setTimeout(() => {
              setSaving(false)
            }, 1500)
          }}
        >
          Save route
        </Button>
        <Button disabled>Sold out</Button>
        <Button variant="outline" disabled>
          Sold out
        </Button>
      </Inline>
    )
  },
}
