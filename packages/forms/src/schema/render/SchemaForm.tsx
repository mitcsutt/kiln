import { useEffect, useMemo } from 'react'
import type { AnyKitForm } from '#core/kit/types'
import { registerDerive, toFormApi } from '#core/runtime/formRuntime'
import { analyseSchema } from '#schema/core/collect'
import type { UntypedFormSchema } from '#schema/core/types'
import {
  SchemaRenderContext,
  type SchemaRegistries,
  type SchemaRenderValue,
} from '#schema/render/context'
import { schemaDeriveRules } from '#schema/render/derive'
import { SchemaNodeView } from '#schema/render/SchemaNodeView'
import { warnOnce } from '#schema/render/warn'

export interface SchemaRendererProps {
  form: AnyKitForm
  schema: UntypedFormSchema
  context?: Record<string, unknown>
  registries: SchemaRegistries
}

export interface SchemaNodeRendererProps extends SchemaRendererProps {
  id: string
  prefix?: string
}

const NO_CONTEXT: Record<string, unknown> = {}

/**
 * The render value, stable per (form, schema, registries, context *contents*): an inline
 * `context={{ mode: 'edit' }}` doesn't re-render every node when the host re-renders.
 */
function useRenderValue({
  form,
  schema,
  context,
  registries,
}: SchemaRendererProps): SchemaRenderValue {
  const contextKey = context ? JSON.stringify(context) : ''
  const stableContext = useMemo<Record<string, unknown>>(
    () => (contextKey === '' ? NO_CONTEXT : (JSON.parse(contextKey) as Record<string, unknown>)),
    [contextKey],
  )
  return useMemo(
    () => ({
      form,
      api: toFormApi(form),
      schema,
      analysis: analyseSchema(schema),
      registries,
      context: stableContext,
    }),
    [form, schema, registries, stableContext],
  )
}

/**
 * Registers the schema's `compute` fields as runtime derive rules while any renderer of it is
 * mounted (ref-counted per rules list): they run on changes of their `from` paths only — never on
 * mount — and keep running when the computed field is hidden or not rendered.
 */
function useSchemaDerive({ form, schema, registries }: SchemaRenderValue): void {
  const rules = schemaDeriveRules(schema, registries.computers)
  useEffect(
    () => (rules.length === 0 ? undefined : registerDerive(form, rules, rules)),
    [form, rules],
  )
}

/** Renders a whole schema (§10.6). The static analysis is cached per schema object. */
export function SchemaFormRenderer(props: SchemaRendererProps) {
  const value = useRenderValue(props)
  useSchemaDerive(value)
  return (
    <SchemaRenderContext.Provider value={value}>
      <SchemaNodeView node={value.schema.root} prefix="" />
    </SchemaRenderContext.Provider>
  )
}

/** Renders one node of a schema by `id`. Unknown ids render nothing and warn in dev. */
export function SchemaNodeRenderer({ id, prefix = '', ...props }: SchemaNodeRendererProps) {
  const value = useRenderValue(props)
  useSchemaDerive(value)
  const node = value.analysis.nodeById.get(id)
  if (!node) {
    warnOnce(`SchemaNode: no node with id "${id}".`)
    return null
  }
  if (prefix === '' && value.analysis.repeaterOf(node)) {
    warnOnce(
      `SchemaNode: node "${id}" is inside a repeater item; pass \`prefix\` (e.g. "guests[0]").`,
    )
  }
  return (
    <SchemaRenderContext.Provider value={value}>
      <SchemaNodeView node={node} prefix={prefix} />
    </SchemaRenderContext.Provider>
  )
}
