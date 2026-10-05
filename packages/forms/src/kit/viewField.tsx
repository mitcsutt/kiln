import { useMemo, type ReactNode } from 'react'
import { getBy, useSelector, type AnyFieldApi, type AnyFormApi } from '@tanstack/react-form'
import { fieldContext } from '#kit/contexts'

const noop = () => undefined

const VIEW_META = Object.freeze({
  errorMap: {},
  errorSourceMap: {},
  errors: [],
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isPristine: true,
  isValid: true,
  isValidating: false,
  isDefaultValue: true,
})

/**
 * View mode without a TanStack field (§9.11): no `FieldApi` is created or mounted for the path, so a
 * read-only copy (a review step) never touches the real field's instance, validators or meta. The
 * field component gets a read-only field context whose `value` comes from a selector over this one
 * path (re-renders only when that value changes).
 */
export interface ViewFieldProps {
  form: AnyFormApi
  name: string
  /** Extra members on the field object (the kit's field components, for the canonical path). */
  extend?: Record<string, unknown>
  /** Content, or a render function receiving the read-only field (`AppField` children). */
  children: ReactNode | ((field: AnyFieldApi) => ReactNode)
}

export function ViewField({ form, name, extend, children }: ViewFieldProps) {
  const value: unknown = useSelector(form.store, (state): unknown => getBy(state.values, name))
  const field = useMemo(
    () =>
      ({
        ...extend,
        form,
        name,
        options: { name },
        state: { value, meta: VIEW_META },
        handleChange: noop,
        handleBlur: noop,
        setValue: noop,
        getValue: () => value,
        getMeta: () => VIEW_META,
      }) as unknown as AnyFieldApi,
    [form, name, value, extend],
  )
  return (
    <fieldContext.Provider value={field}>
      {typeof children === 'function' ? children(field) : children}
    </fieldContext.Provider>
  )
}
