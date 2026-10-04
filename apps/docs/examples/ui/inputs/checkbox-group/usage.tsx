'use client'

import { CheckboxGroup } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <CheckboxGroup
      aria-label="Facilities"
      columns={{ base: 1, sm: 2 }}
      selectAllLabel="All facilities"
      defaultValue={['step-free']}
      options={[
        { value: 'step-free', label: 'Step-free access' },
        { value: 'toilets', label: 'Toilets' },
        { value: 'bikes', label: 'Bike racks' },
        { value: 'cafe', label: 'Café', description: 'Open until 18:00' },
      ]}
    />
  )
}
