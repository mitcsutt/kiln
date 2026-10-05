import { createFormKit } from '#kit/createFormKit'
import { defaultFields } from '#components/fields/defaultFields'

/** The default kit (every built-in field). Apps with custom fields use `kit.extend({ fields })`. */
export const kit = createFormKit({ fields: defaultFields })

export const {
  useAppForm,
  withForm,
  useTypedAppFormContext,
  withFieldGroup,
  useFields,
  defineFormSchema,
  SchemaForm,
  SchemaNode,
} = kit
