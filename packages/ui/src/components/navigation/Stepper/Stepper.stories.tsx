import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Stack } from '#components/layout/Stack'
import { Stepper, type StepperStep } from './Stepper'

const signupSteps: StepperStep[] = [
  { value: 'you', label: 'You', description: 'Name and email' },
  { value: 'team', label: 'Team', description: 'Invite your colleagues' },
  { value: 'pay', label: 'Pay', description: 'Plan and card' },
  { value: 'review', label: 'Review', description: 'Confirm and submit' },
]

const meta = {
  title: 'UI/Navigation/Stepper',
  component: Stepper,
  args: { steps: signupSteps, value: 'team' },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A workspace sign-up flow — a step ahead is reachable once visited, none are skippable ahead. */
export const Registration: Story = {
  render: function Render() {
    const [value, setValue] = useState('team')
    return <Stepper steps={signupSteps} value={value} onStepSelect={setValue} />
  },
}

/** A step with an outstanding error — its glyph and label switch to the critical tone. */
export const WithErrorStep: Story = {
  args: {
    steps: signupSteps.map((step) =>
      step.value === 'pay' ? { ...step, status: 'error' as const } : step,
    ),
    value: 'review',
  },
}

/** The current step has errors (`invalid`): it stays the current step (`aria-current`) and takes the
 * critical tone, while a completed step that also has errors keeps its progress status. */
export const CurrentStepWithErrors: Story = {
  args: {
    steps: signupSteps.map((step) =>
      step.value === 'you' || step.value === 'pay' ? { ...step, invalid: true } : step,
    ),
    value: 'pay',
  },
}

/** Below `md`, the full rail collapses to a single announced line — the markup for both
 * always exists; CSS picks one per viewport width. */
export const CompactBelowMd: Story = {
  args: { compactBelow: 'md' },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div style={{ maxInlineSize: '18rem' }}>
      <Stepper {...args} />
    </div>
  ),
}

/** Static — no `onStepSelect` — for a read-only progress summary (e.g. an order status page). */
export const ReadOnly: Story = {
  args: {
    steps: [
      { value: 'placed', label: 'Placed', status: 'complete' },
      { value: 'packed', label: 'Packed', status: 'complete' },
      { value: 'shipped', label: 'Shipped', status: 'current' },
      { value: 'delivered', label: 'Delivered' },
    ],
    value: 'shipped',
  },
}

export const AllThemes: Story = {
  render: (args) => (
    <Stack gap={6}>
      <Stepper {...args} />
      <Stepper {...args} orientation="vertical" />
    </Stack>
  ),
}
