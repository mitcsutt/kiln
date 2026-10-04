// Schema-mode React renderer (§10.5–10.7). The kit binds these to its registries
// (`kit.SchemaForm`, `kit.SchemaNode`); `defineCustomNode` is public.
export { defineCustomNode } from '#schema/render/defineCustomNode'
export { SchemaFormRenderer, SchemaNodeRenderer } from '#schema/render/SchemaForm'
export type { SchemaRendererProps, SchemaNodeRendererProps } from '#schema/render/SchemaForm'
export { createSchemaComponents, schemaRegistries } from '#schema/render/kitSchema'
export type { SchemaComponents } from '#schema/render/kitSchema'
export type { SchemaRegistries } from '#schema/render/context'
export { defaultLayouts, SCOPED_LAYOUTS } from '#schema/render/layouts'
