import { useEffect, useState } from 'react'

import { subscribeToReadings, type Kiln } from '#features/firings/data/kilns'

/** Each kiln's latest temperature, starting from the loaded values and updated live. */
export function useLiveReadings(kilns: Kiln[]) {
  const [readings, setReadings] = useState<Record<string, number>>(() =>
    Object.fromEntries(kilns.map((kiln) => [kiln.id, kiln.temperature])),
  )
  useEffect(() => subscribeToReadings(setReadings), [])
  return readings
}
