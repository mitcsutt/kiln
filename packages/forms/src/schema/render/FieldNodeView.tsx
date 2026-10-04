import { createElement, useMemo, type ComponentType } from 'react'
import { getBy, useSelector } from '@tanstack/react-form'
import { useOptions } from '#core/hooks/useOptions'
import type { FieldOption } from '#core/kit/contracts'
import { bindFields, fieldComponentName } from '#core/kit/bindFields'
import type { AnyKitForm } from '#core/kit/types'
import { coreApi, getFormRuntime } from '#core/runtime/formRuntime'
import { shallowEqual } from '#core/runtime/shallow'
import { FormComboboxField } from '#fields/FormComboboxField'
import { FormMultiSelectField } from '#fields/FormMultiSelectField'
import {
  DISABLED,
  EXCLUDED,
  fieldFlags,
  hasConditionFlags,
  READ_ONLY,
  REQUIRED,
} from '#schema/core/fieldFlags'
import { fieldNodeProps } from '#schema/core/nodes'
import { withRequired } from '#schema/core/rules'
import type { UntypedFieldNode } from '#schema/core/types'
import { joinPath } from '#schema/core/values'
import { useSchemaRender } from '#schema/render/context'
import { ruleValidators, ruleWarning } from '#schema/render/rules'
import { warnOnce } from '#schema/render/warn'

interface FieldNodeViewProps {
  node: UntypedFieldNode
  /** Item path inside a repeater (`'guests[2]'`), `''` at the root. */
  prefix: string
}

const NO_DEPS: readonly unknown[] = []

/** `resets`: put each path back to its default (field-level default first, then the form's). */
function resetPaths(form: AnyKitForm, paths: readonly string[]): void {
  const runtime = getFormRuntime(form)
  const core = coreApi(form)
  for (const path of paths) {
    core.resetField(path)
    if (runtime.fieldDefaults.has(path))
      core.setFieldValue(path, runtime.fieldDefaults.get(path), { dontUpdateMeta: true })
  }
}

/**
 * A field node (§10.6): the kit's bound component for its kind (`form.TextField` — so view mode,
 * scopes and focus behave exactly as in component mode), with JSON rules compiled to field
 * validators, condition flags from one primitive selector, `resets` as a change listener and
 * `compute` as a derive registration.
 */
export function FieldNodeView({ node, prefix }: FieldNodeViewProps) {
  const { registries } = useSchemaRender()
  const source = node.optionsFrom
  if (!source) return <FieldNodeBody node={node} prefix={prefix} />
  if (!LOADER_FIELDS.has(registries.fields[node.kind]))
    return <OptionsFromField node={node} prefix={prefix} />
  // Fields with their own async path (§7.4): `loadOptions` + `reloadOn` — typed query, loading
  // state, `optionsFailed`, no request in view mode.
  const loader = registries.loaders[source.loader]
  if (!loader)
    warnOnce(
      `Unknown options loader "${source.loader}" (field "${node.name}"). Register it with kit.extend({ loaders }).`,
    )
  const loaderProps: Record<string, unknown> = {}
  if (loader) loaderProps.loadOptions = loader
  if (source.deps && source.deps.length > 0) loaderProps.reloadOn = source.deps
  return <FieldNodeBody node={node} prefix={prefix} loaderProps={loaderProps} />
}

/** Fields that load options themselves (`loadOptions` / `reloadOn` / `minQueryLength`). */
const LOADER_FIELDS: ReadonlySet<unknown> = new Set<unknown>([
  FormComboboxField,
  FormMultiSelectField,
])

/** Option kinds without a loader prop: `optionsFrom: { loader, deps }` → `useOptions` re-keyed by a shallow-compared tuple of the deps' values. */
function OptionsFromField({ node, prefix }: FieldNodeViewProps) {
  const { api, registries } = useSchemaRender()
  const source = node.optionsFrom
  const loader = source ? registries.loaders[source.loader] : undefined
  if (source && !loader)
    warnOnce(
      `Unknown options loader "${source.loader}" (field "${node.name}"). Register it with kit.extend({ loaders }).`,
    )
  const depPaths = source?.deps
  const deps = useSelector(
    api.store,
    (state) =>
      depPaths && depPaths.length > 0
        ? depPaths.map((path): unknown => getBy(state.values, path))
        : NO_DEPS,
    { compare: shallowEqual },
  )
  // Read when the deps change (this component re-renders then): the loader's `values` context.
  const values: unknown = api.state.values
  const staticOptions = (fieldNodeProps(node).options as readonly FieldOption[] | undefined) ?? []
  const result = useOptions(loader ?? staticOptions, { deps, values, debounceMs: 0 })
  return <FieldNodeBody node={node} prefix={prefix} options={result.options} />
}

function FieldNodeBody({
  node,
  prefix,
  options,
  loaderProps,
}: FieldNodeViewProps & {
  options?: readonly FieldOption[]
  loaderProps?: Record<string, unknown>
}) {
  const { form, api, registries, context } = useSchemaRender()
  const name = joinPath(prefix, node.name)
  // Static props + `*When` conditions + `compute`, the same flags `toStandardSchema` reads.
  const flags = useSelector(api.store, (state) =>
    fieldFlags(node, hasConditionFlags(node) ? state.values : undefined, context),
  )
  const staticProps = useMemo(() => fieldNodeProps(node), [node])
  const required = (flags & REQUIRED) !== 0
  const rules = useMemo(() => withRequired(node.rules, required), [node.rules, required])
  const validators = useMemo(
    () => ruleValidators(rules, node.kind, form, registries.validators),
    [rules, node.kind, form, registries.validators],
  )
  const warn = useMemo(
    () =>
      node.warnRules
        ? ruleWarning(
            node.warnRules,
            node.kind,
            form,
            () => api.state.values,
            registries.validators,
          )
        : undefined,
    [node.warnRules, node.kind, form, api, registries.validators],
  )
  const resets = node.resets
  const listeners = useMemo(
    () =>
      resets && resets.length > 0
        ? {
            onChange: () => {
              resetPaths(form, resets)
            },
          }
        : undefined,
    [resets, form],
  )

  // `compute` is a runtime derive rule registered by the renderer (derive.ts); `fieldFlags` makes it read-only.
  const Bound = bindFields(form as unknown as { AppField: unknown }, registries.fields)[
    fieldComponentName(node.kind)
  ]
  if (!Bound) return null
  const props: Record<string, unknown> = { ...staticProps, name }
  if (validators) props.validators = validators
  if (listeners) props.listeners = listeners
  if (node.defaultValue !== undefined) props.defaultValue = node.defaultValue
  if ((flags & DISABLED) !== 0) props.disabled = true
  if ((flags & READ_ONLY) !== 0) props.readOnly = true
  if ((flags & EXCLUDED) !== 0) props.excluded = true
  if (required) props.required = true
  if (warn) props.warn = warn
  if (options) props.options = options
  if (loaderProps) Object.assign(props, loaderProps)
  return createElement(Bound as ComponentType<Record<string, unknown>>, props)
}
