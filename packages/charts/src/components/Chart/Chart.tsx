import { Button, VisuallyHidden, cx } from '@mitcsutt/kiln-ui'
import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  ComposedChart,
  ReferenceArea,
  Tooltip,
  useActiveTooltipDataPoints,
  useIsTooltipActive,
  type MouseHandlerDataParam,
  type TooltipContentProps,
} from 'recharts'

import { ChartFrame, type ChartHeight, type ChartStatus } from '#components/ChartFrame/ChartFrame'
import { ChartLegend } from '#components/ChartLegend/ChartLegend'
import { useSeriesColors } from '#components/ChartColorScope/ChartColorScope'
import { ChartTooltip } from '#components/ChartTooltip/ChartTooltip'
import type { SwatchShape } from '#components/internal/Swatch/Swatch'
import {
  humanise,
  pivotRows,
  summarise,
  tableOf,
  xIdentity,
  type ChartRow,
  type PivotOptions,
} from '#core/data'
import { valueFormatter, xFormatter, type ValueFormat, type XFormat } from '#core/format'
import { usePrefersReducedMotion } from '#core/hooks'

import {
  ChartContext,
  partOf,
  useChart,
  type ChartContextValue,
  type ChartLayout,
  type PartMarker,
  type SeriesInfo,
  type SeriesKind,
} from './context'
import {
  ChartArea,
  ChartBar,
  ChartGrid,
  ChartLine,
  ChartReferenceLine,
  ChartXAxis,
  ChartYAxis,
  type ChartAreaProps,
  type ChartBarProps,
  type ChartLineProps,
  type EngineProps,
} from './parts'

import styles from './Chart.module.css'

/** The point a reader clicked or activated from the keyboard. */
export interface ChartPoint {
  /** The row's position in the data the chart shows. */
  index: number
  /** The row's x value. */
  x: unknown
  /** The row itself. */
  row: ChartRow
}

/** A range of x values, both ends included. */
export interface ChartZoomRange {
  from: unknown
  to: unknown
}

export interface ChartProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The rows to plot. Wide rows have one key per series (`{ month: 'Mar', revenue: 1200 }`); long
   * rows have one row per series and x, and need `pivot`.
   */
  data: readonly ChartRow[]
  /** The key of each row's x value: a category, or a date (a `Date` or an ISO 8601 string). */
  x: string
  /** The chart's accessible name: what it shows, such as "Revenue by month". */
  label: string
  /** What the data says, read after the name. Defaults to a summary of each series' range. */
  summary?: string
  /** Pixels, legend included, or `fill` to fill a sized parent. @defaultValue 240 */
  height?: ChartHeight
  /** `vertical` runs the chart sideways: categories down the side and bars across. @defaultValue 'horizontal' */
  layout?: ChartLayout
  /** Turn long rows into wide ones, one series per value of `by`. */
  pivot?: PivotOptions
  /** How to write values. @defaultValue 'number' */
  format?: ValueFormat
  /** How to write x values that are dates. @defaultValue 'date' */
  xFormat?: XFormat
  /** The x column's header in the data table. Defaults to a readable form of `x`. */
  xLabel?: string
  /** The locale for every number and date, passed to `Intl`. Defaults to the reader's. */
  locale?: string
  /**
   * The time zone instants print in, passed to `Intl`: `Date` objects and date strings with `Z` or
   * an offset. A date string with no offset prints as written. Defaults to the reader's.
   */
  timeZone?: string
  /** `percent` stacks to 100%, showing each series' share. @defaultValue 'normal' */
  stacking?: 'normal' | 'percent'
  /** Animate marks in and between data. Never under reduced motion. @defaultValue true */
  animate?: boolean
  /** Shows a loading, empty or error state in place of the chart. Empty data shows `empty`. */
  status?: ChartStatus
  /** @defaultValue 'No data to show' */
  emptyMessage?: ReactNode
  /** @defaultValue "This chart couldn't load" */
  errorMessage?: ReactNode
  /** One thing to do from the empty or error state, such as a retry button. */
  action?: ReactNode
  /**
   * Called when a reader clicks a point, or presses Enter or Space on the active point when the
   * chart has keyboard focus.
   */
  onPointClick?: (point: ChartPoint) => void
  /** Props for the engine's own chart component. Outside semver. */
  engineProps?: EngineProps
  /** The chart's parts: series, axes, grid, reference lines, tooltip, legend, zoom. */
  children?: ReactNode
}

/* ─── Parts read before drawing ───────────────────────────────────────────── */

export interface ChartTooltipPartProps {
  /** Draw a guide at the active point: a line, or a band behind bars. @defaultValue true */
  cursor?: boolean
  /** Props for the engine's own tooltip component. Outside semver. */
  engineProps?: EngineProps
}

/** The tooltip for the point under the pointer or the keyboard, shared by every series. */
function ChartTooltipPart({ cursor = true, engineProps }: ChartTooltipPartProps) {
  const chart = useChart('Chart.Tooltip')
  const bars = [...chart.series.values()].some((s) => s.kind === 'bar')
  return (
    <Tooltip
      content={(props: TooltipContentProps) => <TooltipContent {...props} chart={chart} />}
      cursor={
        cursor
          ? bars
            ? { fill: 'var(--chart-grid)', fillOpacity: 0.6 }
            : { stroke: 'var(--chart-axis)', strokeWidth: 1 }
          : false
      }
      isAnimationActive={false}
      wrapperStyle={{ outline: 'none', zIndex: 1 }}
      {...engineProps}
    />
  )
}

function TooltipContent({
  active,
  payload,
  label,
  chart,
}: TooltipContentProps & { chart: ChartContextValue }) {
  const items = active
    ? payload.flatMap((entry) => {
        const key = typeof entry.dataKey === 'string' ? entry.dataKey : undefined
        const series = key === undefined ? undefined : chart.series.get(key)
        if (!series || chart.hidden.has(series.key)) return []
        return [
          {
            key: series.key,
            label: series.label,
            value: series.format(entry.value),
            color: series.color,
            shape: series.shape,
          },
        ]
      })
    : []
  // The live region stays mounted, so each point the arrow keys reach is read out.
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {items.length > 0 ? <ChartTooltip title={chart.formatX(label)} items={items} /> : null}
    </div>
  )
}

export interface ChartLegendPartProps {
  /** Let readers show and hide series from the legend. @defaultValue true */
  toggle?: boolean
  /** @defaultValue 'top' */
  position?: 'top' | 'bottom'
}

/** The chart's legend: each series' colour and name, above the plot. */
const ChartLegendPart: (props: ChartLegendPartProps) => null = () => null

export interface ChartZoomProps {
  /** The zoomed range, when you control it. `null` shows everything. */
  value?: ChartZoomRange | null
  /** The range to start zoomed to, when the chart controls it. */
  defaultValue?: ChartZoomRange | null
  /** Called with the range a reader selects, or `null` when they reset. */
  onZoom?: (range: ChartZoomRange | null) => void
  /** @defaultValue 'Show all' */
  resetLabel?: string
}

/**
 * Lets readers zoom into a range of x: drag across the plot, or hold Shift with the arrow keys
 * and press Enter. A reset button shows everything again.
 */
const ChartZoom: (props: ChartZoomProps) => null = () => null

/** Reports the active point's row, so the keyboard can click and select from it. */
function ActiveTracker({ onChange }: { onChange: (row: ChartRow | undefined) => void }) {
  const points = useActiveTooltipDataPoints<ChartRow>()
  const active = useIsTooltipActive()
  const row = active ? points?.[0] : undefined
  useEffect(() => {
    onChange(row)
  }, [row, onChange])
  return null
}

/* ─── Reading the parts ───────────────────────────────────────────────────── */

interface SeriesPart {
  kind: SeriesKind
  props: ChartBarProps | ChartLineProps | ChartAreaProps
}

interface Parts {
  series: SeriesPart[]
  legend?: ChartLegendPartProps
  zoom?: ChartZoomProps
}

function readParts(children: ReactNode, parts: Parts = { series: [] }): Parts {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type === Fragment) {
      readParts((child as ReactElement<{ children?: ReactNode }>).props.children, parts)
      return
    }
    const kind = partOf(child)
    if (kind === 'legend') parts.legend = child.props as ChartLegendPartProps
    else if (kind === 'zoom') parts.zoom = child.props as ChartZoomProps
    else if (kind !== undefined) parts.series.push({ kind, props: child.props as ChartBarProps })
  })
  return parts
}

const SHAPES: Record<SeriesKind, SwatchShape> = { bar: 'chip', area: 'chip', line: 'line' }

/** The range of row indices a zoom covers, or undefined when it matches nothing. */
function zoomIndices(rows: readonly ChartRow[], x: string, range: ChartZoomRange | null) {
  if (!range) return undefined
  const ids = rows.map((row) => xIdentity(row[x]))
  const from = ids.indexOf(xIdentity(range.from))
  const to = ids.lastIndexOf(xIdentity(range.to))
  if (from === -1 || to === -1) return undefined
  return from <= to ? { start: from, end: to } : { start: to, end: from }
}

const KEYS_HINT = 'Use the left and right arrow keys to move between points.'
const ZOOM_HINT = 'Hold Shift with the arrow keys to select a range, then press Enter to zoom in.'

// The root; `Chart` below attaches its parts.
const ChartRoot = forwardRef<HTMLElement, ChartProps>(function Chart(
  {
    data,
    x,
    label,
    summary,
    height = 240,
    layout = 'horizontal',
    pivot,
    format = 'number',
    xFormat,
    xLabel,
    locale,
    timeZone,
    stacking = 'normal',
    animate = true,
    status,
    emptyMessage,
    errorMessage,
    action,
    onPointClick,
    engineProps,
    children,
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const parts = readParts(children)
  const pivoted = useMemo(() => (pivot ? pivotRows(data, x, pivot) : undefined), [data, x, pivot])
  const allRows = pivoted?.rows ?? data

  const formatLocale = useMemo(() => ({ locale, timeZone }), [locale, timeZone])
  const formatX = useMemo(() => xFormatter(xFormat, formatLocale), [xFormat, formatLocale])
  const formatValue = useMemo(() => valueFormatter(format, formatLocale), [format, formatLocale])

  const colors = useSeriesColors(
    parts.series.map(({ props }) => ({ key: props.dataKey, color: props.color })),
    pivoted?.otherKey,
  )
  const series = new Map<string, SeriesInfo>()
  for (const { kind, props } of parts.series) {
    const lineVariant = kind === 'line' ? (props as ChartLineProps).variant : undefined
    series.set(props.dataKey, {
      key: props.dataKey,
      label: props.label ?? (pivoted ? props.dataKey : humanise(props.dataKey)),
      kind,
      color: colors.get(props.dataKey) ?? 'neutral',
      shape: lineVariant === 'dashed' ? 'dashed' : SHAPES[kind],
      format: props.format ? valueFormatter(props.format, formatLocale) : formatValue,
    })
  }

  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = (key: string) => {
    setHidden((before) => {
      const next = new Set(before)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }

  // Zoom: controlled through `Chart.Zoom value`, or kept here.
  const zoom = parts.zoom
  const [ownZoom, setOwnZoom] = useState<ChartZoomRange | null>(zoom?.defaultValue ?? null)
  const zoomRange = zoom?.value !== undefined ? zoom.value : ownZoom
  const zoomed = zoom ? zoomIndices(allRows, x, zoomRange) : undefined
  const rows = zoomed ? allRows.slice(zoomed.start, zoomed.end + 1) : allRows
  const setZoom = (range: ChartZoomRange | null) => {
    if (zoom?.value === undefined) setOwnZoom(range)
    zoom?.onZoom?.(range)
  }

  // A range being selected, by dragging or with Shift and the arrow keys, as row indices.
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const dragging = useRef(false)
  const dragged = useRef(false)
  const activeRow = useRef<ChartRow | undefined>(undefined)
  const [trackActive] = useState(() => (row: ChartRow | undefined) => {
    activeRow.current = row
  })
  const activeIndex = () => {
    const row = activeRow.current
    return row === undefined ? -1 : rows.indexOf(row)
  }

  const applySelection = (start: number, end: number) => {
    setSelection(null)
    const [from, to] = start <= end ? [start, end] : [end, start]
    if (from === to) return
    const range = { from: rows[from]?.[x], to: rows[to]?.[x] }
    setZoom(range)
    setAnnouncement(`Zoomed to ${formatX(range.from)} to ${formatX(range.to)}.`)
  }

  const reduced = usePrefersReducedMotion()
  const context: ChartContextValue = {
    x,
    layout,
    rows,
    series,
    hidden,
    formatX,
    formatValue,
    formatLocale,
    animate: animate && !reduced,
  }

  const described = [...series.values()]
  const table = tableOf(rows, x, xLabel ?? humanise(x), formatX, described)
  const description = summary ?? summarise(rows, x, formatX, described)
  const resolvedStatus = status ?? (allRows.length === 0 ? 'empty' : 'ready')

  const legendItems = described.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    shape: s.shape,
    hidden: hidden.has(s.key),
  }))
  const legend = parts.legend ? (
    <ChartLegend
      items={legendItems}
      onToggleSeries={parts.legend.toggle === false ? undefined : toggle}
    />
  ) : null
  const reset =
    zoom && zoomed ? (
      <Button
        size="sm"
        variant="ghost"
        className={styles.reset}
        onClick={() => {
          setZoom(null)
          setAnnouncement('Showing all points.')
        }}
      >
        {zoom.resetLabel ?? 'Show all'}
      </Button>
    ) : null
  const legendBottom = parts.legend?.position === 'bottom'
  const toolbar =
    (legend && !legendBottom) || reset ? (
      <div className={styles.toolbar}>
        {legendBottom ? null : legend}
        {reset}
      </div>
    ) : undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (!(event.target instanceof Element) || !event.target.closest('.recharts-surface')) return
    const last = rows.length - 1
    if (zoom && event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      // The engine has already moved the active point; follow it with the selection's end.
      const step = event.key === 'ArrowRight' ? 1 : -1
      const anchor = selection?.start ?? Math.max(0, activeIndex())
      const end = Math.min(last, Math.max(0, (selection?.end ?? anchor) + step))
      setSelection({ start: anchor, end })
      setAnnouncement(
        `Selected ${formatX(rows[Math.min(anchor, end)]?.[x])} to ${formatX(rows[Math.max(anchor, end)]?.[x])}. Press Enter to zoom in.`,
      )
      return
    }
    if (event.key === 'Escape' && selection) {
      setSelection(null)
      setAnnouncement('Selection cleared.')
      return
    }
    if (event.key === 'Enter' && selection) {
      applySelection(selection.start, selection.end)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && onPointClick) {
      const index = activeIndex()
      const row = rows[index]
      if (row === undefined) return
      if (event.key === ' ') event.preventDefault()
      onPointClick({ index, x: row[x], row })
    }
  }

  const indexOf = (state: MouseHandlerDataParam) => {
    const index = Number(state.activeIndex)
    return Number.isInteger(index) && index >= 0 ? index : undefined
  }

  return (
    <ChartFrame
      ref={ref}
      label={label}
      summary={description}
      height={height}
      status={resolvedStatus}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      action={action}
      table={table}
      legend={toolbar}
      footer={
        <>
          {legend && legendBottom ? legend : null}
          <VisuallyHidden role="status" aria-live="polite">
            {announcement}
          </VisuallyHidden>
        </>
      }
      className={cx(styles.chart, className)}
      data-layout={layout}
      data-zoom={zoom ? '' : undefined}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {(size) => (
        <ChartContext.Provider value={context}>
          <ComposedChart
            width={size.width}
            height={size.height}
            data={rows}
            layout={layout}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            stackOffset={stacking === 'percent' ? 'expand' : 'sign'}
            accessibilityLayer
            aria-label={label}
            desc={zoom ? `${KEYS_HINT} ${ZOOM_HINT}` : KEYS_HINT}
            onClick={(state) => {
              if (dragged.current || !onPointClick) return
              const index = indexOf(state)
              const row = index === undefined ? undefined : rows[index]
              if (index !== undefined && row !== undefined) onPointClick({ index, x: row[x], row })
            }}
            onMouseDown={(state) => {
              dragged.current = false
              const index = indexOf(state)
              if (!zoom || index === undefined) return
              dragging.current = true
              setSelection({ start: index, end: index })
            }}
            onMouseMove={(state) => {
              const index = indexOf(state)
              if (!dragging.current || index === undefined) return
              setSelection((before) => {
                if (!before || before.end === index) return before
                dragged.current = true
                return { start: before.start, end: index }
              })
            }}
            onMouseUp={() => {
              if (!dragging.current) return
              dragging.current = false
              if (selection) applySelection(selection.start, selection.end)
            }}
            onMouseLeave={() => {
              if (!dragging.current) return
              dragging.current = false
              setSelection(null)
            }}
            {...engineProps}
          >
            {children}
            {selection && selection.start !== selection.end ? (
              <ReferenceArea
                {...(layout === 'horizontal'
                  ? {
                      x1: rows[selection.start]?.[x] as string,
                      x2: rows[selection.end]?.[x] as string,
                    }
                  : {
                      y1: rows[selection.start]?.[x] as string,
                      y2: rows[selection.end]?.[x] as string,
                    })}
                fill="var(--chart-focus)"
                fillOpacity={0.12}
                stroke="var(--chart-focus)"
                strokeOpacity={0.5}
              />
            ) : null}
            <ActiveTracker onChange={trackActive} />
          </ComposedChart>
        </ChartContext.Provider>
      )}
    </ChartFrame>
  )
})

/**
 * A chart you compose from parts: series of bars, lines and areas, mixed freely, on a shared
 * x axis.
 *
 * @remarks
 * Reach for a preset first ({@link TimeSeries | TimeSeries} or {@link Bars | Bars}): they are
 * compositions of these parts, and their source is the starting point to copy when you need
 * something they don't do. Compose a `Chart` when you want to mix kinds, say bars for revenue
 * with a line for the target.
 *
 * Give the chart its rows, the key of `x`, an accessible `label` and a `height`, then its parts:
 *
 * - **Series:** `Chart.Bar`, `Chart.Line` and `Chart.Area`, each with the `dataKey` it plots.
 *   They take the next categorical colour, or the one you pin with `color`.
 * - **Chrome:** `Chart.Grid`, `Chart.XAxis`, `Chart.YAxis` and `Chart.ReferenceLine`, drawn in
 *   the theme's chart tokens.
 * - **Reading:** `Chart.Tooltip` (one card for every series at the point, with a guide) and
 *   `Chart.Legend` (names and colours, as toggles that show and hide each series).
 * - **Zooming:** `Chart.Zoom` lets readers drag across a range, or select one from the keyboard.
 *
 * Series parts must be children of the `Chart` (or inside a fragment), because the chart reads
 * them to build the legend, the tooltip and the data table.
 *
 * ## Accessibility
 *
 * The chart is a figure named by `label` and described by `summary`, or by a summary written from
 * the data. A visually hidden table holds every value, for screen readers and for the
 * server-rendered page. With the chart focused, the left and right arrow keys move between
 * points and the tooltip reads each one out; Enter or Space activates the point for
 * `onPointClick`. Marks don't animate under reduced motion.
 *
 * ## Server rendering
 *
 * The chart engine draws only in the browser, so the server renders the frame at its full
 * height, the legend and the data table. The plot draws once the page hydrates, into the space
 * already reserved, so nothing on the page moves.
 */
export const Chart = Object.assign(ChartRoot, {
  Bar: ChartBar,
  Line: ChartLine,
  Area: ChartArea,
  Grid: ChartGrid,
  XAxis: ChartXAxis,
  YAxis: ChartYAxis,
  ReferenceLine: ChartReferenceLine,
  Tooltip: ChartTooltipPart,
  Legend: Object.assign(ChartLegendPart, { kilnChartPart: 'legend' } satisfies PartMarker),
  Zoom: Object.assign(ChartZoom, { kilnChartPart: 'zoom' } satisfies PartMarker),
})
