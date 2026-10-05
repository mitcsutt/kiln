import { createContext, useContext } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import type { OptionsLoader } from '#hooks/useOptions'
import type { AnyKitForm, CustomNodeComponent, FieldRegistry, LayoutComponent } from '#kit/types'
import type { SchemaAnalysis } from '#schema/core/collect'
import type { Computer, NamedValidator, UntypedFormSchema } from '#schema/core/types'

/** The registries a renderer resolves keys against (a kit's, with the default layouts merged in). */
export interface SchemaRegistries {
  fields: FieldRegistry
  layouts: Readonly<Record<string, LayoutComponent>>
  loaders: Readonly<Record<string, OptionsLoader>>
  validators: Readonly<Record<string, NamedValidator>>
  computers: Readonly<Record<string, Computer>>
  nodes: Readonly<Record<string, CustomNodeComponent>>
}

/** What every node component reads. One stable object per (form, schema, registries, context). */
export interface SchemaRenderValue {
  form: AnyKitForm
  api: AnyFormApi
  schema: UntypedFormSchema
  analysis: SchemaAnalysis
  registries: SchemaRegistries
  /** The `context` that `{ context: … }` conditions read. */
  context: Record<string, unknown>
}

export const SchemaRenderContext = createContext<SchemaRenderValue | null>(null)

export function useSchemaRender(): SchemaRenderValue {
  const value = useContext(SchemaRenderContext)
  if (!value)
    throw new Error(
      '[@mitcsutt/kiln-forms] Schema nodes render inside <SchemaForm> or <SchemaNode>.',
    )
  return value
}
