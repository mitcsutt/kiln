import type { FocusEvent } from 'react'
import {
  Tag,
  TagList,
  TagsField as UiTagsField,
  type TagsFieldProps as UiTagsFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#core/binding/FieldView'
import type { ControlledKeys } from '#core/binding/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#core/binding/useFieldBinding'
import { defineField } from '#core/kit/contracts'

export interface FormTagsFieldProps
  extends Omit<UiTagsFieldProps, ControlledKeys>, CommonFieldProps<readonly string[]> {}

/** Free-form tags bound to a `string[]` path (§7.2 `tags`). Empty is `[]`. */
export const FormTagsField = defineField<readonly string[]>()(function FormTagsField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormTagsFieldProps) {
  const binding = useFieldBinding<readonly string[]>({
    ...props,
    warn,
    excluded,
    accepts: accepts.stringArray,
    empty: [],
  })
  if (binding.mode === 'view') {
    return (
      <FieldView label={props.label}>
        {binding.value.length > 0 ? (
          <TagList>
            {binding.value.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagList>
        ) : undefined}
      </FieldView>
    )
  }
  return (
    <UiTagsField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={binding.value}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
