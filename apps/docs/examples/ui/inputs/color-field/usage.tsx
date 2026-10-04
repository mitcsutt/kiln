'use client'

import { ColorField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <ColorField
      label="Line colour"
      description="Used on the map and in the timetable"
      defaultValue="#1f6f8b"
      swatches={[
        { value: '#1f6f8b', label: 'Harbour blue' },
        { value: '#2e8b57', label: 'Coastal green' },
        { value: '#c4553d', label: 'Signal red' },
      ]}
    />
  )
}
