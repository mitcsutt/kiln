import { useEffect, useState } from 'react'

import { subscribeToReadings, type Kiln, type Reading } from '#features/firings/data/kilns'

/** Each kiln's latest temperature and status, starting from the loaded values and updated live. */
export function useLiveReadings(kilns: Kiln[]) {
  const [readings, setReadings] = useState<Record<string, Reading>>(() =>
    Object.fromEntries(
      kilns.map((kiln) => [kiln.id, { temperature: kiln.temperature, status: kiln.status }]),
    ),
  )
  useEffect(() => subscribeToReadings(setReadings), [])
  return readings
}
