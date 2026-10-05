/**
 * Shared parity fixtures (§10.11, §16 "same form twice"): each fixture is one form written twice —
 * component mode (JSX) and schema mode (`kit.defineFormSchema` + `kit.SchemaForm`) — that must
 * produce the same accessibility tree (apart from the form landmark's own name, which says which
 * side it is so a page showing both has unique landmarks). Used by the render-equivalence tests
 * (`schema/render/parity.test.tsx`) and by the layout stories.
 */
import type { ComponentType, ReactNode } from 'react'
import { Form } from '#components/form/Form'
import type { EmptyObject, KitForm } from '#kit/types'
import { kit } from '#kit/defaultKit'

/** The default kit's form for values `T` (what component-mode fixtures receive). */
export type FixtureForm<T> = KitForm<T, undefined, typeof kit.registries.fields>

/** A schema typed against the default kit. */
export type FixtureSchema<T, C = EmptyObject> = ReturnType<
  ReturnType<typeof kit.defineFormSchema<T, C>>
>

export interface ParityFixture {
  /** Story / test name, sentence case. */
  name: string
  /** The `layout` (or `content`) keys the fixture exercises. */
  covers: readonly string[]
  /** Component mode: the form written in JSX. */
  ComponentMode: ComponentType
  /** Schema mode: the same form from its schema. */
  SchemaMode: ComponentType
}

export interface ParityDefinition<T, C> {
  name: string
  covers: readonly string[]
  defaultValues: T
  schema: FixtureSchema<T, C>
  /** Render context for `{ context }` conditions (passed to `SchemaForm`). */
  context?: C
  /** Wrap in `<Form mode="view">` (read-only detail page). */
  mode?: 'edit' | 'view'
  render: (form: FixtureForm<T>) => ReactNode
}

/** Builds the two components of a fixture. Each owns its form (`kit.useAppForm`). */
export function defineParity<T, C = EmptyObject>(
  definition: ParityDefinition<T, C>,
): ParityFixture {
  const { name, covers, defaultValues, schema, context, mode, render } = definition
  function ComponentMode() {
    const form = kit.useAppForm<T>({ defaultValues })
    return (
      <Form form={form} aria-label={`${name} (component mode)`} mode={mode}>
        {render(form)}
      </Form>
    )
  }
  ComponentMode.displayName = `${name} (component mode)`
  function SchemaMode() {
    const form = kit.useAppForm<T>({ defaultValues })
    return (
      <Form form={form} aria-label={`${name} (schema mode)`} mode={mode}>
        <kit.SchemaForm form={form} schema={schema} context={context} />
      </Form>
    )
  }
  SchemaMode.displayName = `${name} (schema mode)`
  return { name, covers, ComponentMode, SchemaMode }
}
