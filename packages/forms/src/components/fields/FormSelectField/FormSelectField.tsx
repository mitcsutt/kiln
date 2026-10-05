import { useRef, type FocusEvent } from 'react'
import {
  SelectField as UiSelectField,
  type SelectFieldProps as UiSelectFieldProps,
  type SelectGroup,
  type SelectOption,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { useOptionMapping, type UiOption } from '#hooks/useOptionMapping'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineOptionField, type FieldOption, type Primitive } from '#kit/contracts'

export interface FormSelectFieldProps
  extends
    Omit<UiSelectFieldProps, ControlledKeys | 'options' | 'groups'>,
    CommonFieldProps<Primitive | null> {
  /** Typed to the bound path's own value type in the typed shorthand. `group` → headed groups. */
  options?: readonly FieldOption[]
  /** Label of a first "no selection" row that sets the value to `null`. */
  emptyOption?: string
}

function toUiLists(options: readonly UiOption[]): { flat: SelectOption[]; groups: SelectGroup[] } {
  const flat: SelectOption[] = []
  const groups: SelectGroup[] = []
  for (const option of options) {
    const item: SelectOption = { value: option.value, label: option.label }
    if (option.disabled !== undefined) item.disabled = option.disabled
    if (option.group === undefined) {
      flat.push(item)
      continue
    }
    let group = groups.find((candidate) => candidate.label === option.group)
    if (!group) {
      group = { label: option.group, options: [] }
      groups.push(group)
    }
    group.options.push(item)
  }
  return { flat, groups }
}

/**
 * A single-choice dropdown (§7.2 `select`). Option values keep their primitive type (numbers and
 * booleans round-trip through the string-only ui control, §7.3); empty is `null`.
 */
export const FormSelectField = defineOptionField()(function FormSelectField({
  warn,
  excluded,
  onBlur,
  onOpenChange,
  options,
  emptyOption,
  ...props
}: FormSelectFieldProps) {
  const binding = useFieldBinding<Primitive | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.primitiveOrNull,
    empty: null,
  })
  const mapping = useOptionMapping(options, { emptyOption })
  const open = useRef(false)
  if (binding.mode === 'view')
    return <FieldView label={props.label}>{mapping.labelOf(binding.value)}</FieldView>
  const { flat, groups } = toUiLists(mapping.uiOptions)
  return (
    <UiSelectField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      options={flat}
      groups={groups.length > 0 ? groups : undefined}
      value={mapping.toUi(binding.value)}
      onValueChange={(next) => {
        binding.setValue(mapping.fromUi(next))
      }}
      onOpenChange={(next) => {
        open.current = next
        onOpenChange?.(next)
      }}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event)
        // Focus moving into the open list is not "leaving the field".
        if (!open.current) binding.onBlur()
      }}
    />
  )
})
