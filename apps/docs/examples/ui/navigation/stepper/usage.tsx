'use client'

import { ActionBar, Button, Stack, Stepper, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const STEPS = [
  { value: 'route', label: 'Route' },
  { value: 'passengers', label: 'Passengers' },
  { value: 'seats', label: 'Seats', description: 'Optional' },
  { value: 'pay', label: 'Pay' },
]

export default function Usage() {
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
}
