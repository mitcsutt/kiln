'use client'

import { Select } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Select
      aria-label="Ticket type"
      placeholder="Choose a ticket"
      groups={[
        {
          label: 'Single journeys',
          options: [
            { value: 'single', label: 'Single' },
            { value: 'return', label: 'Return' },
          ],
        },
        {
          label: 'Passes',
          options: [
            { value: 'day', label: 'Day pass' },
            { value: 'week', label: 'Week pass' },
            { value: 'annual', label: 'Annual pass', disabled: true },
          ],
        },
      ]}
    />
  )
}
