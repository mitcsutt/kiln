import type { FieldLayout } from '@mitcsutt/kiln-ui'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

/** How fields under a layout render (§9.0). Bindings merge it under the field's own props. */
export interface FieldPresentationValue {
  layout?: FieldLayout
  labelHidden?: boolean
  /** `external`: the field keeps its invalid state but its message renders elsewhere (sentence, table). */
  errorPlacement?: 'inline' | 'external'
  /** `view` renders each field's display value, no control (FormReview, `Form mode="view"`). */
  mode?: 'edit' | 'view'
  /**
   * View mode: clamp each field's value to about this many lines, with a toggle that shows the
   * rest (kiln-ui's `ShowMore`). Values that fit show no toggle.
   */
  viewLines?: number
  /** Cascades; a nested `false` cannot re-enable. */
  disabled?: boolean
  /** Cascades; a nested `false` cannot make it editable. */
  readOnly?: boolean
  /** For `errorPlacement: 'external'`: the id of the element showing a field's message. */
  describedBy?: (name: string) => string | undefined
}

export type FieldPresentationProps = Partial<FieldPresentationValue> & { children: ReactNode }

const EMPTY: FieldPresentationValue = {}

const PresentationContext = createContext<FieldPresentationValue>(EMPTY)

/** Merges two presentation layers: inner wins, except `disabled` / `readOnly`, which only add. */
export function mergePresentation(
  outer: FieldPresentationValue,
  inner: Partial<FieldPresentationValue>,
): FieldPresentationValue {
  const merged: FieldPresentationValue = { ...outer }
  for (const [key, value] of Object.entries(inner) as [keyof FieldPresentationValue, unknown][]) {
    if (value === undefined) continue
    ;(merged as Record<string, unknown>)[key] = value
  }
  if (outer.disabled || inner.disabled) merged.disabled = true
  if (outer.readOnly || inner.readOnly) merged.readOnly = true
  return merged
}

/** Provides presentation hints to every field below, merged with any parent presentation. */
export function FieldPresentation({
  children,
  layout,
  labelHidden,
  errorPlacement,
  mode,
  viewLines,
  disabled,
  readOnly,
  describedBy,
}: FieldPresentationProps) {
  const parent = useContext(PresentationContext)
  const value = useMemo(
    () =>
      mergePresentation(parent, {
        layout,
        labelHidden,
        errorPlacement,
        mode,
        viewLines,
        disabled,
        readOnly,
        describedBy,
      }),
    [parent, layout, labelHidden, errorPlacement, mode, viewLines, disabled, readOnly, describedBy],
  )
  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>
}

/** The merged presentation in effect here. */
export function useFieldPresentation(): FieldPresentationValue {
  return useContext(PresentationContext)
}
