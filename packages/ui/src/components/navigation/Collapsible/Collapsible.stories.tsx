import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Button,
  Collapsible,
  DataList,
  NumberField,
  Stack,
  Text,
  TextField,
} from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Navigation/Collapsible',
  component: Collapsible,
  args: { defaultOpen: false, disabled: false },
  render: (args) => (
    <Collapsible {...args}>
      <Collapsible.Trigger>How the late fee is worked out</Collapsible.Trigger>
      <Collapsible.Content>
        <Text tone="muted">
          2% of the unpaid amount for each month past the due date, starting on day eight.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  ),
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

/** One trigger, one block of content. */
export const Playground: Story = {}

/**
 * Settings most people never change, tucked under one trigger. The trigger says what's inside, so
 * someone scanning the form knows whether to open it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Stack gap={4}>
      <TextField label="Webhook URL" placeholder="https://hooks.harbourworks.co/orders" />
      <Collapsible>
        <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
        <Collapsible.Content>
          <Stack gap={4}>
            <NumberField label="Retry attempts" defaultValue={5} min={0} max={10} />
            <TextField label="Signing secret" description="Sent in the X-Signature header." />
          </Stack>
        </Collapsible.Content>
      </Collapsible>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const trigger = canvas.getByRole('button', { name: 'Advanced options' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Signing secret' })).toBeVisible(),
    )
  },
}

/**
 * Pass your own control to `Collapsible.Trigger` with `asChild`. It keeps its look and gets
 * `aria-expanded`, `aria-controls` and the toggle.
 */
export const OwnTrigger: Story = {
  tags: ['docs'],
  render: () => (
    <Collapsible>
      <Stack gap={3} align="start">
        <Collapsible.Trigger asChild>
          <Button variant="ghost" size="sm">
            Show order details
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <DataList>
            <DataList.Item label="Order">HW-20418</DataList.Item>
            <DataList.Item label="Placed">12 March, 09:40</DataList.Item>
            <DataList.Item label="Ships from">Leith warehouse</DataList.Item>
          </DataList>
        </Collapsible.Content>
      </Stack>
    </Collapsible>
  ),
}
