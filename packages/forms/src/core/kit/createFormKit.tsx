import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { createFormHook, type AnyFormApi } from '@tanstack/react-form'
import { ErrorSummary, FormStatus, ResetButton, SubmitButton } from '#components'
import { fieldContext, formContext, useFormContext } from '#core/contexts'
import { isDev } from '#core/env'
import { bindFields, fieldComponentName } from '#core/kit/bindFields'
import { createKitAppField, type KitAppFieldProps } from '#core/kit/kitAppField'
import { configureRuntime, toTanStackOptions } from '#core/kit/toTanStackOptions'
import type {
  BoundFields,
  EmptyObject,
  FieldComponentsOf,
  FieldRegistry,
  FormKit,
  ExtrasOf,
  KitExtras,
  KitForm,
  KitFormOptions,
  KitInput,
  ValuesOf,
  WithFormOptions,
} from '#core/kit/types'
import { attachFormRuntime, createFormRuntime } from '#core/runtime/formRuntime'
import { mergeMessages } from '#core/runtime/messages'
import { guardSubmit } from '#core/runtime/submit'
import { defineSchemaFor } from '#schema/core/define'
import { createSchemaComponents, schemaRegistries } from '#schema/render/kitSchema'

const KIND = /^[a-z][A-Za-z0-9]*$/

const baseFormComponents = { SubmitButton, ResetButton, ErrorSummary, FormStatus }

type LooseRender = (props: Record<string, unknown>) => ReactNode

/**
 * Creates a kit (§3.3): one field registry drives `field.TextField` (TanStack canonical),
 * `form.TextField name=…` (typed shorthand) and, later, schema `{ kind: 'text' }`.
 */
export function createFormKit<const K extends KitInput>(
  registries: K,
): FormKit<K['fields'], ExtrasOf<K>> {
  return buildKit<K['fields'], ExtrasOf<K>>(registries)
}

function buildKit<R extends FieldRegistry, X>(registries: { fields: R } & X): FormKit<R, X> {
  const { fields } = registries
  if (isDev()) {
    for (const kind of Object.keys(fields)) {
      if (!KIND.test(kind)) {
        throw new Error(
          `[@mitcsutt/kiln-forms] Field kind "${kind}" must be camelCase ([a-z][A-Za-z0-9]*).`,
        )
      }
    }
  }
  const fieldComponents = Object.fromEntries(
    Object.entries(fields).map(([kind, component]) => [fieldComponentName(kind), component]),
  ) as unknown as FieldComponentsOf<R>
  const extras = registries as unknown as KitExtras
  const formComponents = { ...baseFormComponents, ...extras.formComponents }
  const hook = createFormHook({ fieldContext, formContext, fieldComponents, formComponents })
  const kitDefaults = { messages: extras.messages, formatError: extras.formatError }

  function useAppForm<T, O = T, M = undefined>(options: KitFormOptions<T, O, M>): KitForm<T, M, R> {
    const loose = options as unknown as KitFormOptions<unknown, unknown, unknown>
    const [runtime] = useState(createFormRuntime)
    configureRuntime(runtime, loose, kitDefaults)
    runtime.registry = fields
    const form = hook.useAppForm(toTanStackOptions(loose, runtime)) as unknown as AnyFormApi & {
      AppField: unknown
    }
    attachFormRuntime(form, runtime)
    return useMemo(() => {
      guardSubmit(form)
      form.AppField = createKitAppField(
        form,
        form.AppField as ComponentType<KitAppFieldProps>,
        fieldComponents,
      )
      return Object.assign(form, bindFields(form, fields))
    }, [form]) as unknown as KitForm<T, M, R>
  }

  function withForm<T, P extends object = EmptyObject, M = undefined, O = T>(
    options: WithFormOptions<T, P, M, R, O>,
  ): ComponentType<P & { form: KitForm<T, M, R> }> {
    const render = options.render as unknown as LooseRender
    const defaults = options.props
    function WithForm(props: P & { form: KitForm<T, M, R> }) {
      return render({ ...defaults, ...props })
    }
    return WithForm
  }

  // `<Form>` and `<form.AppForm>` both provide the object `useAppForm` returned, shorthand
  // fields included, so only the type needs restoring. `options` is read for its types only.
  function useTypedAppFormContext<T, O = T, M = undefined>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- infers T and M; see above
    _options: KitFormOptions<T, O, M>,
  ): KitForm<T, M, R> {
    return useFormContext() as unknown as KitForm<T, M, R>
  }

  function useFields<A extends { AppField: unknown; state: { values: unknown } }>(
    api: A,
  ): BoundFields<ValuesOf<A>, R> {
    return bindFields(api, fields) as unknown as BoundFields<ValuesOf<A>, R>
  }

  function extend(more: Partial<KitInput>): FormKit<FieldRegistry, unknown> {
    const extra = more.fields ?? {}
    if (isDev()) {
      for (const kind of Object.keys(extra)) {
        if (kind in fields)
          throw new Error(`[@mitcsutt/kiln-forms] kit.extend: field kind "${kind}" already exists.`)
      }
    }
    const base = registries as unknown as KitInput
    const merged = {
      ...base,
      ...more,
      fields: { ...fields, ...extra },
      formComponents: { ...base.formComponents, ...more.formComponents },
      loaders: { ...base.loaders, ...more.loaders },
      validators: { ...base.validators, ...more.validators },
      computers: { ...base.computers, ...more.computers },
      nodes: { ...base.nodes, ...more.nodes },
      layouts: { ...base.layouts, ...more.layouts },
      messages: mergeMessages(base.messages, more.messages),
    }
    return buildKit<FieldRegistry, unknown>(merged)
  }

  // Schema mode (§10.5–10.6): the renderer resolves kinds, layouts, loaders, validators,
  // computers and custom nodes against this kit's registries (default layouts merged in).
  const schema = createSchemaComponents(schemaRegistries(fields, extras))

  return {
    useAppForm,
    withForm,
    useTypedAppFormContext,
    withFieldGroup: hook.withFieldGroup,
    useFields,
    extend: extend as unknown as FormKit<R, X>['extend'],
    defineFormSchema: defineSchemaFor<R, X>(),
    SchemaForm: schema.SchemaForm as FormKit<R, X>['SchemaForm'],
    SchemaNode: schema.SchemaNode as FormKit<R, X>['SchemaNode'],
    registries,
    fieldContext,
    formContext,
  }
}
