import { memo, type ComponentType, type ReactNode } from 'react'
import { useFieldPresentation } from '#components/fields/FieldPresentation'
import type { FieldRegistry } from '#kit/types'
import { resolveFormPath } from '#kit/formPath'
import { ViewField } from '#kit/viewField'

/** `text` → `TextField` (`form.TextField`). */
export function fieldComponentName(kind: string): string {
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)}Field`
}

interface AppFieldProps {
  name: string
  validators?: unknown
  listeners?: unknown
  defaultValue?: unknown
  asyncDebounceMs?: number
  children: (field: unknown) => ReactNode
}

interface BoundProps extends Record<string, unknown> {
  name: string
  validators?: unknown
  listeners?: unknown
  defaultValue?: unknown
  asyncDebounceMs?: number
}

type BoundRecord = Record<string, ComponentType<BoundProps>>

const cache = new WeakMap<object, WeakMap<object, Map<string, BoundRecord>>>()

function createBound(api: { AppField: unknown }, kind: string, component: unknown, prefix: string) {
  const Component = component as ComponentType<Record<string, unknown>>
  function Bound({
    name,
    validators,
    listeners,
    defaultValue,
    asyncDebounceMs,
    ...props
  }: BoundProps) {
    // View mode never creates a TanStack field: a read-only copy (FormReview) must not take over
    // the real field's instance, validators or meta.
    const mode = useFieldPresentation().mode
    if (mode === 'view') {
      const target = resolveFormPath(api, `${prefix}${name}`)
      return (
        <ViewField form={target.form} name={target.name}>
          <Component {...props} />
        </ViewField>
      )
    }
    const AppField = api.AppField as ComponentType<AppFieldProps>
    const fieldOptions: Omit<AppFieldProps, 'children'> = { name: `${prefix}${name}` }
    if (validators !== undefined) fieldOptions.validators = validators
    if (listeners !== undefined) fieldOptions.listeners = listeners
    if (defaultValue !== undefined) fieldOptions.defaultValue = defaultValue
    if (asyncDebounceMs !== undefined) fieldOptions.asyncDebounceMs = asyncDebounceMs
    return <AppField {...fieldOptions}>{() => <Component {...props} />}</AppField>
  }
  // A bound field depends only on its props, context and its own field subscription, so an
  // unchanged `<form.TextField name label />` skips the host's re-renders (an autosave status,
  // `useUnsavedChanges`, host state) and a Repeater's structural ones (§12).
  const Memo = memo(Bound)
  Memo.displayName = `Bound(${fieldComponentName(kind)})`
  return Memo
}

/**
 * The typed-shorthand components for `api` (a form, a `withForm` form, a field group): each
 * renders `<api.AppField name={prefix + name}>` around the registered field (in view mode, a
 * read-only `ViewField` instead — no TanStack field). Each is `memo`'d, and the set is cached per
 * (api, registry, prefix) so identities are stable across renders and `useFields` calls.
 */
export function bindFields(
  api: { AppField: unknown },
  registry: FieldRegistry,
  prefix = '',
): Record<string, ComponentType<BoundProps>> {
  let byRegistry = cache.get(api)
  if (!byRegistry) {
    byRegistry = new WeakMap()
    cache.set(api, byRegistry)
  }
  let byPrefix = byRegistry.get(registry)
  if (!byPrefix) {
    byPrefix = new Map()
    byRegistry.set(registry, byPrefix)
  }
  const cached = byPrefix.get(prefix)
  if (cached) return cached
  const bound: BoundRecord = {}
  for (const [kind, component] of Object.entries(registry)) {
    bound[fieldComponentName(kind)] = createBound(api, kind, component, prefix)
  }
  byPrefix.set(prefix, bound)
  return bound
}
