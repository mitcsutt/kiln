import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Flash, List, Numeral, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Feedback/Flash',
  component: Flash,
  args: {
    value: 0,
    children: <p>Kelso Bay 0, North Point 0</p>,
  },
} satisfies Meta<typeof Flash>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Wrap the element that changes and pass what changed as `value`: here, each goal flashes the
 * match's row. The first render doesn't flash, only changes after it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [goals, setGoals] = useState(0)
    return (
      <Stack gap={4} align="start">
        <List>
          <Flash value={goals}>
            <List.Item>
              <List.Content>Kelso Bay v North Point</List.Content>
              <List.Trailing>
                <Numeral value={goals} /> – <Numeral value={0} />
              </List.Trailing>
            </List.Item>
          </Flash>
          <List.Item>
            <List.Content>Harbour Square v Mill Lane</List.Content>
            <List.Trailing>
              <Numeral value={1} /> – <Numeral value={1} />
            </List.Trailing>
          </List.Item>
        </List>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            setGoals((n) => n + 1)
          }}
        >
          Kelso Bay score
        </Button>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const row = canvas.getByText('Kelso Bay v North Point').closest('li')
    await expect(row).not.toHaveAttribute('data-flash')
    await userEvent.click(canvas.getByRole('button', { name: 'Kelso Bay score' }))
    await expect(row).toHaveAttribute('data-flash', 'odd')
    await waitFor(() => expect(getComputedStyle(row as Element).animationName).not.toBe('none'))
  },
}

/**
 * `appear` flashes an element once when it mounts, for a row that's new because of a change. It
 * never flashes during the page's first render, so pass it only to rows that are new.
 */
export const NewRows: Story = {
  name: 'New rows',
  tags: ['docs'],
  render: function NewRows() {
    const [scorers, setScorers] = useState(['Ines Moreau 12′'])
    return (
      <Stack gap={4} align="start">
        <List density="compact">
          {scorers.map((scorer, index) => (
            <Flash key={scorer} appear={index > 0}>
              <List.Item>
                <List.Content>{scorer}</List.Content>
              </List.Item>
            </Flash>
          ))}
        </List>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            setScorers((list) => [...list, `Theo Brandt ${String(30 + list.length * 7)}′`])
          }}
        >
          Add a goal
        </Button>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByText('Ines Moreau 12′').closest('li')).not.toHaveAttribute(
      'data-flash',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add a goal' }))
    await expect(canvas.getByText('Theo Brandt 37′').closest('li')).toHaveAttribute(
      'data-flash',
      'odd',
    )
  },
}

/**
 * A link to an element's `id` flashes it when it opens, with no `value` needed: the element is
 * the URL's `#target`. Give the element an `id` and link to it. A client-side router changes the
 * URL without updating `:target`, so there pass `target`, true when the route's hash is this
 * element's: `target={hash === 'sailing-0735'}`.
 */
export const LinkedTarget: Story = {
  name: 'Linked target',
  tags: ['docs'],
  render: function LinkedTarget() {
    return (
      <Stack gap={4} align="start">
        <a href="#sailing-0735">Jump to the 07:35 sailing</a>
        <Flash>
          <p id="sailing-0735">07:35 from Kelso Bay, calling at Harbour Square</p>
        </Flash>
      </Stack>
    )
  },
}
