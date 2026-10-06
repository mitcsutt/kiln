import { forwardRef } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { TagsInput, type TagsInputProps } from '#components/inputs/TagsInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface TagsFieldProps
  extends FieldLabelProps, Omit<TagsInputProps, 'invalid' | keyof FieldLabelProps> {}

/**
 * A labelled tags input with description, warning and error.
 *
 * @remarks
 * `TagsField` is a {@link Field | Field} around a {@link TagsInput | TagsInput}.
 *
 * @privateRemarks
 * Label + TagsInput + description + warning + error. TagsInput props (`value`,
 * `delimiters`, `maxTags`…) and the ref go to the text input; `className`/`style` go to
 * the field wrapper. `onBlur` fires once focus leaves the whole control.
 *
 * <TagsField label="Labels" description="Press Enter or comma to add" maxTags={8} />
 */
export const TagsField = forwardRef<HTMLInputElement, TagsFieldProps>(
  function TagsField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, ...inputProps } = rest
    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <TagsInput ref={ref} id={id} disabled={disabled} {...inputProps} />
      </Field>
    )
  },
)
