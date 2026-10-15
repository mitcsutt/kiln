import { toDate } from '#core/format'

/** One row of chart data: an x value and a value per series, keyed by name. */
export type ChartRow = Readonly<Record<string, unknown>>

/**
 * Turns long rows (one row per x and series) into wide ones (one row per x, a key per series).
 * Pass it to a chart as `pivot` when your data looks like
 * `{ month: 'Mar', region: 'North', sales: 120 }`.
 */
export interface PivotOptions {
  /**
   * The key whose values become the series (`'region'`). Its values name them as written
   * (`'iOS'` stays `'iOS'`); only wide keys are made readable.
   */
  by: string
  /** The key that holds each series' value (`'sales'`). */
  value: string
  /**
   * How many series to keep before grouping the rest as one "Other" series. They are ranked by
   * their total. With 8 or fewer there's nothing to group. `false` keeps every series.
   * @defaultValue 7
   */
  limit?: number | false
  /**
   * The name of the grouped series, which the chart colours neutral.
   * @defaultValue 'Other'
   */
  other?: string
}

/** Wide rows and the series keys found in them, largest first. */
export interface PivotResult {
  rows: ChartRow[]
  keys: string[]
  /** The key of the grouped series, when there is one. */
  otherKey?: string
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** The identity of an x value for grouping and matching: a date by its time, anything else as text. */
export function xIdentity(value: unknown): string {
  const date = value instanceof Date ? value : undefined
  if (date) return `d${String(date.getTime())}`
  return typeof value === 'string' || typeof value === 'number' ? `v${String(value)}` : 'v'
}

/** A series name from the `by` value of a long row. */
function seriesName(key: unknown): string {
  if (typeof key === 'string') return key
  return typeof key === 'number' || typeof key === 'boolean' ? String(key) : ''
}

export function pivotRows(
  rows: readonly ChartRow[],
  x: string,
  options: PivotOptions,
): PivotResult {
  const { by, value, limit = 7, other = 'Other' } = options
  const totals = new Map<string, number>()
  for (const row of rows) {
    const key = row[by]
    if (key === null || key === undefined) continue
    const name = seriesName(key)
    const amount = row[value]
    totals.set(name, (totals.get(name) ?? 0) + (isNumber(amount) ? Math.abs(amount) : 0))
  }
  // Largest total first; a stable sort keeps first-seen order for ties.
  const ranked = [...totals.keys()].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0))
  const grouped = limit !== false && ranked.length > limit + 1
  const kept = grouped ? ranked.slice(0, limit) : ranked
  const keep = new Set(kept)

  const wide = new Map<string, Record<string, unknown>>()
  for (const row of rows) {
    const id = xIdentity(row[x])
    let target = wide.get(id)
    if (!target) {
      target = { [x]: row[x] }
      wide.set(id, target)
    }
    const key = row[by]
    if (key === null || key === undefined) continue
    const name = seriesName(key)
    const series = keep.has(name) ? name : other
    const amount = row[value]
    if (!isNumber(amount)) continue
    const before = target[series]
    target[series] = (isNumber(before) ? before : 0) + amount
  }
  return {
    rows: [...wide.values()],
    keys: grouped ? [...kept, other] : kept,
    ...(grouped ? { otherKey: other } : {}),
  }
}

/** The keys that hold numbers, other than `x`, in the order they first appear. */
export function numericKeys(rows: readonly ChartRow[], x: string): string[] {
  const keys = new Set<string>()
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key !== x && isNumber(value)) keys.add(key)
    }
  }
  return [...keys]
}

/**
 * A readable name from a data key: `unitsSold` and `units_sold` read "Units sold". A key that
 * already reads as a name (`North`, `Harbour Street`) stays as it is.
 */
export function humanise(key: string): string {
  if (!/^[a-z]/.test(key) || /\s/.test(key)) return key
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim()
  if (spaced === '') return key
  const lower = spaced.replace(/\b[A-Z](?=[a-z])/g, (letter) => letter.toLowerCase())
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/** Whether every present x value is a date (a `Date` or an ISO 8601 string). */
export function isTimeAxis(rows: readonly ChartRow[], x: string): boolean {
  let seen = false
  for (const row of rows) {
    const value = row[x]
    if (value === null || value === undefined) continue
    if (!toDate(value)) return false
    seen = true
  }
  return seen
}

/** A series as the summary and the data table read it. */
export interface DescribedSeries {
  key: string
  label: string
  format: (value: unknown) => string
}

/** The hidden data table: a header per column and one row per x value. */
export interface ChartTable {
  columns: string[]
  rows: string[][]
}

export function tableOf(
  rows: readonly ChartRow[],
  x: string,
  xLabel: string,
  formatX: (value: unknown) => string,
  series: readonly DescribedSeries[],
): ChartTable {
  return {
    columns: [xLabel, ...series.map((s) => s.label)],
    rows: rows.map((row) => [formatX(row[x]), ...series.map((s) => s.format(row[s.key]))]),
  }
}

/**
 * A plain-language summary of what the chart shows: how many series and points, the range of x,
 * and each series' lowest and highest value. It's the chart's accessible description unless you
 * write your own.
 */
export function summarise(
  rows: readonly ChartRow[],
  x: string,
  formatX: (value: unknown) => string,
  series: readonly DescribedSeries[],
): string {
  if (rows.length === 0 || series.length === 0) return 'No data.'
  const first = formatX(rows[0]?.[x])
  const last = formatX(rows.at(-1)?.[x])
  const points = rows.length === 1 ? '1 point' : `${String(rows.length)} points`
  const over = rows.length === 1 ? `${points}, ${first}.` : `${points}, from ${first} to ${last}.`
  const names = series.length === 1 ? '1 series' : `${String(series.length)} series`
  const sentences = [`${names} over ${over}`]
  for (const s of series) {
    let low: { value: number; at: unknown } | undefined
    let high: { value: number; at: unknown } | undefined
    for (const row of rows) {
      const value = row[s.key]
      if (!isNumber(value)) continue
      if (!low || value < low.value) low = { value, at: row[x] }
      if (!high || value > high.value) high = { value, at: row[x] }
    }
    if (!low || !high) {
      sentences.push(`${s.label} has no values.`)
    } else if (low.value === high.value) {
      sentences.push(`${s.label} is ${s.format(low.value)} throughout.`)
    } else {
      sentences.push(
        `${s.label} ranges from ${s.format(low.value)} (${formatX(low.at)}) to ${s.format(high.value)} (${formatX(high.at)}).`,
      )
    }
  }
  return sentences.join(' ')
}
