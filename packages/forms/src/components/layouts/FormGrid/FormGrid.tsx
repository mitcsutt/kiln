import type { ReactNode } from 'react'
import {
  Grid,
  type GridColumns,
  type GridSpan,
  type Responsive,
  type Space,
} from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'

export interface FormGridProps {
  /** Default `{ base: 1, md: 2 }`: one column on phones, two from `md`. */
  columns?: Responsive<GridColumns>
  /** Default `5`. */
  gap?: Responsive<Space>
  rowGap?: Responsive<Space>
  children: ReactNode
}

export interface FormGridItemProps {
  span?: Responsive<GridSpan>
  /** Column to start at — an offset instead of a spacer cell. */
  start?: Responsive<GridColumns>
  children: ReactNode
}

const DEFAULT_COLUMNS: Responsive<GridColumns> = { base: 1, md: 2 }

/** A responsive grid of fields (§9.1). Visual only — no semantics. */
function FormGridRootInner({
  columns = DEFAULT_COLUMNS,
  gap = 5,
  rowGap,
  children,
}: FormGridProps) {
  return (
    <Grid columns={columns} gap={gap} rowGap={rowGap}>
      {children}
    </Grid>
  )
}

/** A cell that spans columns or starts at a column. */
export function FormGridItem({ span, start, children }: FormGridItemProps) {
  return (
    <Grid.Item span={span} start={start}>
      {children}
    </Grid.Item>
  )
}

/**
 * Fields in columns that collapse on small screens, with items that span.
 *
 * @remarks
 * `FormGrid` lays fields out in columns: two from `md` up by default, one below. `FormGridItem`
 * spans columns or starts at one, both responsive. Spacers are `start` offsets; there's no string
 * matrix of field names.
 *
 * @example In a schema
 * ```json
 * {
 *   "layout": "grid",
 *   "columns": { "base": 1, "md": 3 },
 *   "children": [
 *     {
 *       "layout": "gridItem",
 *       "span": { "base": 1, "md": 3 },
 *       "children": [{ "kind": "text", "name": "street", "label": "Street" }]
 *     },
 *     { "kind": "text", "name": "postcode", "label": "Postcode" }
 *   ]
 * }
 * ```
 */
function FormGridRoot(props: FormGridProps) {
  return (
    <FieldViewListBoundary>
      <FormGridRootInner {...props} />
    </FieldViewListBoundary>
  )
}

export const FormGrid = Object.assign(FormGridRoot, { Item: FormGridItem })
