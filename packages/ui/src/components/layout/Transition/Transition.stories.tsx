import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Inline,
  Stack,
  Text,
  Transition,
  type TransitionPreset,
} from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Layout/Transition',
  component: Transition,
  args: {
    open: true,
    preset: 'slide-up',
    keepMounted: false,
    appear: true,
    children: (
      <Box padding={4} surface="raised" border radius="surface">
        <Text>Export ready: 1,284 rows from the March ledger.</Text>
      </Box>
    ),
  },
} satisfies Meta<typeof Transition>

export default meta
type Story = StoryObj<typeof meta>

/** Toggle `open` and try each `preset` in the controls. */
export const Playground: Story = {}

/**
 * A panel that opens because someone asked for it. `Transition` keeps it on screen until its exit
 * animation finishes, then unmounts it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [open, setOpen] = useState(false)
    return (
      <Stack gap={4} align="start">
        <Button
          variant="outline"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open)
          }}
        >
          {open ? 'Close support chat' : 'Chat with support'}
        </Button>
        <Transition open={open} preset="slide-up">
          <Card>
            <Card.Body>
              <Stack gap={2}>
                <Text weight="medium">Support, Harbour Works</Text>
                <Text tone="muted">
                  Two people online. Replies usually take about four minutes.
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        </Transition>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('button', { name: 'Chat with support' }))
    await waitFor(() => expect(canvas.getByText('Support, Harbour Works')).toBeVisible())
    await userEvent.click(canvas.getByRole('button', { name: 'Close support chat' }))
    await waitFor(() =>
      expect(canvas.queryByText('Support, Harbour Works')).not.toBeInTheDocument(),
    )
  },
}

const PRESETS: TransitionPreset[] = ['fade', 'slide-up', 'slide-down', 'scale', 'pop']

/**
 * Every preset fades; `slide-up` and `slide-down` travel a short way, `scale` grows a little and
 * `pop` lands on the theme's spring. Each takes its timing from the theme.
 */
export const Presets: Story = {
  tags: ['docs'],
  render: function Presets() {
    const [open, setOpen] = useState(true)
    return (
      <Stack gap={4} align="start">
        <Button
          variant="outline"
          onClick={() => {
            setOpen(!open)
          }}
        >
          {open ? 'Hide all' : 'Show all'}
        </Button>
        <Inline gap={3}>
          {PRESETS.map((preset) => (
            <Transition key={preset} open={open} preset={preset} keepMounted>
              <Box padding={4} surface="raised" border radius="surface">
                <Text>{preset}</Text>
              </Box>
            </Transition>
          ))}
        </Inline>
      </Stack>
    )
  },
}
