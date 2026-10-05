'use client'

import { Meter, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={5}>
      <Meter
        label="Ferry capacity"
        value={212}
        max={320}
        high={280}
        optimum={0}
        valueLabel="212 of 320 seats"
      />
      <Meter
        label="Timetable storage"
        value={86}
        max={90}
        high={80}
        optimum={0}
        valueLabel="86 GB of 90 GB"
      />
      <Meter label="Bike racks free" value={2} max={12} low={3} optimum={12} segments={12} />
    </Stack>
  )
}
