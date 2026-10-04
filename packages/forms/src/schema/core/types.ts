/**
 * Schema-mode types (§10.1–10.4). React-free: every import here is type-only, and none reaches
 * `react` (the `@mitcsutt/kiln-forms/schema` entry must load on a server without React).
 *
 * Two families:
 * - **Typed** (`FormSchema<T, R, X, C>` and friends): derived from the kit's field registry `R`, its
 *   extras `X` (loaders / validators / computers / nodes / layouts) and a context type `C`. Authoring
 *   with these catches wrong kinds, wrong paths, wrong option values, unknown keys and typos.
 * - **Untyped** (`UntypedFormSchema`, `UntypedNode`, …): the structural shape every runtime function
 *   accepts. Any typed schema is assignable to it; `parseFormSchema` produces it from untrusted JSON.
 */
import type { DeepKeys, DeepValue } from '@tanstack/react-form'
import type {
  AccordionVariant,
  AlertTone,
  Align,
  GridColumns,
  GridSpan,
  Justify,
  Responsive,
  Space,
  TabsVariant,
} from '@mitcsutt/kiln-ui'
import type { OptionsLoader } from '#core/hooks/useOptions'
import type {
  ContractOf,
  ExactContract,
  FieldOption,
  OptionContract,
  OptionsContract,
  Primitive,
  PropsOf,
} from '#core/kit/contracts'
import type { ArrayPaths, EmptyObject, ItemOf, PathsFor } from '#core/kit/types'

// ---------------------------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------------------------

/** Any JSON value. */
export type Json = string | number | boolean | null | readonly Json[] | JsonObject
/** A JSON object. An interface (not `Record`) so `Json` can recurse through it. */
export interface JsonObject {
  readonly [key: string]: Json
}

type Scalar = string | number | boolean | null | undefined
type AnyFunction = (...args: never[]) => unknown
/** Structural `ReactElement` (schema core never imports React types). */
interface ElementLike {
  type: unknown
  props: unknown
  key: unknown
}
type HasFunctionKey<V> = true extends {
  [K in keyof V]-?: NonNullable<V[K]> extends AnyFunction ? true : false
}[keyof V]
  ? true
  : false

/**
 * The JSON-expressible part of a prop type: functions → `never`, React elements → `string` (so a
 * `ReactNode` prop becomes text), arrays/tuples and plain objects mapped recursively; objects with
 * methods (promises, iterables, class instances) → `never`.
 */
export type JsonValueOf<V> = V extends Scalar
  ? V
  : V extends AnyFunction
    ? never
    : V extends ElementLike
      ? string
      : V extends readonly unknown[]
        ? { readonly [I in keyof V]: JsonValueOf<V[I]> }
        : V extends object
          ? HasFunctionKey<V> extends true
            ? never
            : { [K in keyof V]: JsonValueOf<V[K]> }
          : never

type DroppedProp = 'children' | 'className' | 'style' | 'dangerouslySetInnerHTML'

/**
 * Only the props expressible in JSON (§10.2): function props dropped, `ReactNode` → text,
 * `children` / `className` / `style` dropped. Distributes over prop unions.
 */
export type JsonProps<P> = P extends unknown
  ? {
      [
        K in keyof P as K extends DroppedProp
          ? never
          : K extends string
            ? [JsonValueOf<Exclude<P[K], undefined>>] extends [never]
              ? never
              : K
            : never
      ]: JsonValueOf<P[K]>
    }
  : never

/** `Omit` that distributes over unions. */
type DistOmit<P, K extends PropertyKey> = P extends unknown ? Omit<P, K> : never
type Elem<A> = A extends readonly (infer E)[] ? E : never

// ---------------------------------------------------------------------------------------------
// Registry-derived keys (§10.5)
// ---------------------------------------------------------------------------------------------

type ExtraKeys<X, Slot extends string> =
  X extends Partial<Readonly<Record<Slot, infer M>>>
    ? M extends object
      ? keyof M & string
      : never
    : never
type ExtraMap<X, Slot extends string> =
  X extends Partial<Readonly<Record<Slot, infer M>>>
    ? M extends object
      ? M
      : EmptyObject
    : EmptyObject

/** `X['loaders']` keys. */
export type LoaderKey<X> = ExtraKeys<X, 'loaders'>
/** `X['validators']` keys. */
export type ValidatorKey<X> = ExtraKeys<X, 'validators'>
/** `X['computers']` keys. */
export type ComputerKey<X> = ExtraKeys<X, 'computers'>
/** `X['nodes']` keys (custom nodes). */
export type CustomNodeKey<X> = ExtraKeys<X, 'nodes'>

/** `{ text: FormTextField, … }` → `{ text: { contract; props } }` (for tooling). */
export type FieldKindsOf<R> = {
  [K in keyof R & string]: { contract: ContractOf<R[K]>; props: PropsOf<R[K]> }
}

// ---------------------------------------------------------------------------------------------
// Registry entries (§10.5) — functions live in the kit, JSON refers to them by key
// ---------------------------------------------------------------------------------------------

/** What a custom validator returns: an error message, or nothing when valid. */
export type ValidatorResult = string | null | undefined

export interface ValidatorContext {
  /** The whole form's values. */
  values: unknown
  /** The rule's `args` from JSON. */
  args?: Json
  /** Aborted when a newer async validation supersedes this one. */
  signal?: AbortSignal
}

/** A registered schema validator (`{ rule: 'custom', validator: key }`). Build with `defineValidator`. */
export interface NamedValidator<V = unknown> {
  readonly '~validator': true
  /** Runs in the async channel (debounced, `signal` honoured). */
  readonly async: boolean
  validate(value: V, ctx: ValidatorContext): ValidatorResult | Promise<ValidatorResult>
}

/** A registered derived-value function (`compute: { computer: key, from }`). Build with `defineComputer`. */
export interface Computer<Out = unknown> {
  readonly '~computer': true
  compute(values: unknown): Out
}

export type { OptionsLoader }

// ---------------------------------------------------------------------------------------------
// Conditions (§10.3)
// ---------------------------------------------------------------------------------------------

type NumberPaths<T> = PathsFor<T, ExactContract<number>>

/** A JSON condition over form values (root paths) and the render `context`. */
export type Condition<T, C = EmptyObject> =
  | {
      [K in DeepKeys<T>]:
        | { field: K; op: 'eq' | 'neq'; value: DeepValue<T, K> }
        | { field: K; op: 'in' | 'notIn'; value: readonly DeepValue<T, K>[] }
        | { field: K; op: 'truthy' | 'falsy' | 'empty' | 'notEmpty' }
    }[DeepKeys<T>]
  | {
      [K in NumberPaths<T>]: { field: K; op: 'gt' | 'gte' | 'lt' | 'lte'; value: number }
    }[NumberPaths<T>]
  | {
      [K in keyof C & string]:
        | { context: K; op: 'eq' | 'neq'; value: C[K] }
        | { context: K; op: 'in'; value: readonly C[K][] }
    }[keyof C & string]
  | { all: readonly Condition<T, C>[] }
  | { any: readonly Condition<T, C>[] }
  | { not: Condition<T, C> }

// ---------------------------------------------------------------------------------------------
// Rules (§10.4)
// ---------------------------------------------------------------------------------------------

/** `message`: literal text (with `{value}` placeholders) or a `'$rules.min'`-style key into messages. */
interface Msg {
  message?: string
}

/** The rules a field whose value is `D` accepts. */
export type RuleFor<D, X> =
  | ({ rule: 'required' } & Msg)
  | ({ rule: 'custom'; validator: ValidatorKey<X>; args?: Json } & Msg)
  | (NonNullable<D> extends string
      ? | ({ rule: 'minLength' | 'maxLength'; value: number } & Msg)
        | ({ rule: 'pattern'; value: string; flags?: string } & Msg)
        | ({ rule: 'email' | 'url' } & Msg)
        | ({ rule: 'minDate' | 'maxDate'; value: string } & Msg)
      : never)
  | (NonNullable<D> extends number
      ? ({ rule: 'min' | 'max' | 'step'; value: number } & Msg) | ({ rule: 'integer' } & Msg)
      : never)
  | (NonNullable<D> extends readonly unknown[]
      ? | ({ rule: 'minItems' | 'maxItems'; value: number } & Msg)
        | ({ rule: 'unique'; by?: string } & Msg)
      : never)

// ---------------------------------------------------------------------------------------------
// Nodes (§10.1, §10.2)
// ---------------------------------------------------------------------------------------------

// Node shapes are type literals, not interfaces: only type literals get the implicit index
// signature that makes a typed schema assignable to `UntypedFormSchema` (whose nodes carry props).

/** What every node may carry. */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- a type literal, see above
export type NodeBase<TRoot, C> = {
  /** Lookup key for `<SchemaNode id>` (unique per schema). */
  id?: string
  /** Rendered only while true (root paths). Hidden fields unmount and are pruned per `whenHidden`. */
  when?: Condition<TRoot, C>
}

/** What hidden fields do with their value (§10.7). Default `prune`. */
export type WhenHidden = 'prune' | 'keep' | 'reset'

/** Schema-only keys of a field node (§10.2). */
export type FieldNodeCommon<TRoot, D, X, C> = NodeBase<TRoot, C> & {
  rules?: readonly RuleFor<D, X>[]
  /** Same rules, non-blocking warning channel. */
  warnRules?: readonly RuleFor<D, X>[]
  /** Field-level default (TanStack prioritised defaults). */
  defaultValue?: D
  whenHidden?: WhenHidden
  disabledWhen?: Condition<TRoot, C>
  readOnlyWhen?: Condition<TRoot, C>
  excludeWhen?: Condition<TRoot, C>
  /** Toggles the `required` prop and the `required` rule. */
  requiredWhen?: Condition<TRoot, C>
  optionsFrom?: { loader: LoaderKey<X>; deps?: readonly DeepKeys<TRoot>[] }
  /** Reset these fields when this one changes. */
  resets?: readonly DeepKeys<TRoot>[]
  /** A derived (read-only) field. */
  compute?: { computer: ComputerKey<X>; from: readonly DeepKeys<TRoot>[] }
}

/** JSON props with `options` typed to the bound path's own value (§3.2 `Specialise`, JSON flavour). */
type JsonSpecialise<Ct, P, D> =
  Ct extends OptionContract<Primitive>
    ? DistOmit<JsonProps<P>, 'options'> & {
        options?: readonly FieldOption<NonNullable<D> & Primitive>[]
      }
    : Ct extends OptionsContract<Primitive>
      ? DistOmit<JsonProps<P>, 'options'> & {
          options?: readonly FieldOption<Elem<NonNullable<D>> & Primitive>[]
        }
      : JsonProps<P>

type FieldNodeOfKind<TScope, TRoot, X, C, K extends string, F> =
  ContractOf<F> extends ExactContract<infer V>
    ? { kind: K; name: PathsFor<TScope, ContractOf<F>> } & FieldNodeCommon<TRoot, V | null, X, C> &
        JsonProps<PropsOf<F>>
    : {
        [N in PathsFor<TScope, ContractOf<F>>]: { kind: K; name: N } & FieldNodeCommon<
          TRoot,
          DeepValue<TScope, N>,
          X,
          C
        > &
          JsonSpecialise<ContractOf<F>, PropsOf<F>, DeepValue<TScope, N>>
      }[PathsFor<TScope, ContractOf<F>>]

/** `{ kind, name, …field props }` for every registered kind; `name` is relative to the scope. */
export type FieldNode<TScope, TRoot, R, X, C> = {
  [K in keyof R & string]: FieldNodeOfKind<TScope, TRoot, X, C, K, R[K]>
}[keyof R & string]

/** Repeater table column sizing — the same values as `@mitcsutt/kiln-ui` `TableColumnWidth`. */
export type RepeaterColumnWidth = 'fill' | 'min'

/** An array of objects with item nodes rendered under `name[i].` (§9.9). Item names are item-relative. */
export type RepeaterNode<TScope, TRoot, R, X, C> = {
  [K in ArrayPaths<TScope>]: NodeBase<TRoot, C> & {
    layout: 'repeater'
    name: K
    label: string
    description?: string
    variant?: 'list' | 'table' | 'cards'
    min?: number
    max?: number
    reorderable?: boolean
    addLabel?: string
    /** Empty-state text. */
    empty?: string
    /**
     * Table variant: one per item field, in order. `width` is ui `TableColumnWidth` (the Repeater
     * prop): `fill` takes the spare width, `min` shrinks to fit; omit it for automatic sizing.
     */
    columns?: readonly { header: string; width?: RepeaterColumnWidth }[]
    /** Array-level rules (`minItems`, `unique`, …). */
    rules?: readonly RuleFor<DeepValue<TScope, K>, X>[]
    whenHidden?: WhenHidden
    /** The value of a newly added item. */
    newItem: ItemOf<TScope, K>
    item: readonly SchemaNodeOf<ItemOf<TScope, K>, TRoot, R, X, C>[]
  }
}[ArrayPaths<TScope>]

type HeadingLevel = 2 | 3 | 4

/** JSON props of the default layouts (§9.1–9.12, minus `children` and function props). */
export interface DefaultLayoutProps {
  stack: { gap?: Responsive<Space>; align?: Align }
  inline: { gap?: Responsive<Space>; align?: Align; justify?: Justify; wrap?: boolean }
  grid: { columns?: Responsive<GridColumns>; gap?: Responsive<Space>; rowGap?: Responsive<Space> }
  gridItem: { span?: Responsive<GridSpan>; start?: Responsive<GridColumns> }
  section: {
    title: string
    description?: string
    titleHidden?: boolean
    as?: 'fieldset' | 'section'
    headingLevel?: HeadingLevel
    disabled?: boolean
    readOnly?: boolean
    gap?: Responsive<Space>
  }
  aside: {
    title: string
    description?: string
    headingLevel?: HeadingLevel
    ratio?: '4/8' | '5/7' | '1/3'
    collapseBelow?: 'sm' | 'md' | 'lg'
  }
  rows: { dividers?: boolean; gap?: Responsive<Space> }
  panels: { columns?: Responsive<1 | 2 | 3>; gap?: Responsive<Space> }
  panel: { title: string; description?: string; headingLevel?: HeadingLevel }
  tabs: { label: string; defaultValue?: string; variant?: TabsVariant }
  tab: { value: string; label: string }
  accordion: {
    type?: 'single' | 'multiple'
    defaultValue?: string | readonly string[]
    variant?: AccordionVariant
  }
  accordionItem: { value: string; title: string; description?: string; headingLevel?: HeadingLevel }
  steps: {
    label?: string
    defaultValue?: string
    linear?: boolean
    nav?: 'auto' | 'none'
    backLabel?: string
    nextLabel?: string
    submitLabel?: string
  }
  step: { value: string; title: string; description?: string }
  sentence: { label: string }
  review: { title?: string }
  actions: { align?: 'start' | 'end' | 'between'; sticky?: boolean; status?: boolean }
}

/** The built-in layout keys (+ `repeater`, which has its own node shape). */
export type DefaultLayoutKey = keyof DefaultLayoutProps

/** Props a custom layout component receives from the renderer (never authored in JSON). */
type LayoutRuntimeProp = 'children' | 'node' | 'scopeNames' | 'form'
type CustomLayoutProps<L> = JsonProps<DistOmit<PropsOf<L>, LayoutRuntimeProp>>
type CustomLayouts<X> = Omit<ExtraMap<X, 'layouts'>, 'repeater'>

/** Layout key → JSON props: the defaults, overridden / extended by `X['layouts']` (§10.5). */
export type LayoutKindsOf<X> = Omit<DefaultLayoutProps, keyof CustomLayouts<X>> & {
  [K in keyof CustomLayouts<X> & string]: CustomLayoutProps<CustomLayouts<X>[K]>
}

/** `{ layout, …layout props, children }`. */
export type LayoutNode<TScope, TRoot, R, X, C> = {
  [K in keyof LayoutKindsOf<X> & string]: NodeBase<TRoot, C> & {
    layout: K
    children: readonly SchemaNodeOf<TScope, TRoot, R, X, C>[]
  } & LayoutKindsOf<X>[K]
}[keyof LayoutKindsOf<X> & string]

/** Static content (§10.1): text, chrome and the form components. */
export type ContentNode<TRoot, C> = NodeBase<TRoot, C> &
  (
    | { content: 'heading'; text: string; level?: HeadingLevel }
    | { content: 'text'; text: string }
    | { content: 'alert'; text: string; title?: string; tone?: AlertTone }
    | { content: 'divider' }
    | { content: 'submit'; label?: string }
    | { content: 'reset'; label?: string }
    | { content: 'errorSummary'; title?: string }
    | { content: 'status' }
  )

/** Every `content` key. */
export type ContentKind = ContentNode<unknown, EmptyObject>['content']

type PropsArg<A> = [A] extends [never] ? JsonObject : A extends { props: infer P } ? P : JsonObject
type CustomNodePropsOf<N> = N extends (props: infer A) => unknown
  ? PropsArg<A>
  : N extends abstract new (props: infer A) => unknown
    ? PropsArg<A>
    : JsonObject

/** `{ custom: key, props? }` — `props` typed from the registered component when it declares them. */
export type CustomNode<TRoot, X, C> = {
  [K in CustomNodeKey<X>]: NodeBase<TRoot, C> & {
    custom: K
    props?: CustomNodePropsOf<ExtraMap<X, 'nodes'>[K]>
  }
}[CustomNodeKey<X>]

/** One node of a schema whose field names are relative to `TScope` and conditions read `TRoot`. */
export type SchemaNodeOf<TScope, TRoot, R, X, C> =
  | FieldNode<TScope, TRoot, R, X, C>
  | RepeaterNode<TScope, TRoot, R, X, C>
  | LayoutNode<TScope, TRoot, R, X, C>
  | ContentNode<TRoot, C>
  | CustomNode<TRoot, X, C>

/** A whole form (§10.1). `R` = field registry, `X` = kit extras, `C` = render context. */
export interface FormSchema<T, R, X = EmptyObject, C = EmptyObject> {
  version: 1
  title?: string
  description?: string
  root: SchemaNodeOf<T, T, R, X, C>
}

// ---------------------------------------------------------------------------------------------
// Untyped (structural) shapes — what runtime functions accept and `parseFormSchema` returns
// ---------------------------------------------------------------------------------------------

export type ConditionOp =
  | 'eq'
  | 'neq'
  | 'in'
  | 'notIn'
  | 'truthy'
  | 'falsy'
  | 'empty'
  | 'notEmpty'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'

export interface UntypedFieldCondition {
  readonly field: string
  readonly op: ConditionOp
  readonly value?: unknown
}
export interface UntypedContextCondition {
  readonly context: string
  readonly op: 'eq' | 'neq' | 'in'
  readonly value?: unknown
}
export type UntypedCondition =
  | UntypedFieldCondition
  | UntypedContextCondition
  | { readonly all: readonly UntypedCondition[] }
  | { readonly any: readonly UntypedCondition[] }
  | { readonly not: UntypedCondition }

export type RuleName =
  | 'required'
  | 'custom'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'min'
  | 'max'
  | 'step'
  | 'integer'
  | 'minItems'
  | 'maxItems'
  | 'unique'
  | 'minDate'
  | 'maxDate'

/** Any rule, untyped (the §2.5 `Rule` export). Typed per field value: `RuleFor<D, X>`. */
export type Rule = UntypedRule

export interface UntypedRule {
  readonly rule: RuleName
  readonly value?: unknown
  readonly flags?: string
  readonly validator?: string
  readonly args?: Json
  readonly by?: string
  readonly message?: string
}

export interface UntypedNodeBase {
  readonly id?: string
  readonly when?: UntypedCondition
}

/** Component props (`label`, `options`, `title`, …) — anything else on a field, layout or content node. */
type UntypedProps = Readonly<Record<string, unknown>>

export interface UntypedFieldNode extends UntypedNodeBase, UntypedProps {
  readonly kind: string
  readonly name: string
  readonly rules?: readonly UntypedRule[]
  readonly warnRules?: readonly UntypedRule[]
  readonly defaultValue?: unknown
  readonly whenHidden?: WhenHidden
  readonly disabledWhen?: UntypedCondition
  readonly readOnlyWhen?: UntypedCondition
  readonly excludeWhen?: UntypedCondition
  readonly requiredWhen?: UntypedCondition
  readonly optionsFrom?: { readonly loader: string; readonly deps?: readonly string[] }
  readonly resets?: readonly string[]
  readonly compute?: { readonly computer: string; readonly from: readonly string[] }
}

export interface UntypedRepeaterNode extends UntypedNodeBase, UntypedProps {
  readonly layout: 'repeater'
  readonly name: string
  readonly label?: string
  readonly rules?: readonly UntypedRule[]
  readonly whenHidden?: WhenHidden
  readonly newItem: unknown
  readonly item: readonly UntypedNode[]
}

export interface UntypedLayoutNode extends UntypedNodeBase, UntypedProps {
  readonly layout: string
  readonly children: readonly UntypedNode[]
}

export interface UntypedContentNode extends UntypedNodeBase, UntypedProps {
  readonly content: ContentKind
}

export interface UntypedCustomNode extends UntypedNodeBase {
  readonly custom: string
  readonly props?: JsonObject
}

export type UntypedNode =
  | UntypedFieldNode
  | UntypedRepeaterNode
  | UntypedLayoutNode
  | UntypedContentNode
  | UntypedCustomNode

/** A schema of unknown values (parsed / untrusted, §10.8). Every typed `FormSchema` is assignable to it. */
export interface UntypedFormSchema {
  readonly version: 1
  readonly title?: string
  readonly description?: string
  readonly root: UntypedNode
}
