import { forwardRef, useState } from 'react'
import { Field, type FieldLabelProps } from '#components/inputs/Field'
import {
  JsonInput,
  type JsonInputError,
  type JsonInputProps,
  type JsonValidation,
} from '#components/inputs/JsonInput'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'

export interface JsonFieldProps extends FieldLabelProps, Omit<JsonInputProps, 'invalid'> {}

/** "Line 3, column 12: Remove this comma: nothing follows it". */
export function describeJsonError(error: JsonInputError): string {
  return error.line === undefined
    ? error.message
    : `Line ${String(error.line)}, column ${String(error.column ?? 1)}: ${error.message}`
}

/**
 * A labelled JSON editor that says where the JSON is wrong, formats it on demand and highlights
 * it with the theme.
 *
 * @remarks
 * `JsonField` is a {@link Field | Field} around a {@link JsonInput | JsonInput}. Once typing pauses,
 * or the field loses focus, a syntax error shows as the field's error with its line and column
 * ("Line 3, column 12: Remove this comma: nothing follows it"), and so does a message from
 * `validate`. An `error` you pass wins over both, so a form library can still own the message.
 * JsonInput props and the ref go to the `<textarea>`.
 *
 * @privateRemarks
 * Label + JsonInput + description + error. `className`/`style` go to the field wrapper.
 *
 * <JsonField label="Payload" formatOnBlur validate={check} />
 */
export const JsonField = forwardRef<HTMLTextAreaElement, JsonFieldProps>(
  function JsonField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const { id, disabled, className, style, onValidationChange, ...inputRest } = rest
    const [shown, setShown] = useState<JsonValidation | undefined>(undefined)
    const own = shown?.error ? describeJsonError(shown.error) : undefined

    return (
      <Field
        {...fieldProps}
        error={fieldProps.error ?? own}
        htmlFor={id}
        disabled={disabled}
        className={className}
        style={style}
      >
        <JsonInput
          ref={ref}
          id={id}
          disabled={disabled}
          onValidationChange={(validation) => {
            setShown(validation)
            onValidationChange?.(validation)
          }}
          {...inputRest}
        />
      </Field>
    )
  },
)
