import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionBar, Button, Stack, Stepper, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import type { StepperStep } from './Stepper'

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

const STEPS = [
  { value: 'route', label: 'Route' },
  { value: 'passengers', label: 'Passengers' },
  { value: 'seats', label: 'Seats', description: 'Optional' },
  { value: 'pay', label: 'Pay' },
]

/**
 * Each step has a `value`, a `label`, an optional `description`, and a `status` (`complete`,
 * `current`, `upcoming` or `error`). With `onStepSelect`, completed steps become buttons that jump
 * back. `compactBelow` collapses it to "Step 2 of 4" on small screens; `orientation="vertical"`
 * stacks it for a sidebar.
 *
 * For a form split into steps with validation per step, use kiln-forms'
 * [FormSteps](/docs/forms/layouts/form-steps), which renders a `Stepper` for you.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [step, setStep] = useState('passengers')
    const index = STEPS.findIndex((s) => s.value === step)
    const steps = STEPS.map((s, i) => ({
      ...s,
      status:
        i < index
          ? ('complete' as const)
          : i === index
            ? ('current' as const)
            : ('upcoming' as const),
    }))
    return (
      <Stack gap={5}>
        <Stepper steps={steps} value={step} onStepSelect={setStep} compactBelow="sm" />
        <Text tone="muted">
          Step {index + 1}: {STEPS[index]?.label}
        </Text>
        <ActionBar align="between">
          <Button
            variant="ghost"
            tone="neutral"
            disabled={index === 0}
            onClick={() => {
              setStep(STEPS[index - 1]?.value ?? step)
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setStep(STEPS[index + 1]?.value ?? step)
            }}
          >
            {index === STEPS.length - 1 ? 'Pay £9.60' : 'Continue'}
          </Button>
        </ActionBar>
      </Stack>
    )
  },
}
