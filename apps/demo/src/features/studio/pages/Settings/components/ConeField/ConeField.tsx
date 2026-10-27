import {
  accepts,
  defineOptionField,
  FieldView,
  useFieldBinding,
  useFieldPresentation,
  useOptionMapping,
  type CommonFieldProps,
  type FieldOption,
} from '@mitcsutt/kiln-forms'
import { Field } from '@mitcsutt/kiln-ui'

import { ConeSelect } from './components/ConeSelect'

export interface ConeFieldProps extends CommonFieldProps<number | null> {
  label: string
  description?: string
  options?: readonly FieldOption<number>[]
}

/**
 * A field Kiln doesn't ship: pyrometric cones as a plain native select, which kiln technicians
 * asked for because it's quickest by keyboard. Registered once in the settings kit as `form.ConeField`.
 */
export const ConeField = defineOptionField<number>()(function ConeField({
  warn,
  excluded,
  options,
  label,
  description,
  ...props
}: ConeFieldProps) {
  const binding = useFieldBinding<number | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.primitiveOrNull,
    empty: null,
  })
  const mapping = useOptionMapping(options)
  const { layout } = useFieldPresentation()
  if (binding.mode === 'view')
    return <FieldView label={label}>{mapping.labelOf(binding.value)}</FieldView>
  return (
    <Field
      label={label}
      description={description}
      layout={layout ?? binding.fieldProps.layout}
      error={binding.fieldProps.error}
      required={binding.fieldProps.required}
    >
      <ConeSelect
        options={mapping.uiOptions}
        value={mapping.toUi(binding.value)}
        onChange={(next) => {
          binding.setValue(mapping.fromUi(next))
        }}
        onBlur={binding.onBlur}
      />
    </Field>
  )
})
