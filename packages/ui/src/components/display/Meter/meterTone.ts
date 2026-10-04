export interface MeterThresholds {
  min?: number
  max?: number
  /** Upper bound of the "low" region. */
  low?: number
  /** Lower bound of the "high" region. */
  high?: number
  /** Where the good value lives. Below `low` = less is better (a budget); above `high` = more is better (savings). */
  optimum?: number
}

/**
 * The tone `<meter>` would pick. Unlike the element, a value past `max` still counts as
 * being in the region past `high` — an overspent budget must not read as "fine".
 */
export function meterTone(
  value: number,
  t: MeterThresholds = {},
): 'positive' | 'caution' | 'critical' {
  const min = t.min ?? 0
  const max = Math.max(t.max ?? 1, min)
  const low = Math.min(Math.max(t.low ?? min, min), max)
  const high = Math.min(Math.max(t.high ?? max, low), max)
  const optimum = Math.min(Math.max(t.optimum ?? (min + max) / 2, min), max)

  const region = (v: number) => (v < low ? 0 : v > high ? 2 : 1)
  const distance = Math.abs(region(value) - region(optimum))
  return distance === 0 ? 'positive' : distance === 1 ? 'caution' : 'critical'
}
