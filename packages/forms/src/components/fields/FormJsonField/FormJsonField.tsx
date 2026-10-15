import { useCallback, type FocusEvent } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import {
  CodeBlock,
  JsonField as UiJsonField,
  formatJson,
  validateJson,
  type JsonFieldProps as UiJsonFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { useFieldContext } from '#kit/contexts'
import { getFormRuntime } from '#runtime/formRuntime'

export interface FormJsonFieldProps
  extends Omit<UiJsonFieldProps, ControlledKeys | 'onValidationChange'>, CommonFieldProps<string> {}

/**
 * A JSON editor bound to a `string` path: it holds the JSON text, and won't submit text that
 * isn't valid JSON.
 *
 * @remarks
 * It renders kiln-ui's {@link JsonField | JsonField}, so it highlights, numbers the lines, marks
 * the line with an error, and formats or minifies on demand.
 *
 * The value is the text exactly as written, not the parsed value, so nothing typed is lost: text
 * that doesn't parse yet stays in the form (and in autosave and unsaved changes) until it's
 * fixed, and long numbers like `12345678901234567890` keep every digit. Parse it when you use it,
 * with `JSON.parse(values.payload)`. Empty text is `''`, so `required` works as it does on a text
 * field.
 *
 * Text that doesn't parse is an error that blocks submit, like a validator's, with the line and
 * column it points at (`messages.invalidJson`). `validate` adds your own rules for a value that
 * parses: return a message to reject it. That's where a JSON Schema validator goes. Your
 * `validators` and schema `rules` run on the text after both pass.
 *
 * In view mode it shows the JSON formatted, with a copy button.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "json",
 *   "name": "payload",
 *   "label": "Request body",
 *   "formatOnBlur": true,
 *   "maxRows": 16
 * }
 * ```
 *
 * @value `string` (the JSON text)
 * @empty `''`
 *
 * @privateRemarks
 * Text, not the parsed value: a parsed binding would keep text that doesn't parse in component
 * state the form can't see (dirty, autosave, review), lose it on a remount, round numbers through
 * doubles, and conflate JSON `null` with empty. Its exact contract would also match only paths
 * typed exactly as a JSON value type. The syntax check is the binding's `check`, which the kit's
 * validation logic runs in the field's `onDynamic` slot, and `toStandardSchema` runs the same
 * check for the `json` kind on a server.
 */
export const FormJsonField = defineField<string>()(function FormJsonField({
  warn,
  excluded,
  onBlur,
  validate,
  copyLabel,
  ...props
}: FormJsonFieldProps) {
  const messages = getFormRuntime(useFieldContext<string>().form as AnyFormApi).options.messages
  const check = useCallback(
    (text: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- an untyped schema's missing default reads as undefined
      const validation = validateJson(text ?? '', validate)
      return validation.valid ? undefined : messages.invalidJson(validation.error)
    },
    [validate, messages],
  )
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    check,
    accepts: accepts.string,
    empty: '',
  })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- as above
  const text = binding.value ?? ''
  if (binding.mode === 'view') {
    const formatted =
      text.trim() === ''
        ? ''
        : (formatJson(text, {
            ...(props.indent === undefined ? {} : { indent: props.indent }),
            ...(props.sortKeys === undefined ? {} : { sortKeys: props.sortKeys }),
          }) ?? text)
    return (
      <FieldView label={props.label}>
        {formatted === '' ? (
          formatted
        ) : (
          <CodeBlock code={formatted} copyLabel={copyLabel ?? messages.copyJson} />
        )}
      </FieldView>
    )
  }
  return (
    <UiJsonField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      value={text}
      validate={validate}
      copyLabel={copyLabel ?? messages.copyJson}
      onValueChange={(next) => {
        binding.setValue(next)
      }}
      onBlur={(event: FocusEvent<HTMLTextAreaElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
