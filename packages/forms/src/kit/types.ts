import type { ComponentType, ReactNode } from 'react'
import type {
  AnyFieldApi,
  AnyFormApi,
  AnyFormOptions,
  AppFieldExtendedReactFormApi,
  createFormHook,
  DeepKeys,
  LensFieldComponent,
  DeepValue,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  StandardSchemaV1,
  ValidationLogicFn,
} from '@tanstack/react-form'
import type { ErrorSummary, FormStatus, ResetButton, SubmitButton } from '#components/form'
import type { FormError, NormalisedError } from '#runtime/errors'
import type { ErrorVisibility } from '#runtime/visibility'
import type { fieldContext, formContext } from '#kit/contexts'
import type {
  Contract,
  ContractOf,
  ExactContract,
  FieldDef,
  FieldOption,
  OptionContract,
  OptionsContract,
  Primitive,
  PropsOf,
} from '#kit/contracts'
import type { OptionsLoader } from '#hooks/useOptions'
import type { FormMessages } from '#runtime/messages'
import type { AfterSubmit, FocusOnInvalid, ValidateOn } from '#runtime/formRuntime'
import type {
  Computer,
  FormSchema,
  JsonObject,
  NamedValidator,
  UntypedCustomNode,
  UntypedFormSchema,
  UntypedLayoutNode,
} from '#schema/core/types'

export type { Computer, NamedValidator }

// ---------------------------------------------------------------------------------------------
// §3.2 Path typing
// ---------------------------------------------------------------------------------------------

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type Elem<A> = A extends readonly (infer E)[] ? E : never
type Accepts<C, D> =
  C extends ExactContract<infer V>
    ? Eq<NonNullable<D>, V>
    : C extends OptionContract<infer B>
      ? [NonNullable<D>] extends [B]
        ? [NonNullable<D>] extends [never]
          ? false
          : true
        : false
      : C extends OptionsContract<infer B>
        ? [NonNullable<D>] extends [readonly B[]]
          ? true
          : false
        : false

/** Paths of T a field with contract C may bind to. */
export type PathsFor<T, C> = {
  [K in DeepKeys<T>]: Accepts<C, DeepValue<T, K>> extends true ? K : never
}[DeepKeys<T>]

/** `Omit` that distributes over unions (keeps discriminated prop unions intact). */
type DistOmit<P, K extends PropertyKey> = P extends unknown ? Omit<P, K> : never

/** Option props specialised to the bound field's own value type. */
export type Specialise<C, P, D> =
  C extends OptionContract<Primitive>
    ? DistOmit<P, 'options'> & { options?: readonly FieldOption<NonNullable<D> & Primitive>[] }
    : C extends OptionsContract<Primitive>
      ? DistOmit<P, 'options'> & {
          options?: readonly FieldOption<Elem<NonNullable<D>> & Primitive>[]
        }
      : P

export type FieldComponentName<K extends string> = `${Capitalize<K>}Field`

/**
 * kind → field component. `FieldDef<Contract, never>` would fail for `ComponentType`'s class
 * branch (`defaultProps: Partial<P>` is not assignable to `undefined`), so this is the one
 * documented `any` (§3.2): props stay fully typed at every use through `PropsOf<F>`.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the one documented `any` above
export type FieldRegistry = Record<string, FieldDef<Contract, any>>

/** `{ text: FormTextField }` → `{ TextField: FormTextField }` (TanStack `fieldComponents`). */
export type FieldComponentsOf<R> = { [K in keyof R & string as FieldComponentName<K>]: R[K] }

// ---------------------------------------------------------------------------------------------
// §6.2 Typed shorthand (`form.TextField name=…`)
// ---------------------------------------------------------------------------------------------

type BindValidatorFn<D> = (props: { value: D; fieldApi: AnyFieldApi }) => unknown
type BindAsyncValidatorFn<D> = (props: {
  value: D
  fieldApi: AnyFieldApi
  signal: AbortSignal
}) => Promise<unknown>

/** TanStack's field validator keys, with `value` typed to the bound path (functions or Standard Schema). */
export interface BindValidators<T, D> {
  onMount?: BindValidatorFn<D> | StandardSchemaV1<D>
  onChange?: BindValidatorFn<D> | StandardSchemaV1<D>
  onChangeAsync?: BindAsyncValidatorFn<D> | StandardSchemaV1<D>
  onChangeAsyncDebounceMs?: number
  onChangeListenTo?: readonly DeepKeys<T>[]
  onBlur?: BindValidatorFn<D> | StandardSchemaV1<D>
  onBlurAsync?: BindAsyncValidatorFn<D> | StandardSchemaV1<D>
  onBlurAsyncDebounceMs?: number
  onBlurListenTo?: readonly DeepKeys<T>[]
  onSubmit?: BindValidatorFn<D> | StandardSchemaV1<D>
  onSubmitAsync?: BindAsyncValidatorFn<D> | StandardSchemaV1<D>
  /** Kit timing: blur first, then live (§5.2). */
  onDynamic?: BindValidatorFn<D> | StandardSchemaV1<D>
  onDynamicAsync?: BindAsyncValidatorFn<D> | StandardSchemaV1<D>
  onDynamicAsyncDebounceMs?: number
}

type ListenerFn<D> = (props: { value: D; fieldApi: AnyFieldApi }) => void
export interface BindListeners<D> {
  onChange?: ListenerFn<D>
  onChangeDebounceMs?: number
  onBlur?: ListenerFn<D>
  onBlurDebounceMs?: number
  onMount?: ListenerFn<D>
  onUnmount?: ListenerFn<D>
  onSubmit?: ListenerFn<D>
}

/** The TanStack field options a bound component accepts besides the field's own props. */
export interface BindOptions<T, N extends DeepKeys<T>> {
  name: N
  validators?: BindValidators<T, DeepValue<T, N>>
  listeners?: BindListeners<DeepValue<T, N>>
  defaultValue?: DeepValue<T, N>
  asyncDebounceMs?: number
}

export type BoundComponent<T, F> = <const N extends PathsFor<T, ContractOf<F>>>(
  props: BindOptions<T, N> & Specialise<ContractOf<F>, PropsOf<F>, DeepValue<T, N>>,
) => ReactNode

/** `form.TextField`, `item.fields.NumberField`… — names filtered by contract, option props specialised. */
export type BoundFields<T, R> = {
  [K in keyof R & string as FieldComponentName<K>]: BoundComponent<T, R[K]>
}

// ---------------------------------------------------------------------------------------------
// §3.5 KitForm and its options
// ---------------------------------------------------------------------------------------------

/**
 * The kit's TanStack form components (`form.SubmitButton` inside `form.AppForm`). A `type`, not an
 * `interface`: TanStack constrains it to `Record<string, ComponentType>`, which needs the implicit
 * index signature only type literals get.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- see above
export type KitFormComponents = {
  SubmitButton: typeof SubmitButton
  ResetButton: typeof ResetButton
  ErrorSummary: typeof ErrorSummary
  FormStatus: typeof FormStatus
}

type Slot<T> = undefined | FormValidateOrFn<T>
type AsyncSlot<T> = undefined | FormAsyncValidateOrFn<T>

/**
 * The one form type: TanStack's extended form (every method, `AppField`, `Field`, `Subscribe`…),
 * the typed shorthand fields, and a phantom `'~registry'` so helpers can infer the kit's fields.
 */
export type KitForm<
  T,
  M = undefined,
  R extends FieldRegistry = FieldRegistry,
> = AppFieldExtendedReactFormApi<
  T,
  Slot<T>,
  Slot<T>,
  AsyncSlot<T>,
  Slot<T>,
  AsyncSlot<T>,
  Slot<T>,
  AsyncSlot<T>,
  Slot<T>,
  AsyncSlot<T>,
  AsyncSlot<T>,
  M,
  FieldComponentsOf<R>,
  KitFormComponents
> &
  BoundFields<T, R> & { readonly '~registry'?: R }

/**
 * Any form the package accepts: a `KitForm`, a raw TanStack form (core or React-extended), or a
 * field group. Structural on purpose — TanStack's `AnyFormApi` does not accept concrete forms
 * (its generic methods collapse to `never` under `any`). Every public API takes this type.
 */
export interface AnyKitForm {
  readonly store: object
  readonly state: { readonly values?: unknown }
}

export type ValuesOf<A> = A extends { state: { values: infer V } } ? V : never
/** `{ TextField: FormTextField }` → `{ text: FormTextField }`: the inverse of `FieldComponentsOf`. */
type RegistryFromComponents<FC> = {
  [K in keyof FC & string as K extends `${infer P}Field` ? Uncapitalize<P> : never]: FC[K]
}
/**
 * The kit field registry behind a form-like value: a `KitForm`'s phantom `'~registry'`, or — for
 * a `withFieldGroup` group, which is TanStack's type and carries no phantom — the field
 * components on its `AppField`, so a Repeater inside a group still gets typed item fields.
 */
export type RegistryOf<A> = '~registry' extends keyof A
  ? A extends { readonly '~registry'?: infer R }
    ? NonNullable<R>
    : never
  : // LensFieldComponent's parameters are invariant (`in out`), so the first two must be inferred too.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- see above
    A extends { AppField: LensFieldComponent<infer _Data, infer _Meta, infer FC> }
    ? RegistryFromComponents<FC>
    : never
/** Paths of T that hold arrays of objects (Repeater targets). */
export type ArrayPaths<T> = {
  [K in DeepKeys<T>]: NonNullable<DeepValue<T, K>> extends readonly object[] ? K : never
}[DeepKeys<T>]
/** The item type of the array at path K. */
export type ItemOf<T, K> =
  K extends DeepKeys<T>
    ? NonNullable<DeepValue<T, K>> extends readonly (infer I)[]
      ? I
      : never
    : never

/** What a form-level validator may return: a form message, or messages routed to fields. */
export type FormValidationResult<T> =
  string | null | undefined | { form?: string; fields?: Partial<Record<DeepKeys<T>, FormError>> }

export type KitFormValidatorFn<T> = (props: {
  value: T
  formApi: AnyFormApi
}) => FormValidationResult<T>
export type KitFormAsyncValidatorFn<T> = (props: {
  value: T
  formApi: AnyFormApi
  signal: AbortSignal
}) => Promise<FormValidationResult<T>>

export interface KitFormValidators<T> {
  onMount?: KitFormValidatorFn<T> | StandardSchemaV1<T, unknown>
  onChange?: KitFormValidatorFn<T> | StandardSchemaV1<T, unknown>
  onChangeAsync?: KitFormAsyncValidatorFn<T> | StandardSchemaV1<T, unknown>
  onChangeAsyncDebounceMs?: number
  onBlur?: KitFormValidatorFn<T> | StandardSchemaV1<T, unknown>
  onBlurAsync?: KitFormAsyncValidatorFn<T> | StandardSchemaV1<T, unknown>
  onBlurAsyncDebounceMs?: number
  onSubmit?: KitFormValidatorFn<T> | StandardSchemaV1<T, unknown>
  onSubmitAsync?: KitFormAsyncValidatorFn<T> | StandardSchemaV1<T, unknown>
  onDynamic?: KitFormValidatorFn<T> | StandardSchemaV1<T, unknown>
  onDynamicAsync?: KitFormAsyncValidatorFn<T> | StandardSchemaV1<T, unknown>
  onDynamicAsyncDebounceMs?: number
}

/** TanStack form listeners (`onChange` + `onChangeDebounceMs` drive autosave-style side effects). */
export interface KitFormListeners {
  onChange?: (props: { formApi: AnyFormApi; fieldApi: AnyFieldApi }) => void
  onChangeDebounceMs?: number
  onBlur?: (props: { formApi: AnyFormApi; fieldApi: AnyFieldApi }) => void
  onBlurDebounceMs?: number
  onMount?: (props: { formApi: AnyFormApi }) => void
  onSubmit?: (props: { formApi: AnyFormApi; meta: unknown }) => void
}

/** Recompute `field` from other fields (§6.9). */
export type DeriveRule<T> = {
  [K in DeepKeys<T>]: {
    field: K
    from: readonly DeepKeys<T>[]
    compute: (values: T) => DeepValue<T, K>
  }
}[DeepKeys<T>]

export interface KitFormOptions<T, O = T, M = undefined> {
  defaultValues: T
  /** Whole-form Standard Schema. Its input must be assignable to T; `output` in onSubmit is its output. */
  schema?: StandardSchemaV1<NoInfer<T>, O>
  /** The schema validates asynchronously: run it in the async dynamic slot. */
  schemaAsync?: true
  /** When validation first runs. After a field's first blur (or any submit) it is always live. Default 'blur'. */
  validateOn?: ValidateOn
  /** When errors become visible. Default 'blur' = isBlurred || submitted. */
  errorVisibility?: ErrorVisibility
  validators?: KitFormValidators<NoInfer<T>>
  listeners?: KitFormListeners
  /**
   * Derived fields: recompute `field` from other fields.
   *
   * @privateRemarks Design reference §6.9.
   */
  derive?: readonly DeriveRule<NoInfer<T>>[]
  onSubmitMeta?: M
  onSubmit?: (ctx: {
    value: NoInfer<T>
    output: NoInfer<O>
    formApi: AnyFormApi
    meta: NoInfer<M>
  }) => unknown
  /** Called for non-FormSubmitError throws. Default: console.error + form-level `messages.submitFailed`. */
  onSubmitError?: (ctx: { error: unknown; formApi: AnyFormApi }) => void
  /** Runs after the kit's focus handling. */
  onSubmitInvalid?: (ctx: { value: NoInfer<T>; formApi: AnyFormApi }) => void
  /** After a successful submit. Default 'rebaseline' (submitted values become the new defaults → clean). */
  afterSubmit?: AfterSubmit
  /** Default 'auto' = the ErrorSummary if one is mounted, else the first invalid field. */
  focusOnInvalid?: FocusOnInvalid
  formatError?: (error: NormalisedError) => string
  messages?: Partial<FormMessages>
  /** An explicit TanStack validation logic (e.g. `revalidateLogic()`); inactive gating still wraps it. */
  validationLogic?: ValidationLogicFn
  // TanStack passthrough
  formId?: string
  asyncAlways?: boolean
  asyncDebounceMs?: number
  /** Default `true` in the kit: every submit validates every field (so all errors show at once). */
  canSubmitWhenInvalid?: boolean
  transform?: AnyFormOptions['transform']
  defaultState?: AnyFormOptions['defaultState']
}

export interface WithFormOptions<
  T,
  P extends object,
  M,
  R extends FieldRegistry,
  O = T,
> extends KitFormOptions<T, O, M> {
  /** Extra props the component takes besides `form` (values here are the defaults). */
  props?: P
  render: (props: P & { form: KitForm<T, M, R> }) => ReactNode
}

// ---------------------------------------------------------------------------------------------
// §3.3 FormKit
// ---------------------------------------------------------------------------------------------

/** What a custom node component receives (§10.5). `props` are the node's JSON `props`. */
export interface CustomNodeProps<P = JsonObject> {
  form: AnyKitForm
  props: P
  node: UntypedCustomNode
}
/**
 * A schema custom node (`{ custom: key, props }`), built with `defineCustomNode`. A function
 * component; `P` types the node's JSON `props` (the registry slot uses `never`, so any `P` fits).
 */
export type CustomNodeComponent<P = never> = (props: CustomNodeProps<P>) => ReactNode

/** What the renderer passes a custom layout besides the node's JSON props (§10.5). */
export interface LayoutRenderProps {
  /** The schema node being rendered. */
  node: UntypedLayoutNode
  form: AnyKitForm
  /** Static field names of the subtree (scope-bearing keys only: `tab`, `accordionItem`, `step`, `sentence`). */
  scopeNames?: readonly string[]
  /** The node's children, already rendered. */
  children: ReactNode
}
/** A schema layout component. The built-in §9 layouts get only their JSON props + `children`. */
export type LayoutComponent = ComponentType<never>
/** `layout` key → component (defaults: the §9 table; `kit.extend({ layouts })` adds or overrides). */
export type LayoutRegistry = Record<string, LayoutComponent>

export interface KitRegistries<R extends FieldRegistry> {
  /** kind → field component. `text` becomes field.TextField / form.TextField / { kind: 'text' }. */
  fields: R
  /** Extra TanStack form components (read useFormContext()). */
  formComponents?: Record<string, ComponentType<never>>
  /** Schema-only registries — functions referenced by key from JSON. */
  loaders?: Record<string, OptionsLoader>
  validators?: Record<string, NamedValidator>
  computers?: Record<string, Computer>
  nodes?: Record<string, CustomNodeComponent>
  /** Overrides for the schema layout registry. */
  layouts?: Partial<LayoutRegistry>
  messages?: Partial<FormMessages>
  formatError?: (error: NormalisedError) => string
}

/** Everything but `fields`. */
export type KitExtras = Omit<KitRegistries<FieldRegistry>, 'fields'>
/** What `createFormKit` takes: the field registry plus optional extras. */
export type KitInput = { fields: FieldRegistry } & KitExtras
/** A kit input's extras (`X`): everything but `fields`, exactly as written (so keys stay literal). */
export type ExtrasOf<K> = Omit<K, 'fields'>
/** The `fields` of an `extend` input, or none. */
type FieldsOf<K> = K extends { fields: infer F extends FieldRegistry } ? F : EmptyObject

type TanStackHook<R extends FieldRegistry> = ReturnType<
  typeof createFormHook<FieldComponentsOf<R>, KitFormComponents>
>

/** TanStack `withFieldGroup`, unchanged types. Use `useFields(group)` inside for typed shorthand. */
export type KitWithFieldGroup<R extends FieldRegistry> = TanStackHook<R>['withFieldGroup']

/** No keys: the default for an empty registry, extras or context. */
// eslint-disable-next-line @typescript-eslint/no-generated-empty-object-type -- `{}` is the intent: no keys
export type EmptyObject = Record<never, never>

export interface FormKit<R extends FieldRegistry, X> {
  /** TanStack useAppForm + kit options (§3.5) + typed shorthand fields on the result. */
  useAppForm: <T, O = T, M = undefined>(options: KitFormOptions<T, O, M>) => KitForm<T, M, R>
  /** Split big forms. The `form` prop is a `KitForm<T>` (shorthand fields available). */
  withForm: <T, P extends object = EmptyObject, M = undefined, O = T>(
    options: WithFormOptions<T, P, M, R, O>,
  ) => ComponentType<P & { form: KitForm<T, M, R> }>
  /**
   * The form from the nearest `<Form>` or `<form.AppForm>`, typed by the options it was created
   * with (share them through `formOptions`), for a component nested anywhere below it. Throws
   * outside a form.
   */
  useTypedAppFormContext: <T, O = T, M = undefined>(
    options: KitFormOptions<T, O, M>,
  ) => KitForm<T, M, R>
  withFieldGroup: KitWithFieldGroup<R>
  /** Typed shorthand fields for any api (form, withForm form, field group). */
  useFields: <A extends { AppField: unknown; state: { values: unknown } }>(
    api: A,
  ) => BoundFields<ValuesOf<A>, R>
  /** Adds fields / formComponents / registries; duplicate field kinds are a type error (and throw in dev). */
  extend: <const K2 extends Partial<KitInput>>(
    more: K2 & { fields?: { [K in keyof R]?: never } },
  ) => FormKit<R & FieldsOf<K2>, X & ExtrasOf<K2>>
  /**
   * A typed schema for this kit (§10.1): curried so `T` (and the render context `C`) are explicit and
   * the literal is checked against the kit's kinds, layouts, loaders, validators and nodes.
   */
  defineFormSchema: <T, C = EmptyObject>() => (
    schema: FormSchema<T, R, X, C>,
  ) => KitFormSchema<T, R, X, C>
  /** Renders a schema (§10.6): one component per node, never subscribing to values itself. */
  SchemaForm: <A extends AnyKitForm, S extends SchemaFor<A>>(
    props: SchemaFormProps<A, S>,
  ) => ReactNode
  /** Renders one node of a schema by `id`, anywhere in JSX. */
  SchemaNode: <A extends AnyKitForm, S extends SchemaFor<A>>(
    props: SchemaNodeProps<A, S>,
  ) => ReactNode
  /** The registries (read-only), for tooling and custom renderers. */
  registries: { readonly fields: R } & X
  fieldContext: typeof fieldContext
  formContext: typeof formContext
}

// ---------------------------------------------------------------------------------------------
// §10.6 Schema rendering
// ---------------------------------------------------------------------------------------------

/** Phantom marker a kit's `defineFormSchema` adds: the values and context types it was checked against. */
export interface SchemaTypes<T, C> {
  readonly '~types'?: { readonly values: T; readonly context: C }
}

/** What `kit.defineFormSchema` returns: the typed schema plus its phantom value/context types. */
export type KitFormSchema<T, R, X, C> = FormSchema<T, R, X, C> & SchemaTypes<T, C>

/**
 * A schema `SchemaForm` accepts for form `A`: any schema (parsed / untrusted ones too), but a
 * schema from `defineFormSchema<T>()` must have been typed for the form's values.
 */
export type SchemaFor<A> = UntypedFormSchema & SchemaTypes<ValuesOf<A>, unknown>

/** The render context a schema's conditions read (typed for a `defineFormSchema` schema). */
export type SchemaContextOf<S> = S extends { readonly '~types'?: infer B }
  ? NonNullable<B> extends { readonly context: infer C }
    ? C
    : Record<string, unknown>
  : Record<string, unknown>

export interface SchemaFormProps<A, S> {
  form: A
  schema: S
  /** Read by `{ context: key, … }` conditions (e.g. create vs edit). */
  context?: SchemaContextOf<S>
}

export interface SchemaNodeProps<A, S> extends SchemaFormProps<A, S> {
  /** The node's `id` in the schema. */
  id: string
  /** For a node inside a repeater item: the item path (`'guests[2]'`) its names are relative to. */
  prefix?: string
}
