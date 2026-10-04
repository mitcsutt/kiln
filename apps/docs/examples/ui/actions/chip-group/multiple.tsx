'use client'

import { ChipGroup, Fieldset } from '@mitcsutt/kiln-ui'

const ALERTS = [
  { value: 'delays', label: 'Delays', count: 12 },
  { value: 'platform', label: 'Platform changes', count: 4 },
  { value: 'cancellations', label: 'Cancellations', count: 2 },
  { value: 'works', label: 'Planned works' },
  { value: 'strikes', label: 'Industrial action', disabled: true },
]

export default function Multiple() {
  return (
    <Fieldset legend="Service alerts" description="Sent to your phone for saved routes">
      <ChipGroup type="multiple" name="alerts" options={ALERTS} defaultValue={['delays']} />
    </Fieldset>
  )
}
