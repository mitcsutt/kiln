import { createFormHookContexts } from '@tanstack/react-form'

/**
 * TanStack's field/form contexts. They are module-level singletons inside
 * `@tanstack/react-form`, so every kit (and every `kit.extend`) shares them.
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
