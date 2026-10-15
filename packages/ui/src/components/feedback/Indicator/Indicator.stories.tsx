import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Avatar,
  Button,
  IconButton,
  Indicator,
  Inline,
  MessageIcon,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { must } from '#test/must'

const meta = {
  title: 'UI/Feedback/Indicator',
  component: Indicator,
  args: {
    label: '3 unread messages',
    count: 3,
    max: 99,
    tone: 'accent',
    position: 'top-end',
    shape: 'rect',
    processing: false,
    invisible: false,
    showZero: false,
    children: <IconButton label="Inbox" icon={<MessageIcon />} variant="outline" />,
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Indicator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * A count on a button. The mark is hidden from screen readers: `label` is added to the button's
 * description, so it's announced as "Inbox, 3 unread messages". A count over `max` reads "99+".
 */
export const Count: Story = {
  tags: ['docs'],
  render: function Count() {
    return (
      <Inline gap={6}>
        <Indicator count={3} label="3 unread messages">
          <IconButton label="Inbox" icon={<MessageIcon />} variant="outline" />
        </Indicator>
        <Indicator count={120} label="120 unread messages" tone="neutral">
          <IconButton label="Archive" icon={<MessageIcon />} variant="outline" />
        </Indicator>
        <Indicator count={4} label="4 waiting for review" tone="critical">
          <Button variant="outline" tone="neutral">
            Reviews
          </Button>
        </Indicator>
      </Inline>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Inbox' })).toHaveAccessibleDescription(
      '3 unread messages',
    )
    await expect(canvas.getByText('99+')).toBeVisible()
  },
}

/**
 * On a round child, `shape` keeps the mark on its outline instead of in the empty corner of its
 * box: `round` for a circle, `avatar` to follow the theme's avatar shape. `processing` pulses a
 * ring for something under way.
 */
export const OnAnAvatar: Story = {
  tags: ['docs'],
  render: function OnAnAvatar() {
    return (
      <Inline gap={6}>
        <Indicator shape="avatar" tone="critical" processing label="Waiting for your answer">
          <Avatar name="Rosa Delgado" size="lg" />
        </Indicator>
        <Indicator shape="avatar" tone="positive" position="bottom-end" label="Online">
          <Avatar name="Tomás Ferreira" size="lg" />
        </Indicator>
        <Indicator shape="avatar" swatch={4} position="bottom-end" label="On the platform team">
          <Avatar name="Ana Kovač" size="lg" />
        </Indicator>
      </Inline>
    )
  },
  play: async ({ canvasElement }) => {
    const mark = must(canvasElement.querySelector('[data-kind="swatch"]'), 'the swatch mark')
    const paint = (color: string) => {
      const probe = document.createElement('span')
      probe.style.backgroundColor = color
      mark.append(probe)
      const painted = getComputedStyle(probe).backgroundColor
      probe.remove()
      return painted
    }
    const shown = [mark, ...mark.querySelectorAll('*')].map(
      (el) => getComputedStyle(el).backgroundColor,
    )
    await expect(shown).toContain(paint('var(--color-cat-4)'))
    await expect(shown).not.toContain(paint('var(--color-accent)'))
  },
}

/**
 * `invisible` hides the mark and its description without remounting the child, and a count of
 * zero hides it unless you pass `showZero`. The count doesn't announce itself as it changes.
 */
export const Hiding: Story = {
  tags: ['docs'],
  render: function Hiding() {
    const [count, setCount] = useState(2)
    return (
      <Inline gap={5}>
        <Indicator count={count} label={`${String(count)} unread messages`}>
          <IconButton label="Inbox" icon={<MessageIcon />} variant="outline" />
        </Indicator>
        <Button
          variant="ghost"
          tone="neutral"
          onClick={() => {
            setCount(0)
          }}
        >
          Mark all read
        </Button>
      </Inline>
    )
  },
  play: async ({ canvas }) => {
    const inbox = canvas.getByRole('button', { name: 'Inbox' })
    await expect(inbox).toHaveAccessibleDescription('2 unread messages')
    await userEvent.click(canvas.getByRole('button', { name: 'Mark all read' }))
    await expect(canvas.queryByText('2')).toBeNull()
    await expect(inbox).not.toHaveAccessibleDescription()
  },
}

/**
 * A ghost `IconButton` draws only its glyph, so the corner of its box is empty. `offset` moves the
 * mark in toward the glyph by a space step.
 */
export const Offset: Story = {
  render: () => (
    <Inline gap={6}>
      <Indicator label="New activity">
        <IconButton label="Activity, no offset" icon={<MessageIcon />} />
      </Indicator>
      <Indicator label="New activity" offset={2}>
        <IconButton label="Activity, offset 2" icon={<MessageIcon />} />
      </Indicator>
      <Indicator shape="round" label="New activity">
        <IconButton
          label="Activity, round"
          icon={<MessageIcon />}
          shape="round"
          variant="outline"
        />
      </Indicator>
    </Inline>
  ),
}

/** Every tone, every corner and right-to-left. */
export const TonesAndPositions: Story = {
  render: () => (
    <Stack gap={6}>
      <Inline gap={6}>
        {(['neutral', 'accent', 'positive', 'caution', 'critical', 'info'] as const).map((tone) => (
          <Indicator key={tone} tone={tone} count={8} label={`8 ${tone}`}>
            <IconButton label={tone} icon={<MessageIcon />} variant="outline" />
          </Indicator>
        ))}
      </Inline>
      <Inline gap={6}>
        {(['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const).map((position) => (
          <Indicator key={position} position={position} label={position}>
            <IconButton label={position} icon={<MessageIcon />} variant="outline" />
          </Indicator>
        ))}
      </Inline>
      <Inline gap={6} dir="rtl">
        <Indicator count={12} label="12 unread messages">
          <IconButton label="Inbox, right to left" icon={<MessageIcon />} variant="outline" />
        </Indicator>
        <Text size="sm">top-end, right to left</Text>
      </Inline>
    </Stack>
  ),
}
