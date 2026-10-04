import type { FieldLabelProps } from '#components/inputs/Field'

/** Every key `FieldLabelProps` declares — kept in sync so `splitFieldLabelProps` never drifts. */
export const FIELD_LABEL_PROP_KEYS: readonly (keyof FieldLabelProps)[] = [
  'label',
  'description',
  'hint',
  'error',
  'required',
  'optional',
  'labelHidden',
  'warning',
  'errorLive',
  'errorHidden',
  'validating',
  'readOnly',
  'layout',
]

const FIELD_LABEL_PROP_KEY_SET = new Set<PropertyKey>(FIELD_LABEL_PROP_KEYS)

/**
 * Splits a composed field's props into the `FieldLabelProps` it forwards to `<Field>`
 * (or `<Fieldset>`) and everything else, which goes to the bare control. Every composed
 * `*Field` uses this so a future `FieldLabelProps` addition reaches all of them for free.
 *
 * const [fieldProps, rest] = splitFieldLabelProps(props)
 * <Field {...fieldProps}><Input {...rest} /></Field>
 */
export function splitFieldLabelProps<P extends FieldLabelProps>(
  props: P,
): [FieldLabelProps, Omit<P, keyof FieldLabelProps>] {
  const fieldProps: Partial<Record<keyof FieldLabelProps, unknown>> = {}
  const rest: Partial<Record<keyof P, unknown>> = {}
  for (const key of Object.keys(props) as (keyof P)[]) {
    if (FIELD_LABEL_PROP_KEY_SET.has(key))
      fieldProps[key as unknown as keyof FieldLabelProps] = props[key]
    else rest[key] = props[key]
  }
  return [fieldProps as FieldLabelProps, rest as Omit<P, keyof FieldLabelProps>]
}
