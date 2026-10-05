import { CheckIcon, Inline, ToggleChip } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Filters() {
  const [step, setStep] = useState(true)
  const [night, setNight] = useState(false)
  const [bikes, setBikes] = useState(false)
  return (
    <Inline gap={2}>
      <ToggleChip pressed={step} onPressedChange={setStep} count={14}>
        Step-free
      </ToggleChip>
      <ToggleChip pressed={night} onPressedChange={setNight} count={5}>
        Runs at night
      </ToggleChip>
      <ToggleChip pressed={bikes} onPressedChange={setBikes}>
        Bikes allowed
      </ToggleChip>
    </Inline>
  )
}

export function States() {
  return (
    <Inline gap={2}>
      <ToggleChip size="sm">Small</ToggleChip>
      <ToggleChip>Off</ToggleChip>
      <ToggleChip defaultPressed>On</ToggleChip>
      <ToggleChip defaultPressed icon={<CheckIcon />}>
        Verified
      </ToggleChip>
      <ToggleChip disabled count={0}>
        Suspended
      </ToggleChip>
    </Inline>
  )
}
