import type { ComponentType } from 'react'

/** The value types an option may carry. */
export type Primitive = string | number | boolean

export interface FieldOption<V extends Primitive = Primitive> {
  value: V
  label: string
  description?: string
  /** Groups options under a heading (Select groups, Combobox groups). */
  group?: string
  /** Extra search terms for typeahead ("UK", "Britain" for United Kingdom). */
  keywords?: readonly string[]
  disabled?: boolean
}

/** Reads and writes exactly V. The field may additionally be null/undefined. */
export interface ExactContract<V> {
  readonly kind: 'exact'
  readonly value: V
}
/** Single choice. The field's own primitive type is kept; `options` are typed to it. */
export interface OptionContract<B extends Primitive> {
  readonly kind: 'option'
  readonly base: B
}
/** Multiple choice. The field is an array of B; `options` are typed to the element. */
export interface OptionsContract<B extends Primitive> {
  readonly kind: 'options'
  readonly base: B
}
export type Contract =
  ExactContract<unknown> | OptionContract<Primitive> | OptionsContract<Primitive>

/** Phantom key carrying a field's contract. Never set at runtime. */
export const FIELD_CONTRACT: unique symbol = Symbol.for('@mitcsutt/kiln-forms/contract')

/** A registered field component: a component plus its value contract (type-only). */
export type FieldDef<C extends Contract, P> = ComponentType<P> & { readonly [FIELD_CONTRACT]?: C }

/** The contract a field component declares. */
export type ContractOf<F> = F extends { readonly [FIELD_CONTRACT]?: infer C }
  ? NonNullable<C>
  : never
/** The props a field component takes. */
export type PropsOf<F> = F extends ComponentType<infer P> ? P : never

/** `defineField<string>()(MyField)` — binds only to paths whose value is exactly V (or V | null | undefined). */
export const defineField =
  <V>() =>
  <P>(component: ComponentType<P>): FieldDef<ExactContract<V>, P> =>
    component

/** Single-choice field: binds to any primitive path assignable to B; `options` are typed to that path. */
export const defineOptionField =
  <B extends Primitive = Primitive>() =>
  <P extends { options?: readonly FieldOption<B>[] }>(
    component: ComponentType<P>,
  ): FieldDef<OptionContract<B>, P> =>
    component

/** Multiple-choice field: binds to arrays of B; `options` are typed to the element. */
export const defineOptionsField =
  <B extends Primitive = Primitive>() =>
  <P extends { options?: readonly FieldOption<B>[] }>(
    component: ComponentType<P>,
  ): FieldDef<OptionsContract<B>, P> =>
    component
