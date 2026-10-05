import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, Switch } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Inline } from '#components/layout/Inline'

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
    const toggle = within(storyRoot(canvasElement)).getByRole('switch', {
      name: 'Repeats every month',
    })
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
      <Switch label="Email me when a release ships" defaultChecked />
      <Switch label="Show other members' comments" defaultChecked />
      <Switch label="Reduce motion on the board" />
    </Stack>
  ),
}

/**
 * Alerts that turn on and off at once, a small switch and a disabled one.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [alerts, setAlerts] = useState(true)
    return (
      <Stack gap={4}>
        <Switch label="Delay alerts" checked={alerts} onCheckedChange={setAlerts} />
        <Switch label="Quiet hours" size="sm" />
        <Switch label="Share my location" disabled />
      </Stack>
    )
  },
}
