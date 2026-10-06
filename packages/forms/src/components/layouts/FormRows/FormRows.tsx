import type { ReactNode } from 'react'
import { Stack, type Responsive, type Space } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import { FieldPresentation } from '#components/fields/FieldPresentation'

export interface FormRowsProps {
  /** Hairlines between rows. Default `true`. */
  dividers?: boolean
  /** Default `4`. */
  gap?: Responsive<Space>
  children: ReactNode
}

/**
 * Label-left rows (§9.4): every field inside renders `layout="horizontal"` (label and
 * description in a fixed column, the control beside it; collapses below `sm`).
 */
function FormRowsInner({ dividers = true, gap = 4, children }: FormRowsProps) {
  return (
    <FieldPresentation layout="horizontal">
      <Stack dividers={dividers} gap={gap}>
        {children}
      </Stack>
    </FieldPresentation>
  )
}

/**
 * Label-left rows. Every field inside lays its label and control out in columns, with no per-field
 * setting.
 *
 * @remarks
 * `FormRows` turns every field inside into a row: label and description in a fixed column, the
 * control beside them, and a rule between rows. Below `sm` each row stacks. It's the editor-panel
 * settings row.
 *
 * @example In a schema
 * ```json
 * { "layout": "rows", "children": [{ "kind": "text", "name": "name", "label": "Line name" }] }
 * ```
 */
export function FormRows(props: FormRowsProps) {
  return (
    <FieldViewListBoundary>
      <FormRowsInner {...props} />
    </FieldViewListBoundary>
  )
}
