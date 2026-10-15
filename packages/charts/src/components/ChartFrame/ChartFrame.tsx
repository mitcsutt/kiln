import { Alert, EmptyState, VisuallyHidden, cx } from '@mitcsutt/kiln-ui'
import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'

import type { ChartTable } from '#core/data'
import { useElementSize, type Size } from '#core/hooks'
import { cssVars, mergeStyles } from '#core/style'

import styles from './ChartFrame.module.css'

/** A chart's height: pixels, or `fill` to take the height of a sized parent (a grid cell). */
export type ChartHeight = number | 'fill'

/** What a chart frame shows: the chart, or a loading, empty or error state in its place. */
export type ChartStatus = 'ready' | 'loading' | 'empty' | 'error'

export interface ChartFrameProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The chart's accessible name: what it shows, such as "Revenue by month". */
  label: string
  /** A sentence or two on what the data says, read after the name. */
  summary?: string | undefined
  /**
   * The frame's height in pixels, legend included, `fill` to fill a parent with a height, or
   * `auto` for content that sizes itself and draws on the server (a list, a table of cells).
   * @defaultValue 240
   */
  height?: ChartHeight | 'auto' | undefined
  /** @defaultValue 'ready' */
  status?: ChartStatus | undefined
  /** @defaultValue 'No data to show' */
  emptyMessage?: ReactNode
  /** @defaultValue "This chart couldn't load" */
  errorMessage?: ReactNode
  /** One thing to do from the empty or error state, such as a retry button. */
  action?: ReactNode
  /** The data as a table, for screen readers: one header per column, one row per point. */
  table?: ChartTable | undefined
  /** A legend above the plot. */
  legend?: ReactNode
  /**
   * Anything below the plot, such as a legend that goes under it. Visually hidden content here
   * takes no space.
   */
  footer?: ReactNode
  /**
   * The plot. A function receives the plot's measured size and runs only in the browser, once
   * the frame has been laid out: the server and the first render show the reserved frame.
   */
  children?: ReactNode | ((size: Size) => ReactNode)
}

/**
 * The frame every chart sits in: its reserved size, its states and its accessible text.
 *
 * @remarks
 * Every chart in this package draws inside a `ChartFrame`, and you can draw your own in one too.
 * The frame gives a chart what it needs to be readable by everyone and to render on the server:
 *
 * - **A reserved size.** The frame takes its `height` (or fills its parent with `fill`) before
 *   anything is drawn, so a chart that draws in the browser never moves the page when it arrives.
 * - **An accessible name and summary.** The frame is a figure named by `label` and described by
 *   `summary`.
 * - **The data as a table.** Pass `table` and the frame renders it, visually hidden, for screen
 *   readers and for the server-rendered page.
 * - **Loading, empty and error states** in place of the plot, at the same size, with text a
 *   screen reader announces.
 *
 * Pass the plot as children, or as a function of the measured plot size for drawing that needs
 * pixels.
 */
export const ChartFrame = forwardRef<HTMLElement, ChartFrameProps>(function ChartFrame(
  {
    label,
    summary,
    height = 240,
    status = 'ready',
    emptyMessage = 'No data to show',
    errorMessage = 'This chart couldn’t load',
    action,
    table,
    legend,
    footer,
    children,
    className,
    style,
    ...rest
  },
  ref,
) {
  const summaryId = useId()
  const [plotRef, size] = useElementSize<HTMLDivElement>()
  const ready = status === 'ready'
  let plot: ReactNode = null
  if (ready) {
    if (typeof children === 'function') plot = size ? children(size) : null
    else plot = children
  }
  return (
    <figure
      ref={ref}
      aria-label={label}
      aria-describedby={summary ? summaryId : undefined}
      aria-busy={status === 'loading' || undefined}
      className={cx(styles.frame, className)}
      data-status={status}
      data-height={typeof height === 'number' ? undefined : height}
      style={mergeStyles(
        cssVars({ '--_height': typeof height === 'number' ? `${String(height)}px` : undefined }),
        style,
      )}
      {...rest}
    >
      {legend && ready ? <div className={styles.legend}>{legend}</div> : null}
      <div ref={plotRef} className={styles.plot}>
        {plot}
        {status === 'loading' ? (
          <div role="status" className={styles.loading}>
            <VisuallyHidden>Loading {label}</VisuallyHidden>
          </div>
        ) : null}
        {status === 'empty' ? (
          <EmptyState
            className={styles.state}
            title={emptyMessage}
            titleAs="p"
            action={action}
            align="center"
            framed
          />
        ) : null}
        {status === 'error' ? (
          <div className={styles.state}>
            <Alert tone="critical" title={errorMessage} action={action} />
          </div>
        ) : null}
      </div>
      {footer}
      {summary ? (
        <VisuallyHidden as="div" id={summaryId}>
          {summary}
        </VisuallyHidden>
      ) : null}
      {table && ready ? <DataTable caption={label} table={table} /> : null}
    </figure>
  )
})

/** The chart's data as a table, for screen readers. */
function DataTable({ caption, table }: { caption: string; table: ChartTable }) {
  return (
    <VisuallyHidden as="div">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {table.columns.map((column, index) => (
              <th key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </VisuallyHidden>
  )
}
