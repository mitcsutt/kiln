import type { ReactNode } from 'react'
import { Stack, type Responsive, type Space } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { FieldPresentation } from '#core/binding/presentation'

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

export function FormRows(props: FormRowsProps) {
  return (
    <FieldViewListBoundary>
      <FormRowsInner {...props} />
    </FieldViewListBoundary>
  )
}
