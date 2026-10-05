import { DateRangeField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <DateRangeField
      label="Travel dates"
      description="Up to 14 days"
      startLabel="First day"
      endLabel="Last day"
      min="2026-10-01"
      defaultValue={{ start: '2026-10-14', end: '2026-10-18' }}
    />
  )
}
