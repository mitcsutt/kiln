import type { FocusEvent } from 'react'
import {
  ColorField as UiColorField,
  type ColorFieldProps as UiColorFieldProps,
} from '@mitcsutt/kiln-ui'
import { FieldView } from '#components/fields/FieldView'
import type { ControlledKeys } from '#components/fields/internal/controlledKeys'
import { accepts, useFieldBinding, type CommonFieldProps } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormColorFieldProps
  extends Omit<UiColorFieldProps, ControlledKeys>, CommonFieldProps<string> {}

/**
 * A colour bound to a `#rrggbb` string.
 *
 * @remarks
 * It renders kiln-ui's {@link ColorField | ColorField}.
 *
 * @example In a schema
 * ```json
 * {
 *   "kind": "color",
 *   "name": "lineColour",
 *   "label": "Line colour",
 *   "swatches": [
 *     {
 *       "value": "#1f6f8b",
 *       "label": "Harbour blue"
 *     }
 *   ]
 * }
 * ```
 *
 * @value `string` (`#rrggbb`)
 * @empty `''`
 *
 * @privateRemarks
 * A colour field bound to a `#rrggbb` `string` path (§7.2 `color`). Empty is `''`. View mode
 * shows the matching swatch's name beside the hex code, when one of `swatches` matches.
 */
export const FormColorField = defineField<string>()(function FormColorField({
  warn,
  excluded,
  onBlur,
  ...props
}: FormColorFieldProps) {
  const binding = useFieldBinding<string>({
    ...props,
    warn,
    excluded,
    accepts: accepts.string,
    empty: '',
  })
  if (binding.mode === 'view') {
    const swatch = props.swatches?.find((candidate) => candidate.value === binding.value)
    return (
      <FieldView label={props.label}>
        {binding.value
          ? swatch
            ? `${swatch.label} (${binding.value})`
            : binding.value
          : undefined}
      </FieldView>
    )
  }
  return (
    <UiColorField
      {...props}
      {...binding.fieldProps}
      ref={binding.ref}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? ''}
      onValueChange={binding.setValue}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event)
        binding.onBlur()
      }}
    />
  )
})
