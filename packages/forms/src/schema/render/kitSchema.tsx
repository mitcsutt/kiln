import type { ReactNode } from 'react'
import type { OptionsLoader } from '#hooks/useOptions'
import type {
  AnyKitForm,
  Computer,
  CustomNodeComponent,
  FieldRegistry,
  KitExtras,
  LayoutComponent,
  NamedValidator,
} from '#kit/types'
import type { UntypedFormSchema } from '#schema/core/types'
import type { SchemaRegistries } from '#schema/render/context'
import { defaultLayouts } from '#schema/render/layouts'
import { SchemaFormRenderer, SchemaNodeRenderer } from '#schema/render/SchemaForm'

function compact<V>(
  record: Readonly<Record<string, V | undefined>> | undefined,
): Record<string, V> {
  const out: Record<string, V> = {}
  for (const [key, value] of Object.entries(record ?? {})) if (value !== undefined) out[key] = value
  return out
}

/** A kit's registries in renderer form: the default layouts with the kit's overrides on top. */
export function schemaRegistries(fields: FieldRegistry, extras: KitExtras): SchemaRegistries {
  return {
    fields,
    layouts: { ...defaultLayouts, ...compact<LayoutComponent>(extras.layouts) },
    loaders: compact<OptionsLoader>(extras.loaders),
    validators: compact<NamedValidator>(extras.validators),
    computers: compact<Computer>(extras.computers),
    nodes: compact<CustomNodeComponent>(extras.nodes),
  }
}

export interface SchemaComponents {
  SchemaForm: (props: {
    form: AnyKitForm
    schema: UntypedFormSchema
    context?: unknown
  }) => ReactNode
  SchemaNode: (props: {
    form: AnyKitForm
    schema: UntypedFormSchema
    context?: unknown
    id: string
    prefix?: string
  }) => ReactNode
}

/** `SchemaForm` / `SchemaNode` bound to a kit's registries (`kit.SchemaForm`, §3.3). */
export function createSchemaComponents(registries: SchemaRegistries): SchemaComponents {
  function SchemaForm(props: { form: AnyKitForm; schema: UntypedFormSchema; context?: unknown }) {
    return (
      <SchemaFormRenderer
        form={props.form}
        schema={props.schema}
        context={props.context as Record<string, unknown> | undefined}
        registries={registries}
      />
    )
  }
  function SchemaNode(props: {
    form: AnyKitForm
    schema: UntypedFormSchema
    context?: unknown
    id: string
    prefix?: string
  }) {
    return (
      <SchemaNodeRenderer
        form={props.form}
        schema={props.schema}
        context={props.context as Record<string, unknown> | undefined}
        registries={registries}
        id={props.id}
        prefix={props.prefix}
      />
    )
  }
  return { SchemaForm, SchemaNode }
}
