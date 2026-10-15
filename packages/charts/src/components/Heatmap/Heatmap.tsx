import { VisuallyHidden, cx } from '@mitcsutt/kiln-ui'
import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { ChartFrame, type ChartStatus } from '#components/ChartFrame/ChartFrame'
import { ChartTooltip } from '#components/ChartTooltip/ChartTooltip'
import { Swatch } from '#components/internal/Swatch/Swatch'
import type { ChartColor } from '#core/colors'
import { numericKeys, pivotRows, type ChartRow, type PivotOptions } from '#core/data'
import { valueFormatter, xFormatter, type ValueFormat, type XFormat } from '#core/format'
import { cssVars } from '#core/style'

import styles from './Heatmap.module.css'

export interface HeatmapProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The rows of cells. Wide: one row per heatmap row, with its label under `x` and a key per
   * column (`{ day: 'Mon', '09': 4, '10': 12 }`). Long: one row per cell, with `pivot`.
   */
  data: readonly ChartRow[]
  /** The key of each row's label: a category, or a date. */
  x: string
  /** Long rows: `by` names each cell's column and `value` holds its amount. Every column is kept. */
  pivot?: PivotOptions
  /**
   * The columns to show, in order. Defaults to every numeric key in the order JavaScript lists
   * them, which puts keys that look like whole numbers (`'12'`) first: pass `columns` for hours.
   */
  columns?: readonly string[]
  /** Names for the columns, by key. Defaults to each key as written. */
  columnLabels?: Readonly<Record<string, string>>
  /** The heatmap's accessible name, such as "Orders by hour and day". */
  label: string
  /** What the data says. Defaults to the range of values and where the highest is. */
  summary?: string
  /**
   * `sequential` for amounts (more is darker in light mode); `diverging` for values either side
   * of `midpoint`, such as change against last week. @defaultValue 'sequential'
   */
  scale?: 'sequential' | 'diverging'
  /** The values the colour runs between. Defaults to the data's range. */
  domain?: readonly [number, number]
  /** The neutral middle of a diverging scale. @defaultValue 0 */
  midpoint?: number
  /** Show the colour key under the cells. @defaultValue true */
  legend?: boolean
  /** How to write values. @defaultValue 'number' */
  format?: ValueFormat
  /** How to write row labels that are dates. @defaultValue 'date' */
  xFormat?: XFormat
  locale?: string
  timeZone?: string
  status?: ChartStatus
  emptyMessage?: ReactNode
  errorMessage?: ReactNode
  action?: ReactNode
}

const SEQUENTIAL = [1, 2, 3, 4, 5, 6, 7] as const
const DIVERGING = ['neg-3', 'neg-2', 'neg-1', 'mid', 'pos-1', 'pos-2', 'pos-3'] as const

/** The ramp step for a value: one of seven, by where it sits in the domain. */
function stepOf(
  value: number,
  scale: 'sequential' | 'diverging',
  [low, high]: readonly [number, number],
  midpoint: number,
): ChartColor {
  if (scale === 'sequential') {
    const t = high === low ? 1 : (value - low) / (high - low)
    const index = Math.min(6, Math.max(0, Math.floor(t * 7)))
    return `seq-${String(SEQUENTIAL[index] ?? 1)}` as ChartColor
  }
  const reach = Math.max(Math.abs(high - midpoint), Math.abs(midpoint - low))
  const t = reach === 0 ? 0 : (value - midpoint) / reach
  const index = Math.min(6, Math.max(0, Math.round(t * 3) + 3))
  return `div-${DIVERGING[index] ?? 'mid'}` as ChartColor
}

interface Cell {
  row: number
  column: number
}

/** A cell whose tooltip shows, and where: the middle of its top edge, in the scroll box. */
interface ShownCell extends Cell {
  left: number
  top: number
}

const shownAt = (cell: HTMLElement, row: number, column: number): ShownCell => ({
  row,
  column,
  left: cell.offsetLeft + cell.offsetWidth / 2,
  top: cell.offsetTop,
})

/**
 * A grid of cells coloured by amount, for patterns across two categories: orders by hour and
 * day, incidents by service and week.
 *
 * @remarks
 * Each row of data is a row of cells, and each column key a column. Colours come from the
 * theme's ramps, never the categorical colours: `sequential` for amounts, where more data sits
 * further from the page, and `diverging` for values either side of a `midpoint`, where the
 * middle is neutral. A key under the cells shows the scale.
 *
 * The heatmap is an HTML table, so it renders completely on the server and a screen reader
 * reads it as one, with row and column headers. Hover a cell, or focus the grid and move with
 * the arrow keys, to see its value in a tooltip. Home and End go to the ends of a row.
 */
export const Heatmap = forwardRef<HTMLElement, HeatmapProps>(function Heatmap(
  {
    data,
    x,
    pivot,
    columns: givenColumns,
    columnLabels,
    label,
    summary,
    scale = 'sequential',
    domain: givenDomain,
    midpoint = 0,
    legend = true,
    format = 'number',
    xFormat,
    locale,
    timeZone,
    status,
    emptyMessage,
    errorMessage,
    action,
    className,
    ...rest
  },
  ref,
) {
  const rows = useMemo(
    () => (pivot ? pivotRows(data, x, { limit: false, ...pivot }).rows : data),
    [data, x, pivot],
  )
  const columns = givenColumns ?? numericKeys(rows, x)
  const formatValue = useMemo(() => valueFormatter(format, { locale }), [format, locale])
  const formatX = useMemo(
    () => xFormatter(xFormat, { locale, timeZone }),
    [xFormat, locale, timeZone],
  )
  const columnName = (key: string) => columnLabels?.[key] ?? key

  const valueAt = (row: ChartRow | undefined, column: string | undefined) => {
    const value = row && column !== undefined ? row[column] : undefined
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  }
  let low = Infinity
  let high = -Infinity
  let peak: { row: ChartRow; column: string; value: number } | undefined
  for (const row of rows) {
    for (const column of columns) {
      const value = valueAt(row, column)
      if (value === undefined) continue
      low = Math.min(low, value)
      if (value > high) peak = { row, column, value }
      high = Math.max(high, value)
    }
  }
  const empty = !peak
  const domain: readonly [number, number] = givenDomain ?? (empty ? [0, 0] : [low, high])

  const description =
    summary ??
    (peak
      ? `${String(rows.length)} rows by ${String(columns.length)} columns. Values run from ${formatValue(low)} to ${formatValue(high)}, highest at ${formatX(peak.row[x])}, ${columnName(peak.column)}.`
      : 'No data.')

  // One cell is the grid's tab stop; the arrow keys move it.
  const [focus, setFocus] = useState<Cell>({ row: 0, column: 0 })
  const [shown, setShown] = useState<ShownCell | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const move = (to: Cell) => {
    const row = Math.min(rows.length - 1, Math.max(0, to.row))
    const column = Math.min(columns.length - 1, Math.max(0, to.column))
    tableRef.current
      ?.querySelector<HTMLElement>(`[data-cell="${String(row)}:${String(column)}"]`)
      ?.focus()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const moves: Record<string, Cell> = {
      ArrowRight: { row: focus.row, column: focus.column + 1 },
      ArrowLeft: { row: focus.row, column: focus.column - 1 },
      ArrowDown: { row: focus.row + 1, column: focus.column },
      ArrowUp: { row: focus.row - 1, column: focus.column },
      Home: { row: focus.row, column: 0 },
      End: { row: focus.row, column: columns.length - 1 },
    }
    const to = moves[event.key]
    if (!to) {
      if (event.key === 'Escape') setShown(null)
      return
    }
    event.preventDefault()
    move(to)
  }

  const shownRow = shown ? rows[shown.row] : undefined
  const shownColumn = shown ? columns[shown.column] : undefined
  const shownValue = valueAt(shownRow, shownColumn)

  return (
    <ChartFrame
      ref={ref}
      label={label}
      summary={description}
      height="auto"
      status={status ?? (empty ? 'empty' : 'ready')}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      action={action}
      className={cx(styles.heatmap, className)}
      footer={
        legend && !empty ? (
          <div className={styles.key} aria-hidden>
            <span className={styles.keyLabel}>{formatValue(domain[0])}</span>
            <span className={styles.ramp}>
              {(scale === 'sequential' ? SEQUENTIAL : DIVERGING).map((step) => (
                <Swatch
                  key={step}
                  color={`${scale === 'sequential' ? 'seq' : 'div'}-${String(step)}` as ChartColor}
                />
              ))}
            </span>
            <span className={styles.keyLabel}>{formatValue(domain[1])}</span>
          </div>
        ) : undefined
      }
      {...rest}
    >
      <div className={styles.scroll}>
        <table
          ref={tableRef}
          role="grid"
          aria-readonly
          className={styles.table}
          onKeyDown={onKeyDown}
          onPointerLeave={() => {
            setShown(null)
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setShown(null)
          }}
        >
          <caption>
            <VisuallyHidden>{label}</VisuallyHidden>
          </caption>
          <thead>
            <tr>
              <td className={styles.corner} />
              {columns.map((column) => (
                <th key={column} scope="col" className={styles.columnHeader}>
                  {columnName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowLabel = formatX(row[x])
              return (
                <tr key={`${rowLabel}-${String(rowIndex)}`}>
                  <th scope="row" className={styles.rowHeader}>
                    {rowLabel}
                  </th>
                  {columns.map((column, columnIndex) => {
                    const value = valueAt(row, column)
                    const step =
                      value === undefined ? undefined : stepOf(value, scale, domain, midpoint)
                    const isFocus = focus.row === rowIndex && focus.column === columnIndex
                    const isShown = shown?.row === rowIndex && shown.column === columnIndex
                    return (
                      <td
                        key={column}
                        role="gridcell"
                        tabIndex={isFocus ? 0 : -1}
                        data-cell={`${String(rowIndex)}:${String(columnIndex)}`}
                        data-active={isShown ? '' : undefined}
                        className={styles.cell}
                        style={cssVars({ '--_fill': step ? `var(--color-${step})` : undefined })}
                        onPointerEnter={(event) => {
                          setShown(shownAt(event.currentTarget, rowIndex, columnIndex))
                        }}
                        onFocus={(event) => {
                          setFocus({ row: rowIndex, column: columnIndex })
                          setShown(shownAt(event.currentTarget, rowIndex, columnIndex))
                        }}
                      >
                        <VisuallyHidden>
                          {value === undefined ? 'No data' : formatValue(value)}
                        </VisuallyHidden>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {shown && shownColumn !== undefined ? (
          <ChartTooltip
            aria-hidden
            className={styles.tooltip}
            title={`${formatX(shownRow?.[x])}, ${columnName(shownColumn)}`}
            items={[
              {
                key: 'value',
                label: 'Value',
                value: shownValue === undefined ? 'No data' : formatValue(shownValue),
                color:
                  shownValue === undefined
                    ? undefined
                    : stepOf(shownValue, scale, domain, midpoint),
              },
            ]}
            style={cssVars({
              '--_left': `${String(shown.left)}px`,
              '--_top': `${String(shown.top)}px`,
            })}
          />
        ) : null}
      </div>
    </ChartFrame>
  )
})
