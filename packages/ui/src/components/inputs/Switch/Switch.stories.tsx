import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Switch } from './Switch'

const meta = {
  title: 'UI/Inputs/Switch',
  component: Switch,
  args: { label: 'Repeats every month', size: 'md', disabled: false, invalid: false },
  argTypes: { label: { control: 'text' } },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Repeats every month' })
    await expect(toggle).not.toBeChecked()
    await userEvent.click(toggle)
    await expect(toggle).toBeChecked()
  },
}

export const States: Story = {
  render: () => (
    <Inline gap={5}>
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Disabled" disabled />
      <Switch aria-label="Disabled on" disabled defaultChecked />
      <Switch aria-label="Small" size="sm" defaultChecked />
    </Inline>
  ),
}

/** Settings that apply immediately — the case a switch is for. */
export const Settings: Story = {
  render: () => (
    <Stack gap={4}>
      <Switch label="Email me when my club kicks off" defaultChecked />
      <Switch label="Show other members' reactions" defaultChecked />
      <Switch label="Reduce motion on the table" />
    </Stack>
  ),
}
