import { createContext, useContext, type ReactNode } from 'react'
import { DataList, type DataListProps } from '@mitcsutt/kiln-ui'
import type { AnyFormApi } from '@tanstack/react-form'
import { useFieldContext } from '#kit/contexts'
import { getFormRuntime } from '#runtime/formRuntime'

export interface FieldViewProps {
  label: ReactNode
  /** The display value; `null`/`undefined`/`''` render `messages.notProvided`. */
  children?: ReactNode
}

/** True directly inside a `FieldViewList` (its `<dl>`). */
const InDataListContext = createContext(false)

/**
 * A `DataList` whose direct children are view-mode fields: they render bare `DataList.Item`s into
 * it, so a run of fields reads as one list. Put only fields in it: a layout inside resets the
 * context (`FieldViewListBoundary`), so its fields render their own lists — but the layout's own
 * markup would still sit inside the `<dl>`.
 */
export function FieldViewList({ children, ...props }: DataListProps) {
  return (
    <DataList {...props}>
      <InDataListContext.Provider value={true}>{children}</InDataListContext.Provider>
    </DataList>
  )
}

/**
 * A layout boundary: fields below it are no longer *directly* inside a `FieldViewList`, so they
 * render self-contained lists again. Every forms layout renders one around its content.
 */
export function FieldViewListBoundary({ children }: { children: ReactNode }) {
  const inList = useContext(InDataListContext)
  return inList ? (
    <InDataListContext.Provider value={false}>{children}</InDataListContext.Provider>
  ) : (
    <>{children}</>
  )
}

/**
 * A field's view-mode rendering (FormReview, `Form mode="view"`): a self-contained one-item
 * `DataList` (`dl` → `dt`/`dd`), or a bare `DataList.Item` when directly inside a `FieldViewList`.
 * Valid list markup wherever it is placed. No control, no validation UI.
 */
export function FieldView({ label, children }: FieldViewProps) {
  const field = useFieldContext<unknown>()
  const inList = useContext(InDataListContext)
  const messages = getFormRuntime(field.form as AnyFormApi).options.messages
  const empty = children === null || children === undefined || children === ''
  const item = (
    <DataList.Item label={label}>{empty ? messages.notProvided : children}</DataList.Item>
  )
  return inList ? item : <DataList>{item}</DataList>
}
