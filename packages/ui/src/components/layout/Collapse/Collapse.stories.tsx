import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, Collapse, Stack, SwitchField, Text, TextField } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Layout/Collapse',
  component: Collapse,
  args: { open: true, keepMounted: true },
  render: (args) => (
    <Collapse {...args}>
      <Text>
        Late fees start seven days after the due date, at 2% of the unpaid amount each month.
      </Text>
    </Collapse>
  ),
} satisfies Meta<typeof Collapse>

export default meta
type Story = StoryObj<typeof meta>

/** Toggle `open` in the controls to watch the height move. */
export const Playground: Story = {}

/**
 * Something else decides whether the content shows: here, a switch reveals the field it turns on.
 * Point the control's `aria-controls` at the `Collapse`'s `id` so assistive technology knows
 * what it opens.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [custom, setCustom] = useState(false)
    return (
      <Stack gap={4}>
        <SwitchField
          label="Use a custom domain"
          description="Invoices link to your own address instead of ours."
          checked={custom}
          onCheckedChange={setCustom}
          aria-controls="custom-domain"
        />
        <Collapse open={custom} id="custom-domain">
          <TextField label="Domain" placeholder="billing.harbourworks.co" />
        </Collapse>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.queryByRole('textbox', { name: 'Domain' })).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('switch', { name: /custom domain/ }))
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Domain' })).toBeVisible())
    await userEvent.click(canvas.getByRole('switch', { name: /custom domain/ }))
    await waitFor(() =>
      expect(canvas.queryByRole('textbox', { name: 'Domain' })).not.toBeInTheDocument(),
    )
  },
}

/**
 * With `keepMounted={false}` the content unmounts once it has closed, so its state starts fresh
 * the next time it opens. By default it stays in the page, hidden, and keeps what was typed.
 */
export const Unmounting: Story = {
  tags: ['docs'],
  render: function Unmounting() {
    const [open, setOpen] = useState(false)
    return (
      <Stack gap={3} align="start">
        <Button
          variant="outline"
          aria-expanded={open}
          aria-controls="delivery-note"
          onClick={() => {
            setOpen(!open)
          }}
        >
          {open ? 'Remove delivery note' : 'Add a delivery note'}
        </Button>
        <Collapse open={open} keepMounted={false} id="delivery-note">
          <TextField label="Delivery note" description="Shown to the courier at the door." />
        </Collapse>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const toggle = canvas.getByRole('button', { name: 'Add a delivery note' })
    await userEvent.click(toggle)
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Delivery note' })).toBeVisible(),
    )
    const collapse = storyRoot(canvasElement).querySelector<HTMLElement>('#delivery-note')
    if (!collapse) throw new Error('No Collapse')
    await waitFor(() => expect(collapse).not.toHaveAttribute('data-animating'))
    const full = collapse.getBoundingClientRect().height
    await userEvent.click(canvas.getByRole('button', { name: 'Remove delivery note' }))
    // Closing shrinks the height a frame at a time rather than snapping straight to 0.
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const closing = collapse.getBoundingClientRect().height
    await expect(closing).toBeGreaterThan(0)
    await expect(closing).toBeLessThanOrEqual(full)
    await waitFor(() =>
      expect(canvas.queryByRole('textbox', { name: 'Delivery note' })).not.toBeInTheDocument(),
    )
  },
}
