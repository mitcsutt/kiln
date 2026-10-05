import type { ReactNode } from 'react'
import { ActionBar, Inline } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import { FormStatus } from '#components/form/FormStatus'

export interface FormActionsProps {
  /** Default `'end'`. */
  align?: 'start' | 'end' | 'between'
  /** Sticks to the bottom of the scroll container. */
  sticky?: boolean
  /** Renders `<FormStatus />` at the start of the row (dirty / saving / saved). */
  status?: boolean
  children: ReactNode
}

/** The form's action row (§9.12): an `ActionBar`, optionally led by `FormStatus`. */
function FormActionsInner({ align = 'end', sticky, status = false, children }: FormActionsProps) {
  if (status) {
    return (
      <ActionBar align="between" sticky={sticky}>
        <FormStatus />
        <Inline gap={3} align="center">
          {children}
        </Inline>
      </ActionBar>
    )
  }
  return (
    <ActionBar align={align} sticky={sticky}>
      {children}
    </ActionBar>
  )
}

/**
 * The row of buttons at the end of a form, with the status line if you want it.
 *
 * @remarks
 * `FormActions` is an {@link ActionBar | ActionBar} for forms. `status` adds a `FormStatus` at its
 * start, and `sticky` keeps it in view while a long form scrolls.
 *
 * @example In a schema
 * ```json
 * { "layout": "actions", "align": "end", "children": [{ "content": "submit", "label": "Save line" }] }
 * ```
 */
export function FormActions(props: FormActionsProps) {
  return (
    <FieldViewListBoundary>
      <FormActionsInner {...props} />
    </FieldViewListBoundary>
  )
}
