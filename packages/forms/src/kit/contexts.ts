import { useContext } from 'react'
import { createFormHookContexts, type AnyFormApi } from '@tanstack/react-form'

const contexts = createFormHookContexts()

/**
 * TanStack's field/form contexts. They are module-level singletons inside
 * `@tanstack/react-form`, so every kit (and every `kit.extend`) shares them.
 */
export const { fieldContext, formContext, useFieldContext } = contexts

/** Thrown by the form-context hooks outside a form. */
export const NO_FORM_CONTEXT =
  '[@mitcsutt/kiln-forms] No form in context: render this component inside <Form form={form}> or <form.AppForm>.'

/**
 * The form from the nearest `<Form>` or `<form.AppForm>`, untyped (TanStack's `useFormContext`,
 * with an error that names the providers). `kit.useTypedAppFormContext(options)` is the typed one.
 */
export function useFormContext(): ReturnType<typeof contexts.useFormContext> {
  const form = useContext(formContext) as AnyFormApi | null
  if (!form) throw new Error(NO_FORM_CONTEXT)
  return form as ReturnType<typeof contexts.useFormContext>
}
