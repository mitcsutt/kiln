import type { ReactNode } from 'react'
import { ActionBar, Inline } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { FormStatus } from '#components/FormStatus'

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

export function FormActions(props: FormActionsProps) {
  return (
    <FieldViewListBoundary>
      <FormActionsInner {...props} />
    </FieldViewListBoundary>
  )
}
