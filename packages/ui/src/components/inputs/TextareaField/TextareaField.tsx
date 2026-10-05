import { forwardRef, useId, useState, type ChangeEvent } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import { Textarea, type TextareaProps } from '#components/inputs/Textarea'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import { FieldCount } from '#components/inputs/internal/messages'

export interface TextareaFieldProps extends FieldLabelProps, Omit<TextareaProps, 'invalid'> {
  /** Called with the new string on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void
  /**
   * Shows a "12 / 280" character counter under the field (needs `maxLength`). Announced
   * politely only once the remaining count is within 10% of the limit.
   */
  showCount?: boolean
}

/**
 * A labelled multi-line text field that can grow with its content and count characters.
 *
 * @remarks
 * `TextareaField` is a {@link Field | Field} around a {@link Textarea | Textarea}. Textarea props
 * and the ref go to the `<textarea>`.
 *
 * @privateRemarks
 * Label + Textarea + description + error. Textarea props and the ref go to the
 * `<textarea>`; `className`/`style` go to the field wrapper.
 *
 * <TextareaField label="Notes" autoResize rows={2} optional />
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const {
      id,
      disabled,
      className,
      style,
      onChange,
      onValueChange,
      showCount,
      maxLength,
      ...textareaRest
    } = rest
    const autoId = useId()
    const controlId = id ?? `${autoId}control`
    const countId = `${controlId}-count`

    const [internalValue, setInternalValue] = useState(() =>
      typeof textareaRest.defaultValue === 'string' ? textareaRest.defaultValue : '',
    )
    const currentValue = typeof textareaRest.value === 'string' ? textareaRest.value : internalValue

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(event.target.value)
      onChange?.(event)
      onValueChange?.(event.target.value)
    }

    const showCounter = showCount === true && maxLength != null
    const remaining = maxLength != null ? maxLength - currentValue.length : 0
    const nearLimit = maxLength != null && remaining <= Math.ceil(maxLength * 0.1)

    return (
      <Field {...fieldProps} htmlFor={id} disabled={disabled} className={className} style={style}>
        <Textarea
          ref={ref}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          aria-describedby={showCounter ? countId : undefined}
          {...textareaRest}
        />
        {showCounter ? (
          <FieldCount id={countId} live={nearLimit}>
            {currentValue.length} / {maxLength}
          </FieldCount>
        ) : null}
      </Field>
    )
  },
)
