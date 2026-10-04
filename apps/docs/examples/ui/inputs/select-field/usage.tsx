'use client'

import { SelectField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <SelectField
      label="Home station"
      description="We'll show its departures first"
      placeholder="Choose a station"
      options={[
        { value: 'harbour', label: 'Harbour Square' },
        { value: 'kelso', label: 'Kelso Bay Pier' },
        { value: 'marram', label: 'Marram Point' },
      ]}
    />
  )
}
