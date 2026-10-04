'use client'

import { ChipGroup, Fieldset } from '@mitcsutt/kiln-ui'

export default function Invalid() {
  return (
    <Fieldset legend="Days you travel" error="Pick at least one day">
      <ChipGroup
        type="multiple"
        size="sm"
        options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
          value: day.toLowerCase(),
          label: day,
        }))}
      />
    </Fieldset>
  )
}
