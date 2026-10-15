import type { ChartColor } from '#core/colors'
import { numericKeys, pivotRows, type ChartRow, type PivotOptions } from '#core/data'
import type { ValueFormat } from '#core/format'

/** A series a preset plots: the key of its values, and optionally its name, colour and format. */
export interface SeriesConfig {
  /** The key of this series' values in each row. */
  key: string
  /**
   * Its name in the legend, tooltip and table. Defaults to the `pivot` value as written, or a
   * readable form of a wide key.
   */
  label?: string
  /** A theme colour or any CSS colour. Defaults to the next categorical colour. */
  color?: ChartColor
  /** How to write this series' values, when it differs from the chart's `format`. */
  format?: ValueFormat
}

/**
 * The wide rows and series a preset plots: `pivot` applied, and the series given or, when none
 * are, every numeric key in the rows. A grouped "Other" series is neutral unless pinned.
 */
export function presetSeries(
  data: readonly ChartRow[],
  x: string | undefined,
  pivot: PivotOptions | undefined,
  series: readonly SeriesConfig[] | undefined,
): { rows: readonly ChartRow[]; series: SeriesConfig[] } {
  const pivoted = pivot ? pivotRows(data, x ?? '', pivot) : undefined
  const rows = pivoted?.rows ?? data
  const configs: SeriesConfig[] = series
    ? [...series]
    : (pivoted?.keys ?? numericKeys(rows, x ?? '')).map((key) => ({ key }))
  return {
    rows,
    series: configs.map((config) => {
      // A pivoted series is named by a value from the data, shown as written.
      const named = pivoted && config.label === undefined ? { ...config, label: config.key } : config
      return config.key === pivoted?.otherKey && config.color === undefined
        ? { ...named, color: 'neutral' }
        : named
    }),
  }
}

/** One named amount: a slice of a share, a row of a bar list. */
export interface Entry {
  key: string
  value: number
}

/**
 * Named amounts from rows: long rows through `pivot` (`by` names each entry, `value` holds its
 * amount, top 7 plus "Other" by default), or wide rows, whose numeric keys are the entries.
 * Amounts for the same name add up across rows.
 */
export function presetEntries(
  data: readonly ChartRow[],
  pivot: PivotOptions | undefined,
): { entries: Entry[]; otherKey?: string } {
  const pivoted = pivot ? pivotRows(data, '', pivot) : undefined
  const rows = pivoted?.rows ?? data
  const keys = pivoted?.keys ?? numericKeys(rows, '')
  const entries = keys.map((key) => {
    let value = 0
    for (const row of rows) {
      const amount = row[key]
      if (typeof amount === 'number' && Number.isFinite(amount)) value += amount
    }
    return { key, value }
  })
  return pivoted?.otherKey ? { entries, otherKey: pivoted.otherKey } : { entries }
}
