import { createContext, useContext } from 'react'
import { joinIds } from './refs'

/** What a `<Field>` hands to the control rendered inside it. */
export interface FieldControlContext {
  /** Id the label points at (`htmlFor`). */
  id: string
  /** Id of the visible label, for controls that are labelled by reference (groups). */
  labelId: string
  /** Space-separated ids of the description and error messages currently rendered. */
  describedBy?: string
  invalid: boolean
  required: boolean
  disabled: boolean
  /** Focusable but not editable; controls set `readOnly`/`aria-readonly` and ignore changes. */
  readOnly: boolean
  /** `validating` on the surrounding `<Field>`/`<Fieldset>` — controls set `aria-busy`. */
  busy: boolean
  /** Id of the warning message, when the surrounding `<Field>` is currently showing one. */
  warningId?: string
  /**
   * `true` when the surrounding wrapper is a `<Fieldset>`: its `<legend>` already names the
   * group, so a group-role control inside (RadioGroup, CheckboxGroup, ChoiceCards, ChipGroup)
   * must not also point `aria-labelledby` at it, or the name is announced twice.
   */
  fieldset?: boolean
}

export const FieldContext = createContext<FieldControlContext | null>(null)

/**
 * Read the wiring of the surrounding `<Field>`, or `null` outside one. Library controls
 * (Input, Textarea, Select, Checkbox, Switch, RadioGroup) call this themselves; use it to
 * make your own control Field-aware.
 */
export function useFieldControl(): FieldControlContext | null {
  return useContext(FieldContext)
}

const FIELD_AWARE = Symbol.for('@mitcsutt/kiln-ui/field-aware')

/**
 * Tag a component that reads `useFieldControl()` itself, so `<Field>` passes it wiring
 * through context only and doesn't also clone `id`/`aria-*` onto it.
 */
export function markFieldAware<T extends object>(component: T): T {
  return Object.assign(component, { [FIELD_AWARE]: true })
}

export function isFieldAware(type: unknown): boolean {
  return (
    (typeof type === 'object' || typeof type === 'function') && type !== null && FIELD_AWARE in type
  )
}

interface OwnControlProps {
  id?: string
  describedBy?: string
  invalid?: boolean
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

/** Merge a control's own props over the Field context. Own props win; describedby ids join. */
export function useResolvedField(own: OwnControlProps) {
  const ctx = useFieldControl()
  const ariaInvalid = own.ariaInvalid === true || own.ariaInvalid === 'true' ? true : undefined
  return {
    id: own.id ?? ctx?.id,
    describedBy: joinIds(ctx?.describedBy, own.describedBy),
    invalid: own.invalid ?? ariaInvalid ?? ctx?.invalid ?? false,
    required: own.required ?? ctx?.required ?? false,
    disabled: own.disabled ?? ctx?.disabled ?? false,
    readOnly: own.readOnly ?? ctx?.readOnly ?? false,
    busy: ctx?.busy ?? false,
    labelId: ctx?.labelId,
    /** `labelId` for a group-role control: `undefined` inside a Fieldset (the legend names it). */
    groupLabelId: ctx?.fieldset ? undefined : ctx?.labelId,
  }
}
