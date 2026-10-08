import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'
import { cx } from '#utils/cx'
import type { CategoryColor } from '#utils/tokens'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import { ChevronDownIcon, ChevronUpIcon } from '#icons'
import styles from './Table.module.css'

export type TableDensity = 'compact' | 'regular'
export type TableVariant = 'rules' | 'plain'
/** `surface` and `raised` set the table on one sheet, like `Card`'s `outline` and `raised`. */
export type TableSurface = 'none' | 'surface' | 'raised'
export type TableAlign = 'start' | 'center' | 'end'
/** Where body and footer cells sit in a row taller than their content. */
export type TableVerticalAlign = 'middle' | 'baseline' | 'top'
export type TableSort = 'asc' | 'desc' | 'none'
/** `fill` takes the spare width (the name column); `min` shrinks to its content. */
export type TableColumnWidth = 'fill' | 'min'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Row height. Default `regular`. */
  density?: TableDensity
  /** `rules` (default): a hairline under every row. `plain`: only the header rule. */
  variant?: TableVariant
  /**
   * Where cell content sits when a row's cells differ in height (a flag and a tag beside plain
   * figures). `baseline` (the default) lines up the first line of text across the row;
   * `middle` centres every cell, so figures sit level with a name that has a flag or a tag beside
   * or under it; `top` pins each cell to the row's top. Header cells always sit on the header rule.
   */
  valign?: TableVerticalAlign
  /** Alternate row fills. Off by default — rules usually read better. */
  striped?: boolean
  /**
   * Set the table on a sheet so its rows read as rows, not text on the page: `surface` is the
   * surface fill inside a hairline edge, `raised` stands on the theme's surface shadow. Rows run
   * edge to edge, clipped to the sheet's corners, with a little more air. Default `none`.
   */
  surface?: TableSurface
  /**
   * Keep the header visible while rows scroll. The wrapper becomes the scroll container
   * (capped by `--table-max-height`, default 70vh), since a horizontally scrolling wrapper
   * would otherwise trap a page-sticky header.
   */
  stickyHeader?: boolean
  /**
   * Name for the scroll container. When set, the wrapper becomes a focusable, labelled
   * region so keyboard users can scroll a wide table.
   */
  label?: string
}

/**
 * A semantic data table with numeric columns that line up, sortable headers and a footer for
 * totals.
 *
 * @remarks
 * `Table` is a real `<table>` with Kiln's styles: rules between rows, numeric columns in tabular
 * figures, and a wrapper that scrolls sideways on narrow screens instead of breaking the layout.
 *
 * ## Density, stripes and sticky headers
 *
 * `density="compact"` for dense data, `striped` for alternating fills (rules usually read better),
 * and `stickyHeader` to keep the header in view while the rows scroll inside the table.
 *
 * ## On a surface
 *
 * On a busy page, or a theme whose canvas has a texture, `surface="surface"` sets the table on one
 * sheet, and `surface="raised"` stands it on the theme's surface shadow. Rows run edge to edge and
 * get a little more air: a highlighted row is a band across the sheet, a categorical rail is the
 * row's edge, and the sheet scrolls sideways with the table.
 *
 * @privateRemarks
 * A semantic, styled data table: project boards, ledgers, audit logs. The wrapper scrolls
 * horizontally on narrow screens; `ref` and native props go to the `<table>`.
 *
 * <Table><Table.Head><Table.Row><Table.HeaderCell>Project</Table.HeaderCell>…</Table.Row></Table.Head>…</Table>
 */
const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    density = 'regular',
    variant = 'rules',
    valign = 'baseline',
    striped = false,
    surface = 'none',
    stickyHeader = false,
    label,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      className={styles.scroll}
      data-kiln-component=""
      data-surface={surface === 'none' ? undefined : surface}
      data-sticky-header={stickyHeader || undefined}
      role={label ? 'region' : undefined}
      aria-label={label}
      tabIndex={label ? 0 : undefined}
    >
      <table
        ref={ref}
        className={cx(styles.table, className)}
        data-density={density}
        data-variant={variant}
        data-valign={valign}
        data-striped={striped || undefined}
        data-surface={surface === 'none' ? undefined : surface}
        data-sticky-header={stickyHeader || undefined}
        {...rest}
      />
    </div>
  )
})

const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHead({ className, ...rest }, ref) {
    return <thead ref={ref} className={cx(styles.head, className)} {...rest} />
  },
)

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...rest }, ref) {
    return <tbody ref={ref} className={cx(styles.body, className)} {...rest} />
  },
)

/** Totals row(s). Set above a strong rule. */
const TableFoot = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableFoot({ className, ...rest }, ref) {
    return <tfoot ref={ref} className={cx(styles.foot, className)} {...rest} />
  },
)

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'color'> {
  /** `--color-highlight` fill — "you", your project, the circled line. */
  highlighted?: boolean
  /** Hover fill for rows that respond to clicks (put the real link in a cell). */
  interactive?: boolean
  /** Out of play (eliminated, archived, past): every ink drops to the muted step, which still reads. */
  muted?: boolean
  /** A categorical colour drawn as a rail at the row's start: whose row it is, matching their `Tag`. */
  color?: CategoryColor
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { highlighted = false, interactive = false, muted = false, color, className, ...rest },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cx(styles.row, className)}
      data-highlighted={highlighted || undefined}
      data-interactive={interactive || undefined}
      data-muted={muted || undefined}
      data-color={color}
      {...rest}
    />
  )
})

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'width'>, VisibilityProps {
  align?: TableAlign
  /** Numeric column: right-aligned with tabular figures. */
  numeric?: boolean
  /** Column sizing: `fill` takes the spare width, `min` shrinks to fit. Default: automatic. */
  width?: TableColumnWidth
  /** Current sort of this column. With `onSort`, the label becomes a button and `aria-sort` is set. */
  sort?: TableSort
  /** Called when the sort button is pressed. Decide the next direction yourself. */
  onSort?: () => void
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending', none: 'none' } as const

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    {
      align,
      numeric = false,
      width,
      sort,
      onSort,
      hideBelow,
      hideAbove,
      scope = 'col',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const sortable = sort !== undefined && onSort !== undefined
    return (
      <th
        ref={ref}
        scope={scope}
        className={cx(styles.headerCell, visibilityClass({ hideBelow, hideAbove }), className)}
        data-align={align ?? (numeric ? 'end' : undefined)}
        data-numeric={numeric || undefined}
        data-width={width}
        data-sort={sortable ? sort : undefined}
        aria-sort={sort !== undefined ? ARIA_SORT[sort] : undefined}
        {...rest}
      >
        {sortable ? (
          <button type="button" className={styles.sortButton} onClick={onSort}>
            {children}
            <span className={styles.sortGlyph} aria-hidden="true">
              {sort === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </span>
          </button>
        ) : (
          children
        )}
      </th>
    )
  },
)

/**
 * Hide a column on small screens: put the same `hideBelow` on its HeaderCell and on
 * every Cell in that column (cells are `display: none`, so the columns stay aligned).
 */
export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'>, VisibilityProps {
  align?: TableAlign
  /** Figures: right-aligned, tabular, in the theme's numeric face (mono in Ledger). */
  numeric?: boolean
  /** Render as `<th scope="row">` — the cell that names the row (project, client). */
  rowHeader?: boolean
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric = false, rowHeader = false, hideBelow, hideAbove, className, ...rest },
  ref,
) {
  const shared = {
    className: cx(styles.cell, visibilityClass({ hideBelow, hideAbove }), className),
    'data-align': align ?? (numeric ? 'end' : undefined),
    'data-numeric': numeric || undefined,
    'data-row-header': rowHeader || undefined,
  }
  if (rowHeader) {
    const { scope = 'row', ...thRest } = rest as ThHTMLAttributes<HTMLTableCellElement>
    return <th ref={ref} scope={scope} {...shared} {...thRest} />
  }
  return <td ref={ref} {...shared} {...rest} />
})

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption ref={ref} className={cx(styles.caption, className)} {...rest} />
  },
)

export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
  Caption: TableCaption,
})
