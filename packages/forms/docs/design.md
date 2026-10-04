# Kiln forms: design reference

This is the design reference for `@mitcsutt/kiln-forms`. Code comments cite it as `§n`, `§n.m`, `§13 #n` (a row of the coverage matrix) and `A.n` (Appendix A). Section numbers are stable: rewrite a section's text if the design moves, but don't renumber or remove a heading.

- The binding rules for contributors (how to add a field or a layout, what may and may not go in the package) are in [`packages/forms/AGENTS.md`](../AGENTS.md).
- Decisions are recorded in [`docs/adr/`](../../../docs/adr/README.md). The kiln-forms port, including how name collisions with kiln-ui were resolved, is [ADR 0017](../../../docs/adr/0017-kiln-forms-port.md).
- Visual and copy rules come from [`DESIGN.md`](../../../DESIGN.md); kiln-ui component rules come from [`packages/ui/AGENTS.md`](../../ui/AGENTS.md).

Where this document says **must**, a test enforces it. Where it gives a signature, the code implements that signature unless a typecheck proved it impossible; those departures are recorded in Appendix A. Where an Appendix A entry and the body disagree, the entry wins.

---

## 0. Decisions at a glance

| #   | Decision                                                                                                                                                                                                                                                                                      | Why (one line)                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| D1  | Build on **TanStack Form 1.33.5** (v1 stable), wrapped by a thin **kit** facade. Consumers never install `@tanstack/react-form` themselves.                                                                                                                                                   | v2 is alpha; one module instance keeps contexts shared; a later v2 move stays inside the package.                        |
| D2  | **One registry per kit** (`createFormKit({ fields })`) keyed by _kind_ (`text`, `amount`…). The same registry drives `field.TextField` (TanStack canonical), `form.TextField name=…` (typed shorthand) and schema `{ kind: 'text' }`.                                                         | Component mode and schema mode can never drift; custom fields register once and appear everywhere.                       |
| D3  | Every field declares a **value contract** (`exact<V>`, `option<B>`, `options<B>`). Typed paths are filtered by contract; option props are specialised to the field's own type.                                                                                                                | Fixes TanStack v1's unchecked `useFieldContext<T>()`, and makes binding a checkbox to a string path a type error (§3.2). |
| D4  | `@mitcsutt/kiln-forms` contains **zero CSS and zero visual markup**. Every field binds exactly one `@mitcsutt/kiln-ui` `*Field` component; every layout composes kiln-ui primitives. Missing inputs are built in kiln-ui first.                                                               | kiln-ui stays usable without TanStack; forms stays logic-only (DESIGN §1.3).                                             |
| D5  | **One binding hook** (`useFieldBinding`) owns ids, error visibility, error normalisation, warnings, disabled/readOnly/excluded semantics, focus registration and view mode. Field components are about 15 lines.                                                                              | One place for policy is one place to test (the conformance suite, §15).                                                  |
| D6  | Error visibility default: **`isBlurred \|\| submissionAttempts > 0`**. Validation default: **validate on blur, then live after the first blur or submit** ("reward early, punish late"), through a custom `validationLogic`.                                                                  | Best-practice timing without v2's `errorVisibility`.                                                                     |
| D7  | Validation accepts **any Standard Schema** (zod 4, valibot, arktype…) at form or field level, plus plain functions. **No validation library is a runtime dependency**; zod is a devDependency for tests and stories.                                                                          | No lock-in; TanStack already speaks Standard Schema.                                                                     |
| D8  | `onSubmit` receives `{ value, output }`, where `output` is the form schema's parsed output (transforms applied). Hidden fields are **pruned** (replaced by their defaults) before both.                                                                                                       | The output type of a transforming schema isn't lost, and hidden values don't leak into the payload.                      |
| D9  | Interactivity and payload are separate: `disabled`, `readOnly`, `excluded` and hidden-by-`When` each have one documented meaning (§5.4).                                                                                                                                                      | Conflating "locked", "hidden" and "omitted" is the usual source of payload bugs (§13 #25, #47).                          |
| D10 | Layouts are **components first**, and every one has a **1:1 schema node** with the same props. Tabs, accordion and steps keep their fields mounted (`forceMount` + `hidden`), so counts, validation and focus work across hidden panels.                                                      | Everything usable in component mode must be configurable in schema mode.                                                 |
| D11 | Schema mode is **JSON-serialisable**: functions live in kit registries (loaders, validators, computers, custom nodes) referenced by typed string keys. A React-free `@mitcsutt/kiln-forms/schema` entry validates untrusted schemas and compiles rules to a Standard Schema for server reuse. | Server-driven forms, and the same rules on both sides.                                                                   |
| D12 | Accessibility: native semantics first (`form`, `fieldset`/`legend`, `label`), submit is **never `disabled`**, one error summary per submit, focus the first invalid field in **DOM order** after revealing its tab, accordion item or step.                                                   | WCAG 3.3.1, 3.3.3 and 4.1.3; the GOV.UK error pattern.                                                                   |
| D13 | Performance: only the edited field re-renders on a keystroke; form-wide reads are primitive selectors; a render-count test proves it (§12).                                                                                                                                                   | TanStack's store is fine-grained; the facade must not break that.                                                        |
| D14 | Works on **React 18.3 and 19** (peer `^18.3.0 \|\| ^19.0.0`), tested on both.                                                                                                                                                                                                                 | Matches kiln-ui ([ADR 0004](../../../docs/adr/0004-react-18-and-19.md)).                                                 |
| D15 | All library copy (summary title, "Add", "Step 2 of 4", default rule messages) lives in an overridable `messages` dictionary; errors pass through `formatError`.                                                                                                                               | No hard-coded English.                                                                                                   |

---

## 1. Goals and non-goals

**Goals**

1. Two first-class authoring modes over one engine: **component mode** (TanStack's `createFormHook` way: `useAppForm`, `AppField`, `withForm`, `withFieldGroup`) and **schema mode** (a typed JSON schema rendered by `<SchemaForm>`).
2. Breadth: 28 bound fields covering every common input (§7), each a thin binding over a themeable kiln-ui component.
3. Creative, semantic layouts: grid, section, aside (settings), rows, panels, tabs, accordion, steps, repeater (list, table, cards), sentence, review, actions (§9).
4. Type safety end to end: paths, value types, option values, conditions, rules, submit output.
5. Never lock in: raw TanStack access, custom fields, custom layouts, custom schema nodes and bare kiln-ui controls inside `form.Field` all work (§14).

**Non-goals (v1)**

- A calendar-popover date picker (needs a date library, so a separate ADR; v1 uses native date and time inputs).
- Phone formatting and validation (needs libphonenumber; write a custom field in the consuming app).
- Rich text, signatures, drag-and-drop reordering (keyboard move up/down ships instead), upload transport (fields hold `File`s; the consumer uploads in `onSubmit`).
- JSON Schema import or export (conditions and layout don't map cleanly; §10.10).
- Styling knobs of any kind in kiln-forms.

---

## 2. Package architecture

### 2.1 Layers

```
consuming app            composes forms; may extend the kit with its own fields (§3.4)
  │
@mitcsutt/kiln-forms     form-state logic only: kit, binding, fields (bindings), layouts (composition),
  │                      schema (types + renderer). No CSS, no new visual markup.
  ├── @tanstack/react-form  engine (dependency, ^1.33.5, never installed separately by consumers)
  └── @mitcsutt/kiln-ui     every pixel (peer). New inputs are built there first.
```

### 2.2 Folder layout (`packages/forms/src`)

```
index.ts                         public barrel (§2.5)
kit.ts                           the default kit: createFormKit({ fields: defaultFields, ... })
core/
  contexts.ts                    createFormHookContexts() → fieldContext, formContext, useFieldContext, useFormContext
  kit/
    contracts.ts                 Primitive, FieldOption, contracts, FIELD_CONTRACT, FieldDef, define*Field
    types.ts                     PathsFor, FieldComponentName, BoundFields, KitForm, KitFormOptions, FormKit
    createFormKit.tsx            the factory (§3)
    bindFields.tsx               runtime for form.XField / useFields / Repeater item fields
    formOptions.ts               typed identity helper
  runtime/
    formRuntime.ts               WeakMap<FormApi, FormRuntime>: config, field registry, inactive map, reveal
    validationLogic.ts           kitValidationLogic (reward-early + inactive gating)
    standardSchema.ts            validate + route issues to paths + filter inactive
    submit.ts                    submit pipeline (prune → parse → onSubmit → afterSubmit → errors)
    serverErrors.ts              FormSubmitError, applyServerErrors
    focus.ts                     focusField, focusFirstInvalid (DOM order, reveal chain)
    messages.ts                  FormMessages, defaultMessages, interpolate
    shallow.ts                   shallowEqual (for useSelector compare), no react-store dependency
  binding/
    useFieldBinding.ts           the binding hook (§4)
    errors.ts                    normaliseError, pickError (slot priority), FormError types
    visibility.ts                errorVisibility policies
    presentation.tsx             FieldPresentation context (layout hints, mode, disabled/readOnly cascade)
    optionValues.ts              useOptionMapping (§7.3)
    FieldView.tsx                view-mode rendering (A.4)
  scope/
    FieldScope.tsx               nested scopes collecting mounted field names + reveal()
    useScopeErrors.ts            error count selector for a scope
  hooks/
    useFormStatus  useFieldValue  useServerValues  useAutosave  useUnsavedChanges  useOptions
components/                      Form, SubmitButton, ResetButton, ErrorSummary, FormStatus
fields/Form<Name>Field/          Form<Name>Field.tsx, .test.tsx, .stories.tsx, index.ts
fields/defaultFields.ts          the default registry object (kind → bound field)
layouts/<Name>/                  FormGrid, FormSection, FormAside, FormRows, FormPanels, FormTabs,
                                 FormAccordion, FormSteps, Repeater, FormSentence, FormActions,
                                 FormReview, When (+ tests + stories + index.ts)
schema/
  core/                          React-free (also published as `@mitcsutt/kiln-forms/schema`)
    types  conditions  rules  parseFormSchema  toStandardSchema  collect  fieldFlags  ...
  render/
    SchemaForm  SchemaNode  renderField  renderLayout  layoutRegistry
test/                            setup, renderForm, conformance (runFieldConformance), a11y, perf,
                                 plus cross-cutting behaviour tests
stories/                         shared story helpers, parity fixtures, Getting started recipes, schema stories
../scripts/check-schema-entry.ts  the ./schema entry in plain Node, from the packed tarball
```

Folder-per-component mirrors kiln-ui ("always a folder, never a flat file").

### 2.3 Imports

- Inside the package, use **`#` subpath imports**, aligned with kiln-ui: `package.json` has `"imports": { "#*": ["./src/*", "./src/*.ts", "./src/*.tsx", "./src/*/index.ts", "./src/*/index.tsx"] }`, so code writes `import { useFieldBinding } from '#core/binding/useFieldBinding'`. Never `../../`, and never import `src/index.ts` internally.
- From kiln-ui, import only the public barrel (`import { Field, Stack } from '@mitcsutt/kiln-ui'`), never deep paths.

### 2.4 `package.json`

The relevant shape (the real file also carries the published-package metadata):

```jsonc
{
  "name": "@mitcsutt/kiln-forms",
  "type": "module",
  "sideEffects": false,
  "imports": {
    "#*": ["./src/*", "./src/*.ts", "./src/*.tsx", "./src/*/index.ts", "./src/*/index.tsx"],
  },
  // In the workspace the entries point at source; publishConfig swaps in the built dist files.
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/core/index.ts", // React-free: types, parse, conditions, rules → Standard Schema
    "./package.json": "./package.json",
  },
  "peerDependencies": {
    "@mitcsutt/kiln-ui": ">=0.1.0 <1.0.0", // ADR 0017
    "react": "^18.3.0 || ^19.0.0",
    "react-dom": "^18.3.0 || ^19.0.0",
  },
  "dependencies": { "@tanstack/react-form": "catalog:" }, // ^1.33.5, the only runtime dependency
  "devDependencies": {
    "zod": "catalog:", // tests and stories only; any Standard Schema library works
    "axe-core": "catalog:", // accessibility assertions in tests
    "@mitcsutt/kiln-testing-react18": "workspace:*", // private fixture for the React 18 run (§15.1)
    // + Testing Library, Vitest, Storybook types, publint, attw
  },
}
```

- **No `@tanstack/react-store`**: `useSelector` is re-exported by `@tanstack/react-form` and accepts `{ compare }`; the package ships its own `shallowEqual`.
- **No runtime validation library.** zod stays a devDependency. The Standard Schema type comes from `@tanstack/react-form` (`StandardSchemaV1`).
- `@tanstack/react-form-start` belongs in the consuming app; `useAppForm` passes `transform` through.
- The build is Vite library mode, ESM only, with `.d.ts` output ([ADR 0005](../../../docs/adr/0005-library-build.md)).

### 2.5 Public API (`src/index.ts`)

`src/index.ts` is the source of truth; keep this section in step with it. The groups are:

- **Kit.** `createFormKit`, `formOptions`, and the default kit's `kit`, `useAppForm`, `withForm`, `withFieldGroup`, `useFields`, `defineFormSchema`, `SchemaForm`, `SchemaNode`. Types: `FormKit`, `KitForm`, `KitFormOptions`, `AnyKitForm`, `BoundFields`, `PathsFor`, `FieldComponentName`, `FieldRegistry`, `LayoutRegistry`, `KitRegistries`, `DeriveRule`, `KitFormValidators`, `KitFormListeners`, `FormValidationResult`, `ValuesOf`, `ArrayPaths`, `ItemOf`, `CustomNodeComponent`, `CustomNodeProps`, `LayoutComponent`, `LayoutRenderProps`, `KitFormSchema`, `SchemaFormProps`, `SchemaNodeProps`.
- **Field authoring.** `defineField`, `defineOptionField`, `defineOptionsField` and the contract types; `useFieldBinding`, `accepts`, `FieldBinding`, `FieldBindingOptions`, `CommonFieldProps`, `BoundFieldProps`; `useOptionMapping`; `FieldView`, `FieldViewList`, `FieldViewListBoundary`; `useFieldContext`, `useFormContext`; `normaliseError` and the error types; `FieldPresentation`, `useFieldPresentation`; `FieldScope`, `useFieldScope`, `useScopeErrors`; `focusField`, `focusFirstInvalid`.
- **Bound fields.** `FormTextField` … `FormHiddenField`, each with its `Form<Name>FieldProps` type (§7.2), and `defaultFields`. The `Form` prefix keeps them apart from kiln-ui's unbound `*Field` components of the same base name ([ADR 0017](../../../docs/adr/0017-kiln-forms-port.md)). Inside a form the kit shorthand is unchanged: `form.TextField`, `field.TextField`, schema `{ kind: 'text' }`. `FieldLayout` is not re-exported: it is kiln-ui's type.
- **Form components.** `Form`, `SubmitButton`, `ResetButton`, `ErrorSummary`, `FormStatus` and their props types.
- **Layouts.** `FormGrid`, `FormGridItem`, `FormSection`, `FormAside`, `FormRows`, `FormPanels`, `FormPanel`, `FormTabs`, `FormTab`, `FormAccordion`, `FormAccordionItem`, `FormSteps`, `FormStep`, `useFormSteps`, `Repeater`, `FormSentence`, `FormActions`, `FormReview`, `When`, and their props types.
- **Hooks.** `useFormStatus`, `useFieldValue`, `useServerValues`, `useAutosave`, `useUnsavedChanges`, `useOptions` and their option and result types.
- **Submission and errors.** `FormSubmitError`, `applyServerErrors`, `defaultMessages`, `FormMessages`.
- **Schema.** `parseFormSchema`, `evaluateCondition`, `toStandardSchema`, `schemaDefaultValues`, `defineLoader`, `defineValidator`, `defineComputer`, `defineCustomNode`, and the schema types (`FormSchema`, `SchemaNodeOf`, `FieldNode`, `LayoutNode`, `ContentNode`, `CustomNode`, `RepeaterNode`, `Condition`, `Rule`, `RuleFor`, `UntypedFormSchema`, `NamedValidator`, `Computer`, `Json`, `ParseFormSchemaOptions`, `ParseFormSchemaResult`, `SchemaIssue`, `SchemaRegistryNames`, `ToStandardSchemaOptions`). The React-free subset is also at `@mitcsutt/kiln-forms/schema` (A.11).
- **TanStack passthroughs**, so consumers never import `@tanstack/react-form` directly: `useSelector`, `revalidateLogic`, and the types `DeepKeys`, `DeepValue`, `DeepKeysOfType`, `AnyFieldApi`, `AnyFormApi`, `StandardSchemaV1`.

A consumer with custom fields creates its own kit and imports from there (§3.4).

---

## 3. The kit

### 3.1 Value contracts and `FieldDef` (`core/kit/contracts.ts`)

```ts
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

// phantom key, never set at runtime
export const FIELD_CONTRACT: unique symbol = Symbol.for('@mitcsutt/kiln-forms/contract')
export type FieldDef<C extends Contract, P> = ComponentType<P> & { readonly [FIELD_CONTRACT]?: C }

export const defineField =
  <V>() =>
  <P>(component: ComponentType<P>): FieldDef<ExactContract<V>, P> =>
    component
export const defineOptionField =
  <B extends Primitive = Primitive>() =>
  <P extends { options?: readonly FieldOption<B>[] }>(
    component: ComponentType<P>,
  ): FieldDef<OptionContract<B>, P> =>
    component
export const defineOptionsField =
  <B extends Primitive = Primitive>() =>
  <P extends { options?: readonly FieldOption<B>[] }>(
    component: ComponentType<P>,
  ): FieldDef<OptionsContract<B>, P> =>
    component
```

The define helpers are identity at runtime. `FIELD_CONTRACT` is a real exported symbol so declaration emit can name it.

### 3.2 Path typing (`core/kit/types.ts`)

Verified with tsc 5.9 and 6.0.

```ts
type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type Elem<A> = A extends ReadonlyArray<infer E> ? E : never
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
        ? [NonNullable<D>] extends [ReadonlyArray<B>]
          ? true
          : false
        : false

/** Paths of T a field with contract C may bind to. */
export type PathsFor<T, C> = {
  [K in DeepKeys<T>]: Accepts<C, DeepValue<T, K>> extends true ? K : never
}[DeepKeys<T>]

/** Option props specialised to the bound field's own value type. */
export type Specialise<C, P, D> =
  C extends OptionContract<Primitive>
    ? Omit<P, 'options'> & { options?: readonly FieldOption<NonNullable<D>>[] }
    : C extends OptionsContract<Primitive>
      ? Omit<P, 'options'> & { options?: readonly FieldOption<Elem<NonNullable<D>>>[] }
      : P

export type FieldComponentName<K extends string> = `${Capitalize<K>}Field`
// The one allowed `any` (A.1): props must be contravariant enough for any component to fit.
export type FieldRegistry = Record<string, FieldDef<Contract, any>>
```

Rules this encodes (each has a `@ts-expect-error` test in `core/kit/types.test-d.tsx`):

| Binding                                                                              | Result                                                                              |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `TextField` → `name: string`, `nickname?: string`, `address.city`, `people[0].first` | ok                                                                                  |
| `TextField` → `age: number \| null`                                                  | error                                                                               |
| `TextField` → `role: 'admin' \| 'user'`                                              | **error**: a text box would write arbitrary strings; use Select, Radio or Segmented |
| `NumberField` → `age: number \| null` or `age: number`                               | ok (empty emits `null`, §7.3)                                                       |
| `SelectField` → `role` with `options: [{ value: 'root' }]`                           | error: option values are typed to the union                                         |
| `SelectField` → `size: 1 \| 2 \| 3`                                                  | ok, options typed `FieldOption<1 \| 2 \| 3>`                                        |
| `CheckboxGroupField` → `tags: ('a' \| 'b')[]` with option `'c'`                      | error                                                                               |
| `CheckboxGroupField` → `agree: boolean`                                              | error                                                                               |

The names in the table are the kit shorthand (`form.TextField`); the exported components are `FormTextField` and so on (§2.5).

### 3.3 `createFormKit` (`core/kit/createFormKit.tsx`)

```ts
export interface KitRegistries<R extends FieldRegistry> {
  /** kind → field component. `text` becomes field.TextField / form.TextField / { kind: 'text' }. */
  fields: R
  /** Extra TanStack form components (read useFormContext()). */
  formComponents?: Record<string, ComponentType<any>>
  /** Schema-only registries: functions referenced by key from JSON. */
  loaders?: Record<string, OptionsLoader> // defineLoader(...)
  validators?: Record<string, NamedValidator> // defineValidator<V>(...)
  computers?: Record<string, Computer> // defineComputer(...)
  nodes?: Record<string, CustomNodeComponent> // defineCustomNode(...)
  /** Overrides for the schema layout registry (defaults: the §9 table). */
  layouts?: Partial<LayoutRegistry>
  messages?: Partial<FormMessages>
  formatError?: (error: NormalisedError) => string
}

export interface FormKit<R extends FieldRegistry, X> {
  /** TanStack useAppForm + kit options (§3.5) + typed shorthand fields on the result. */
  useAppForm: <T, O = T, M = undefined>(options: KitFormOptions<T, O, M>) => KitForm<T, M, R>
  /** Split big forms. The `form` prop is KitForm<T> (shorthand fields available). */
  withForm: <T, P extends object = {}, M = undefined>(
    options: WithFormOptions<T, P, M, R>,
  ) => ComponentType<P & { form: KitForm<T, M, R> }>
  /** TanStack withFieldGroup, unchanged types. Use useFields(group) inside for typed shorthand. */
  withFieldGroup: TanStackWithFieldGroup<R>
  /** Typed shorthand fields for any api (form, withForm form, field group), optionally under a path prefix. */
  useFields: <A extends { AppField: unknown; state: { values: unknown } }>(
    api: A,
  ) => BoundFields<ValuesOf<A>, R>
  /** Adds fields, formComponents and registries; duplicate keys are a type error (wraps TanStack extendForm). */
  extend: (more: KitInput) => FormKit<R & R2, X & X2>
  /** Curried so T is explicit and the schema is checked against the registries (§10). */
  defineFormSchema: <T, TContext = {}>() => (
    schema: FormSchema<T, R, X, TContext>,
  ) => FormSchema<T, R, X, TContext>
  SchemaForm: <T>(props: SchemaFormProps<T, R, X>) => ReactNode
  SchemaNode: <T>(props: SchemaNodeProps<T, R, X>) => ReactNode
  /** The registries (read-only), for tooling and custom renderers. */
  registries: { fields: R } & X
  fieldContext: typeof fieldContext
  formContext: typeof formContext
}
```

`createFormKit` takes one const generic over the whole registries object (A.1).

Runtime:

1. `fieldComponents = { [`${Capitalize(kind)}Field`]: component }` → `createFormHook({ fieldContext, formContext, fieldComponents, formComponents: { SubmitButton, ResetButton, ErrorSummary, FormStatus, ...formComponents } })`.
2. `useAppForm(options)` = `const form = base.useAppForm(toTanStackOptions(options))`, then `useMemo(() => attachBoundFields(form, registry), [form])` and `useRegisterRuntime(form, options)`. Bound components are created **once per form instance** (memoised on the api object and stored in a WeakMap, so `useFields(form)` returns the same identities).
3. A bound component is:
   ```tsx
   function Bound({ name, validators, listeners, defaultValue, asyncDebounceMs, ...props }) {
     return (
       <api.AppField
         name={prefix + name}
         validators={validators}
         listeners={listeners}
         defaultValue={defaultValue}
         asyncDebounceMs={asyncDebounceMs}
       >
         {() => <Component {...props} />}
       </api.AppField>
     )
   }
   ```
   Its `displayName` is `Bound(TextField)`. Field groups pass `group` as `api` (its `AppField` already maps names).
4. Kind keys must be camelCase `[a-z][A-Za-z0-9]*`; the `Field` suffix guarantees no collision with `FormApi` members. `extend` also throws in development on runtime duplicates.

### 3.4 Kits in apps (non-lock-in)

A consuming app that adds its own fields or registries extends the default kit once, in a module of its own, and imports form hooks from there instead of from the package:

```ts
// forms.ts in the consuming app
import { kit } from '@mitcsutt/kiln-forms'
import { LocationField } from './LocationField'
import { placesLoader } from './placesLoader'

export const { useAppForm, withForm, withFieldGroup, useFields, defineFormSchema, SchemaForm } =
  kit.extend({ fields: { location: LocationField }, loaders: { places: placesLoader } })
```

TanStack's contexts are module-level singletons, so extended kits interoperate with the base kit's form components and layouts.

### 3.5 `useAppForm` options (`KitFormOptions<T, O, M>`)

Everything TanStack's `FormOptions` has, typed in the kit's own terms so validator callbacks are contextually typed (TanStack's `any`-slotted validator generics break contextual typing), plus kit options:

```ts
export interface KitFormOptions<T, O = T, M = undefined> {
  defaultValues: T
  /** Whole-form Standard Schema. Its input must be assignable to T; `output` in onSubmit is its output. */
  schema?: StandardSchemaV1<NoInfer<T>, O>
  /** Set when `schema` validates asynchronously; moves the adapter to `onDynamicAsync` (§5.3). */
  schemaAsync?: true
  /** When field and form validation first runs. After a field's first blur (or any submit) it is always live. Default 'blur'. */
  validateOn?: 'blur' | 'change' | 'submit'
  /** When errors become visible. Default 'blur' = isBlurred || submitted. */
  errorVisibility?: ErrorVisibility
  validators?: KitFormValidators<NoInfer<T>> // onMount/onChange/onBlur/onSubmit/…Async/onDynamic (fn | Standard Schema)
  listeners?: KitFormListeners<NoInfer<T>> // TanStack form listeners (onChange + onChangeDebounceMs → autosave)
  /** Derived fields: recompute `field` from other fields (§6.9). */
  derive?: readonly DeriveRule<NoInfer<T>>[]
  onSubmitMeta?: M
  onSubmit?: (ctx: {
    value: NoInfer<T>
    output: NoInfer<O>
    formApi: AnyFormApi
    meta: NoInfer<M>
  }) => unknown | Promise<unknown>
  /** Called for throws that aren't a FormSubmitError. Default: console.error + form-level `messages.submitFailed`. */
  onSubmitError?: (ctx: { error: unknown; formApi: AnyFormApi }) => void
  /** Runs after the kit's own focus handling. */
  onSubmitInvalid?: (ctx: { value: NoInfer<T>; formApi: AnyFormApi }) => void
  /** After a successful submit. Default 'rebaseline' (submitted values become the new defaults, so the form is clean). */
  afterSubmit?: 'rebaseline' | 'reset' | 'keep' | 'lock'
  /** Default 'auto' = the ErrorSummary if one is mounted, else the first invalid field. */
  focusOnInvalid?: 'auto' | 'first-field' | 'summary' | false
  formatError?: (error: NormalisedError) => string
  messages?: Partial<FormMessages>
  // passthrough: formId, asyncAlways, asyncDebounceMs, canSubmitWhenInvalid, transform, defaultState
}

type FormValidationResult<T> =
  string | null | undefined | { form?: string; fields?: Partial<Record<DeepKeys<T>, FormError>> }
```

Mapping to TanStack (in `toTanStackOptions`):

- `schema` → `validators.onDynamic = schemaValidator(schema)` (the adapter in §5.3); submit also re-parses for `output`.
- All form validators are wrapped to **drop errors for inactive paths** (§5.4) and to normalise.
- `validationLogic = kitValidationLogic({ validateOn })` (§5.2). Passing an explicit `validationLogic` (for example `revalidateLogic()`) is allowed; inactive gating still wraps it.
- `onSubmit` and `onSubmitInvalid` are replaced by the submit pipeline (§5.5).
- `derive` is composed into `listeners.onChange`.

The returned `KitForm<T, M, R>` is `AppFieldExtendedReactFormApi<T, any…, M, FieldComponentsOf<R>, FormComponents> & BoundFields<T, R> & { readonly '~registry'?: R }`. The `any` validator slots are TanStack's own generics, written once inside `types.ts`. The phantom `'~registry'` lets package-level helpers (`Repeater`, `When`, `useFieldValue`, `useFields`) infer the kit's registry from the `form` they are given, so an extended kit's custom fields appear in `item.fields`. It is one named type used by `useAppForm`, `withForm`'s `form` prop and the helpers, so a form flows anywhere: `any` validator slots accept a concrete form, and a form of a different shape is rejected.

`formOptions(opts)` is a typed identity for sharing options between `useAppForm` and `withForm`.

---

## 4. The binding layer: `useFieldBinding`

Every field component in kiln-forms, and every custom field a consumer writes, uses this one hook.

### 4.1 Contract

```ts
export interface CommonFieldProps<V> {
  /** Non-blocking advice shown in the warning channel (never blocks submit). */
  warn?: (value: V) => string | null | undefined
  /** Visible but excluded: skips validation, clears its errors, submits its default value. */
  excluded?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
}

export interface FieldBindingOptions<V> extends CommonFieldProps<V> {
  /** Dev-only guard for canonical `field.X` use, where TS cannot check the value type. */
  accepts: (value: unknown) => boolean // e.g. accepts.string, accepts.numberOrNull
  /** Value this field writes when cleared ('' | null | [] | false). Used by rules like `required`. */
  empty: V
}

export interface FieldBinding<V> {
  /** Raw TanStack FieldApi, the escape hatch (value typed via `value`/`setValue`). */
  api: AnyFieldApi
  name: string // TanStack path, also the native `name` (bracket syntax, FormData-compatible)
  id: string // useId()-based control id (never derived from name)
  value: V
  setValue: (next: V) => void // field.handleChange; no-op when readOnly/disabled
  onBlur: () => void // field.handleBlur
  ref: RefCallback<HTMLElement> // registers the focus target (control element)
  mode: 'edit' | 'view' // FieldPresentation mode (FormReview / Form mode="view")
  state: {
    showError: boolean
    error?: string // first visible error, formatted
    warning?: string
    isValidating: boolean
    isDirty: boolean // !isDefaultValue
    inactive: boolean // disabled | readOnly | excluded | hidden
  }
  /** Spread onto the kiln-ui *Field component. */
  fieldProps: BoundFieldProps
}

/** Exactly the kiln-ui FieldLabelProps additions (§8.1) + wiring. */
export interface BoundFieldProps {
  id: string
  name: string
  'data-field': string // stable end-to-end test hook (§13 #56)
  error?: string | true
  errorLive: boolean
  errorHidden?: boolean
  warning?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  validating?: boolean
  layout?: FieldLayout // kiln-ui's type
  labelHidden?: boolean
  'aria-describedby'?: string // external error id (sentence layout)
}

export function useFieldBinding<V>(options: FieldBindingOptions<V>): FieldBinding<V>
```

A field component is therefore:

```tsx
import {
  NumberField as UiNumberField,
  type NumberFieldProps as UiNumberFieldProps,
} from '@mitcsutt/kiln-ui'

export interface FormNumberFieldProps
  extends Omit<UiNumberFieldProps, ControlledKeys>, CommonFieldProps<number | null> {}

export const FormNumberField = defineField<number>()(function FormNumberField({
  warn,
  excluded,
  ...props
}: FormNumberFieldProps) {
  const b = useFieldBinding<number | null>({
    ...props,
    warn,
    excluded,
    accepts: accepts.numberOrNull,
    empty: null,
  })
  if (b.mode === 'view') return <FieldView label={props.label}>{/* formatted value */}</FieldView>
  return (
    <UiNumberField
      {...props}
      {...b.fieldProps}
      ref={b.ref}
      value={b.value}
      onValueChange={b.setValue}
      onBlur={b.onBlur}
    />
  )
})
// ControlledKeys = 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'name' | 'id'
//                | 'error' | 'warning' | 'errorLive' | 'errorHidden' | 'validating'
```

View mode renders through kiln-ui's `DataList` (A.4); kiln-forms adds no markup of its own.

### 4.2 Behaviour (each line is a conformance test, §15.1)

1. **Ids**: `useId()`, passed as the ui component's `id` (ui `Field` uses it as `htmlFor`). Two forms with the same field names never collide.
2. **Name**: the TanStack path (`guests[0].name`) is set as the native `name` (on hidden Radix inputs too), so native `FormData` and progressive enhancement work.
3. **Error pick**: from `meta.errorMap` in slot priority `onServer > onSubmit > onDynamic > onChange > onBlur > onMount`; flatten arrays; normalise (§4.3); dedupe; show the **first** message only (one message per field, as GOV.UK does).
4. **Visibility**: `showError = hasError && policy(meta, submitted)`, where `submitted = useSelector(field.form.store, s => s.submissionAttempts > 0)` (a boolean that flips once). Policies: `'blur'` (default) is `isBlurred || submitted`; `'change'` is `isTouched || submitted`; `'submit'` is `submitted`; or a function `(s: { meta, submitted }) => boolean`. The form's policy is read from the runtime (§5.1). `aria-invalid` mirrors `showError` exactly (ui derives it from `error`).
5. **errorLive**: `true` before the first submit (the one error that appears on blur is announced), `false` after (the ErrorSummary announces once; inline errors are reached through `aria-describedby`).
6. **Warnings**: `warning = warn?.(value)`, computed during render (memoised on `value`), shown under the same visibility policy, suppressed while an error is shown.
7. **Server errors** (`onServer` slot) clear on the field's next change (a field listener installed by the binding) or on submit (A.2).
8. **Inactive** (`disabled || readOnly || excluded || hidden`): registers the path in the runtime's inactive map (§5.4), clears the field's `errorMap` once on becoming inactive, and `setValue` becomes a no-op. `disabled` → ui `disabled` (not focusable). `readOnly` → ui `readOnly` (focusable, announced read-only). `excluded` → still editable.
9. **Presentation**: merges the nearest `FieldPresentation` (layout, labelHidden, errorPlacement, mode, disabled/readOnly cascade from `Form` and `FormSection`) under the component's own props. Own props win, except that a cascaded `disabled` or `readOnly` cannot be overridden to `false`.
10. **Focus registration**: `ref`, `id`, a `getLabel()` (reads the ui label's `textContent` through `${id}-label`) and the current scope chain are registered in the runtime's field registry under `name`, and unregistered on unmount.
11. **Validating**: `validating = meta.isValidating`; ui shows a spinner and sets `aria-busy` on the control.
12. **Dev guard**: `if (import.meta.env.DEV && !accepts(value)) console.error(...)`, once per field. It catches wrong components in the canonical `field.X` path that TypeScript cannot check.
13. **View mode**: `mode === 'view'` → the field renders its display value, with no control and no validation UI.

### 4.3 Error normalisation (`core/binding/errors.ts`)

```ts
export type FormError =
  | string
  | true
  | StandardSchemaV1.Issue // { message, path? }
  | { message: string; code?: string; params?: Record<string, unknown> }
  | Error
export interface NormalisedError {
  message: string
  code?: string
  params?: Record<string, unknown>
  path?: string
}
// strings, issues, { message }, Error; `true` → { message: '' } (invalid, no text); anything else → null
export function normaliseError(e: unknown): NormalisedError | null
```

The displayed text is `formatError(normalised)` (kit-level, overridable per form); the default returns `message`. A rule message that starts with `$` (`'$rules.minLength'`) is a message _key_, resolved through `messages` with `params` interpolation (`{value}`).

---

## 5. Runtime: config, validation, submit

### 5.1 `FormRuntime` (`core/runtime/formRuntime.ts`)

Per-form state that isn't form _values_, stored in a `WeakMap<AnyFormApi, FormRuntime>` (created by `useAppForm`, or lazily with defaults for a raw TanStack form):

```ts
interface FormRuntime {
  options: { errorVisibility; validateOn; focusOnInvalid; afterSubmit; formatError; messages }
  fields: Map<
    string,
    {
      id: string
      focus(): void
      getLabel(): string
      scopes: ScopeHandle[]
      element(): HTMLElement | null
    }
  >
  inactive: Map<
    string,
    { reason: 'disabled' | 'readOnly' | 'excluded' | 'hidden'; submit: 'keep' | 'prune' }
  >
  summary: { mounted: boolean; focus(): void } | null
  formElement: HTMLFormElement | null
  locked: boolean // afterSubmit: 'lock'
}
export function getFormRuntime(form: AnyFormApi): FormRuntime
```

Runtime state isn't React state. Components that must re-render on it (tab counts) subscribe through `useSyncExternalStore` to a small emitter on the runtime. The build added a few more members (the kit's registry, derive rules, repeater item templates; A.1, A.9, A.11).

### 5.2 Validation logic (`kitValidationLogic`)

A `ValidationLogicFn` (TanStack 1.29+ passes `event.fieldName`):

- **Inactive gate**: if `event.fieldName` is inactive and `validators !== form.options.validators` (that is, field-level validators), run nothing.
- Standard slots (`onChange`, `onBlur`, `onSubmit`, `onMount`, `onServer` and their async forms) behave exactly like `defaultValidationLogic`, so canonical TanStack validators keep their meaning.
- **`onDynamic`** (where the form `schema`, schema-mode rules and the bound shorthand's validators go) runs:
  - on `submit`: always;
  - on `blur`: when `validateOn !== 'submit'`;
  - on `change`: when `validateOn === 'change'`, **or** the field `isBlurred`, **or** the field currently has an error, **or** `submissionAttempts > 0` (reward early, punish late);
  - for form-level `onDynamic` triggered by a field event, the same predicate is evaluated for that field, and it also runs while the form-level validator has errors showing, so a fix in one field clears a stale cross-field error on another (§13 #20).

Test matrix in `validationLogic.test.ts`: {blur, change, submit} × {before blur, after blur, after submit} × {field, form}.

### 5.3 Standard Schema adapter (`standardSchema.ts`)

`schemaValidator(schema)` returns a TanStack form validator that:

1. calls `schema['~standard'].validate(value)`. A Promise from a sync slot throws a development error telling the author to pass `schemaAsync: true`, which moves the adapter to `onDynamicAsync`;
2. routes issues by path: `['guests', 0, 'name']` → `guests[0].name` (the same format as TanStack's `prefixSchemaToErrors`); path-less issues go to `form`;
3. drops issues whose path is inactive or under an inactive prefix;
4. returns `{ form?: Issue[], fields: Record<path, Issue[]> }`.

### 5.4 Interactivity vs payload (the one table)

| State                 | Editable      | Focusable                 | Validated                          | Errors           | Submitted value                                                                                       | Set by                                                                        |
| --------------------- | ------------- | ------------------------- | ---------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| normal                | yes           | yes                       | yes                                | shown per policy | current                                                                                               | —                                                                             |
| `readOnly`            | no            | yes (announced read-only) | **no** (native readonly semantics) | cleared          | current                                                                                               | field prop, `Form readOnly`, `FormSection readOnly`                           |
| `disabled`            | no            | no                        | **no**                             | cleared          | current                                                                                               | field prop, `Form disabled`, `FormSection disabled` (native fieldset cascade) |
| `excluded`            | yes           | yes                       | **no**                             | cleared          | **default**                                                                                           | field prop, schema `excludeWhen`                                              |
| hidden (`When` false) | — (unmounted) | —                         | **no**                             | cleared          | **default** (`whenHidden: 'prune'`, the default) · current (`'keep'`) · reset immediately (`'reset'`) | `When`, schema `when`, `FormSteps.Step` inside a `When`                       |

"Default" is the field's default: field-level `defaultValue`, else form `defaultValues` (TanStack's prioritised defaults). Pruning keeps the value type honest (a default is always a valid `T` leaf), unlike deleting keys. User input survives hide and show while editing; only the payload is pruned. (One exception after a rebaselining submit: A.10.)

`When` knows which paths it governs by collecting the names of fields mounted inside it (`FieldScope`, §9.0), remembered after it hides. Pass `names` explicitly for fields that were never shown (edit mode with a hidden server value). Schema mode computes names statically.

### 5.5 Submit pipeline (`submit.ts`)

`<Form>` calls `form.handleSubmit(meta)` and catches its promise. Inside TanStack's `onSubmit` the pipeline runs:

1. `pruned = prune(value, runtime.inactive, defaults)`.
2. If there is a `schema`: `result = await schema['~standard'].validate(pruned)`. Issues here are applied as `onSubmit` errors and the pipeline stops (defensive: normally already caught by `onDynamic`; see A.2 for the inactive-path case).
3. `await options.onSubmit({ value: pruned, output: result.value ?? pruned, formApi, meta })`.
4. On success, `afterSubmit`: `'rebaseline'` (default) is `form.reset(pruned)` with those values as the new defaults (clean, `isDirty` false); `'reset'` is `form.reset()` to the original defaults; `'keep'` does nothing; `'lock'` does nothing and sets `runtime.locked = true` (the SubmitButton stays `aria-disabled` until `form.reset()`, for modals).
5. On `throw FormSubmitError`: `applyServerErrors(form, error.errors)` (field errors to the `onServer` slot; the form error to form `onServer`); `isSubmitSuccessful` stays false; focus per `focusOnInvalid`.
6. On any other throw: `onSubmitError?.({ error, formApi })`; the default is `console.error(error)` plus the form-level `onServer` error `messages.submitFailed`. **Never** an unhandled rejection; resubmitting is always possible.
7. While `isSubmitting`, further submits (Enter key, double click) are ignored by `<Form>`.

```ts
export class FormSubmitError<T = unknown> extends Error {
  constructor(public errors: { form?: string; fields?: Partial<Record<DeepKeys<T>, string>> })
}
export function applyServerErrors<T>(
  form: KitForm<T>,
  errors: { form?: string; fields?: Partial<Record<DeepKeys<T>, string>> },
): void
```

Invalid submit (`onSubmitInvalid`): `focusOnInvalid` `'auto'` focuses the summary if one is mounted, else the first field; then the author's `onSubmitInvalid` runs.

### 5.6 Focus (`focus.ts`)

`focusFirstInvalid(form)`, after `requestAnimationFrame` (to let React commit `aria-invalid`):

1. collect registered fields with a current error, sorted by **DOM order** (`compareDocumentPosition`);
2. for the first, call `reveal()` on each scope in its chain, outermost first (tab → accordion item → step);
3. on the next frame, `focus()` its element. If the element isn't focusable (a radiogroup root), focus its first focusable descendant (`[tabindex]:not([tabindex="-1"]), input, button, select, textarea, [role=combobox]`);
4. `scrollIntoView({ block: 'center' })`, or `block: 'nearest'` with no smooth scrolling under `prefers-reduced-motion`.

`focusField(form, name)` does steps 2 to 4 for one name (used by ErrorSummary links and Repeater).

---

## 6. Component mode

### 6.1 The canonical TanStack path (always available)

```tsx
const form = useAppForm({
  defaultValues: { email: '', plan: 'monthly' as Plan },
  schema: signupSchema,
  onSubmit: async ({ output }) => api.signup(output),
})

<Form form={form}>
  <form.AppField
    name="email"
    validators={{ onBlurAsync: checkEmailFree, onBlurAsyncDebounceMs: 400 }}
  >
    {(field) => <field.TextField label="Email" type="email" autoComplete="email" required />}
  </form.AppField>
  <form.SubmitButton>Create account</form.SubmitButton>
</Form>
```

`field.TextField` is TanStack's own mechanism. TypeScript doesn't check the value type here; the dev guard (§4.2 item 12) catches misuse at runtime.

### 6.2 Typed shorthand (recommended default in docs and recipes)

```tsx
<form.TextField name="email" label="Email" type="email" autoComplete="email" required />
<form.SegmentedField
  name="plan"
  label="Billing"
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]}
/>
<form.AmountField
  name="amount"
  label="Amount claimed"
  currency="GBP"
  validators={{
    onDynamic: ({ value }) =>
      value !== null && value > 500 ? 'Claims over £500 need a manager’s approval' : undefined,
  }}
  listeners={{ onChange: ({ value }) => track('claim_amount_changed', value) }}
/>
```

Props are the field's own props (option props specialised) plus `BindOptions`: `{ name; validators?: BindValidators<D>; listeners?: BindListeners<D>; defaultValue?: D; asyncDebounceMs? }`, where `BindValidators<D>` mirrors TanStack's field validator keys with `value: D` (functions or Standard Schema) and `onChangeListenTo?: DeepKeys<T>[]`. `name` is filtered by the contract (§3.2).

### 6.3 `withForm` and `withFieldGroup`

```tsx
const registrationOptions = formOptions({
  defaultValues: emptyRegistration,
  schema: registrationSchema,
})

export const ContactDetails = withForm({
  ...registrationOptions,
  props: { heading: 'Contact details' },
  render: function ContactDetails({ form, heading }) {
    return (
      <FormSection title={heading}>
        <form.TextField name="name" label="Full name" autoComplete="name" required />
        <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
      </FormSection>
    )
  },
})

export const PasswordPair = withFieldGroup({
  defaultValues: { password: '', confirm: '' },
  render: function PasswordPair({ group }) {
    const f = useFields(group)
    return (
      <>
        <f.PasswordField name="password" label="Password" autoComplete="new-password" required />
        <f.PasswordField
          name="confirm"
          label="Confirm password"
          autoComplete="new-password"
          validators={{
            onChangeListenTo: ['password'],
            onDynamic: ({ value }) =>
              value !== group.getFieldValue('password') ? 'Passwords do not match' : undefined,
          }}
        />
      </>
    )
  },
})
// <PasswordPair form={form} fields="account" />   (typed: 'account' must have the group's shape)
```

### 6.4 Form components

| Component      | Props                                                                                                                      | Behaviour                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Form`         | `{ form: AnyKitForm; id?; mode?: 'edit' \| 'view'; disabled?; readOnly?; children; ...FormHTMLAttributes minus onSubmit }` | `<form noValidate aria-busy={isSubmitting} onSubmit onReset>` + `<form.AppForm>` + `FieldPresentation`. `onSubmit`: `preventDefault`, `stopPropagation`, ignore while submitting, `form.handleSubmit()` with the §5.5 catch. `onReset`: `preventDefault` + `form.reset()`. Registers `formElement`. Forwards its ref to `<form>`.                                                                    |
| `SubmitButton` | `ButtonProps` minus `type`/`form`, plus `{ form?: AnyKitForm; formId?: string; requireChanges?: boolean; submitMeta?: M }` | `type="submit"` (native `form={formId}` for a button outside the form). **Never `disabled`.** `aria-disabled` and an ignored click while submitting, locked, or `requireChanges && !isDirty` (with a visually hidden reason from `messages.noChanges`, linked by `aria-describedby`). Shows loading while `isSubmitting`. Three primitive selectors.                                                 |
| `ResetButton`  | `ButtonProps` minus `type`, plus `{ form?; to?: 'defaults' \| 'baseline' }`                                                | `type="reset"`; variant defaults to `ghost`, tone to `neutral`.                                                                                                                                                                                                                                                                                                                                      |
| `ErrorSummary` | `{ form?; title?: ReactNode; headingLevel?: 2 \| 3 \| 4 }`                                                                 | Renders after a submit attempt with errors: ui `Alert tone="critical"` (`role=alert`) keyed by `submissionAttempts` (re-announces each failed submit), with `tabIndex={-1}` as the target for `focusOnInvalid: 'summary'`; an ordered `List` of links `"{label}: {message}"` in DOM order; a click calls `focusField`. Form-level errors are listed first, as text. Registers itself in the runtime. |
| `FormStatus`   | `{ form?; show?: ('dirty' \| 'saving' \| 'saved' \| 'error')[] }`                                                          | Polite `role="status"` text from `messages` ("Unsaved changes", "Saving…", "Saved", "Couldn't save"); pairs with `useAutosave`. ui `Text size="sm" tone="muted"` + `StatusDot`.                                                                                                                                                                                                                      |

All read the form from the `form` prop or `useFormContext()`. All are also registered as TanStack `formComponents` (`<form.SubmitButton>` inside `<form.AppForm>`).

### 6.5 Hooks

```ts
useFormStatus(form): { isDirty; isSubmitting; isSubmitted; isSubmitSuccessful; canSubmit; submitCount; isValidating; hasErrors }
  // each slice is its own primitive useSelector; the object is memoised, so it re-renders only on real changes
useFieldValue<T, N extends DeepKeys<T>>(form: KitForm<T>, name: N): DeepValue<T, N>   // useSelector; for sibling-aware rendering (§13 #31)
useServerValues<T>(form: KitForm<T>, data: T | undefined, opts?: { keepDirty?: boolean /*true*/; keepErrors?: boolean /*true*/ }): void
useAutosave<T>(form: KitForm<T>, save: (value: T, ctx: { signal: AbortSignal }) => Promise<unknown>,
  opts?: { debounceMs?: number /*800*/; onlyWhenValid?: boolean /*true*/; rebaseline?: boolean /*true*/ }): AutosaveState
useUnsavedChanges(form, opts?: { when?: boolean }): boolean   // beforeunload guard; returns isDirty for router blockers
useOptions(source: OptionsLoader | readonly FieldOption[], opts: { query?; deps?: unknown[]; debounceMs?: 250; minQueryLength?: 0 }):
  { options; status: 'idle' | 'loading' | 'error' | 'ready'; error? }
```

`useServerValues` (edit mode, §13 #2 to #4): when `data` changes (deep compare), the new baseline is `data`. Values are merged per leaf path: the user's value if that path differs from the _old_ baseline (dirty), else `data`'s. Then `form.update({ defaultValues: data })`, `form.reset(merged, { keepDefaultValues: true })`, and the error maps of paths that had visible errors are restored. It must pass: refresh while editing; an array add then remove round trip is clean; save then clean (`rebaseline`); refetch after save is clean.

`isDirty` everywhere is `!isDefaultValue` (non-persistent), never TanStack's persistent `isDirty`.

`useAutosave` with `onlyWhenValid` validates before saving (A.11).

### 6.6 `When` (conditional rendering)

```ts
export interface WhenProps<A> {
  form: A
  /** Component mode: any predicate. Subscribes with a boolean selector. */
  is?: (values: ValuesOf<A>) => boolean
  /** Or a JSON condition (the schema-mode Condition type). */
  condition?: Condition<ValuesOf<A>>
  whenHidden?: 'prune' | 'keep' | 'reset' // default 'prune' (§5.4)
  names?: readonly DeepKeys<ValuesOf<A>>[] // governed paths not yet mounted
  fallback?: ReactNode
  children: ReactNode
}
```

`useSelector(form.store, s => predicate(s.values))` re-renders only when visibility flips. Children are unmounted when hidden (their validators stop), and the scope's names become inactive with the chosen policy. See A.7 for `is`/`condition` precedence and `scopeNames`.

### 6.7 Arrays: `Repeater`

See §9.9 (it is a layout). Component-mode typing: `name` must be a path to an array of objects, `newItem` must be the item type, and the render prop gets item-relative typed fields:

```tsx
<Repeater
  form={form}
  name="guests"
  label="Guests"
  newItem={{ name: '', age: null, vegetarian: false }}
  min={0}
  max={6}
  variant="table"
  itemLabel={(i) => `Guest ${i + 1}`}
  addLabel="Add a guest"
>
  {(item) => (
    <>
      <item.fields.TextField name="name" label="Name" autoComplete="off" />
      <item.fields.NumberField name="age" label="Age" min={0} />
      <item.fields.CheckboxField name="vegetarian" label="Vegetarian" />
    </>
  )}
</Repeater>
```

### 6.8 Dependent fields

- **Reset a child when its parent changes** (§13 #30): a field listener, `<form.SelectField name="country" listeners={{ onChange: () => form.resetField('region') }} …/>`; in schema mode, `resets: ['region']`.
- **Sibling-aware props** (§13 #31): `const country = useFieldValue(form, 'country')` inside a small `withForm` piece, then `placeholder={examplePostcode(country)}`.
- **Dependent options**: kept explicit rather than an `optionsFor={(values) => …}` prop: `useFieldValue` + `options`, or `loadOptions` + `reloadOn={['country']}` on Combobox and Select (§7.4).

### 6.9 Derived / computed values

```ts
derive: [
  {
    field: 'total',
    from: ['quantity', 'unitPrice'],
    compute: (v) => (v.quantity ?? 0) * (v.unitPrice ?? 0),
  },
]
```

Typed `DeriveRule<T> = { [K in DeepKeys<T>]: { field: K; from: readonly DeepKeys<T>[]; compute: (values: T) => DeepValue<T, K> } }[DeepKeys<T>]`. It runs in the form `listeners.onChange` when the changed field is in `from` (or under it, A.11) and writes with `setFieldValue(field, v, { dontUpdateMeta: true })`, so derived fields never look user-dirty. Display with `<form.AmountField name="total" readOnly />` (readOnly means not validated). Schema mode: `compute: { computer: 'lineTotal', from: [...] }` (A.9).

### 6.10 Escape hatches (component mode)

- `form` **is** the TanStack `ReactFormExtendedApi`: every method, `form.Field`, `form.Subscribe`, `form.FormGroup`, `form.store` and `useSelector(form.store, …)` work.
- `binding.api` and `useFieldContext()` expose the raw `FieldApi` inside any field component.
- Bare kiln-ui controls work inside `form.Field` render props (you wire value, onChange, onBlur and error yourself).
- Every layout is optional; plain `Stack` and `Grid` from kiln-ui work (fields don't need a forms layout).

---

## 7. Field catalogue

### 7.1 Value types and empties

| Value type                             | Empty   | Notes                                                                                                     |
| -------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `string`                               | `''`    | never `null`                                                                                              |
| `number \| null`                       | `null`  | text inputs never emit `NaN` or `''`                                                                      |
| option (`string \| number \| boolean`) | `null`  | the original primitive type is preserved (no `Number()` coercion of option values)                        |
| option array                           | `[]`    |                                                                                                           |
| `boolean`                              | `false` |                                                                                                           |
| date/time                              | `''`    | ISO strings: `YYYY-MM-DD`, `HH:mm`, `YYYY-MM-DDTHH:mm` (no `Date` objects: JSON-safe, no time zone drift) |
| files                                  | `[]`    | `ReadonlyArray<File \| StoredFile>`                                                                       |
| tuple                                  | n/a     | `[number, number]` for ranges; `{ start: string; end: string }` for date ranges                           |

### 7.2 The catalogue (all v1)

`Kind` is the registry key, which gives `field.<Kind>Field`, `form.<Kind>Field` and schema `{ kind }`. The exported bound component is `Form<Kind>Field` (with `Form<Kind>FieldProps`), except where noted. Each binds the listed kiln-ui component.

| Kind               | Contract / value                        | kiln-ui component                                                                 | Key props (beyond `FieldLabelProps`)                                                                                                                                   |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`             | exact `string`                          | `TextField`                                                                       | `type: 'text' \| 'email' \| 'tel' \| 'url' \| 'search'`, `autoComplete: AutoFill`, `inputMode`, `maxLength`, `showCount`, `leading`, `trailing`, `placeholder`, `size` |
| `password`         | exact `string`                          | `PasswordField`                                                                   | `autoComplete: 'current-password' \| 'new-password'` (required), `showLabel`, `hideLabel`                                                                              |
| `textarea`         | exact `string`                          | `TextareaField`                                                                   | `rows`, `autoResize`, `maxRows`, `maxLength`, `showCount`                                                                                                              |
| `number`           | exact `number` (emits `number \| null`) | `NumberField`                                                                     | `min`, `max`, `step`, `largeStep`, `stepper`, `formatOptions`, `locale`                                                                                                |
| `amount`           | exact `number` (emits `number \| null`) | `AmountField`                                                                     | `currency` (required), `unit: 'major' \| 'minor'`, `allowNegative`, `min`, `max`, `showCurrency`                                                                       |
| `select`           | option `string \| number \| boolean`    | `SelectField`                                                                     | `options`, `placeholder`, `emptyOption` (label; maps to `null`)                                                                                                        |
| `combobox`         | option `string \| number`               | `ComboboxField`                                                                   | `options`, `loadOptions`, `reloadOn`, `creatable`, `clearable`, `emptyMessage`, `minQueryLength`                                                                       |
| `multiSelect`      | options `string \| number`              | `ComboboxField multiple`                                                          | as combobox + `maxSelected` (no `creatable`, A.6)                                                                                                                      |
| `radio`            | option `string \| number \| boolean`    | `RadioGroupField`                                                                 | `options`, `orientation`                                                                                                                                               |
| `segmented`        | option `string \| number`               | `SegmentedField`                                                                  | `options`, `fullWidth`, `size`                                                                                                                                         |
| `choiceCards`      | option `string \| number`               | `ChoiceCardsField type="single"`                                                  | `options` (+ `meta` per option via `optionMeta`), `columns`                                                                                                            |
| `multiChoiceCards` | options `string \| number`              | `ChoiceCardsField type="multiple"`                                                | same                                                                                                                                                                   |
| `checkbox`         | exact `boolean`                         | `CheckboxField`                                                                   | `description`                                                                                                                                                          |
| `switch`           | exact `boolean`                         | `SwitchField`                                                                     | settings-row layout                                                                                                                                                    |
| `checkboxGroup`    | options `string \| number`              | `CheckboxGroupField`                                                              | `options`, `orientation`, `columns`, `selectAllLabel`                                                                                                                  |
| `chips`            | options `string \| number`              | `ChipGroupField type="multiple"`                                                  | `options`                                                                                                                                                              |
| `slider`           | exact `number`                          | `SliderField`                                                                     | `min`, `max`, `step`, `marks`, `showValue`, `formatOptions`                                                                                                            |
| `range`            | exact `[number, number]`                | `RangeSliderField`                                                                | as slider + `minStepsBetweenThumbs`, `thumbLabels`                                                                                                                     |
| `rating`           | exact `number` (emits `number \| null`) | `RatingField`                                                                     | `max`, `clearable`, `itemLabel`                                                                                                                                        |
| `date`             | exact `string`                          | `TextField type="date"`                                                           | `min`, `max` (ISO)                                                                                                                                                     |
| `time`             | exact `string`                          | `TextField type="time"`                                                           | `min`, `max`, `step`                                                                                                                                                   |
| `dateTime`         | exact `string`                          | `TextField type="datetime-local"`                                                 | `min`, `max`                                                                                                                                                           |
| `dateRange`        | exact `{ start: string; end: string }`  | `DateRangeField`                                                                  | `min`, `max`, `startLabel`, `endLabel`                                                                                                                                 |
| `oneTimeCode`      | exact `string`                          | `OneTimeCodeField`                                                                | `length`, `validationType`, `masked`, `submitOnComplete` (forms side: calls `form.handleSubmit()`)                                                                     |
| `color`            | exact `string` (`#rrggbb`)              | `ColorField`                                                                      | `swatches` (`{ value, label }[]`), `swatchesOnly`                                                                                                                      |
| `tags`             | exact `string[]`                        | `TagsField`                                                                       | `maxTags`, `delimiters`, `allowDuplicates`, `normalise: 'none' \| 'trim' \| 'lowercase'`                                                                               |
| `file`             | exact `ReadonlyArray<FileValue>`        | `FileField`                                                                       | `accept`, `multiple`, `maxFiles`, `maxSize`, `preview: 'list' \| 'thumbnails'` (rejections become a field error)                                                       |
| `hidden`           | exact `string`                          | none: renders `<input type="hidden">`, the only markup in kiln-forms (non-visual) | —                                                                                                                                                                      |

That is 28 kinds. The `radio`, `chips` and `range` kinds export as `FormRadioField`, `FormChipsField` and `FormRangeField`, named after the kind rather than the ui component.

Not in v1 (documented alternatives): a calendar popover (a later ADR; use `date`), phone (a custom field using `text type="tel"` and a validator of the consumer's choosing), location or places search (a custom field), rich text.

### 7.3 Field specifics that aren't obvious

- **Select, Radio, Segmented, ChoiceCards and Chips** with non-string values: the forms field keeps a `Map<string, V>` (`String(v)` keys), so ui components (string-only, Radix) round-trip numbers and booleans losslessly. `emptyOption` uses a sentinel item value; `null` maps to ui `''` (Radix shows the placeholder). One shared helper does this for every option field: `useOptionMapping(options, { emptyOption })` in `#core/binding/optionValues` → `{ uiOptions, toUi(v), fromUi(s), labelOf(v) }` (`labelOf` feeds view mode).
- **Number and Amount** bound to plain `number`: clearing emits `null` (the value contract is honest about emptiness, and the schema reports "required"). Model clearable numbers as `number | null`.
- **Amount with `unit: 'minor'`** stores integer minor units (pence, cents). Recommended for money.
- **File**: ui `onReject` becomes a field `onChange` error, `messages.fileRejected[reason]`. Files are held in state, not uploaded.
- **OneTimeCode**: controlled, so a reset clears it. `submitOnComplete` calls `form.handleSubmit()`.
- **Text with `type="email"`** is for input mode and autocomplete only; validation comes from the schema or rules.

### 7.4 Async options (Combobox, MultiSelect, Select)

```tsx
type OptionsLoader<V extends Primitive = Primitive> = (ctx: {
  query: string
  values: unknown
  signal: AbortSignal
}) => Promise<readonly FieldOption<V>[]>

// component mode
<form.ComboboxField name="city" label="City" loadOptions={searchCities} reloadOn={['country']} minQueryLength={2} />

// schema mode
{ kind: 'combobox', name: 'city', label: 'City', optionsFrom: { loader: 'cities', deps: ['country'] } }
```

`useOptions` debounces (250 ms), aborts the previous request (`signal`), keeps a per-loader LRU cache (50 entries, keyed by query plus the JSON of the deps), and maps `status` to ui `loading` and `emptyMessage`. Errors render `messages.optionsFailed` in the listbox. A consumer that wants TanStack Query caching calls `queryClient.fetchQuery` inside the loader. A.9 records how `optionsFrom` maps for each option kind.

---

## 8. New and changed `@mitcsutt/kiln-ui` components

kiln-forms needs these kiln-ui components. They live in kiln-ui's `components/inputs/` group (unless another group is named) and follow [`packages/ui/AGENTS.md`](../../ui/AGENTS.md): a folder per component, a named export, ref forwarding, React 18 and 19, native props spread, `className`/`style` merged, controlled and uncontrolled (`value`/`defaultValue`/`onValueChange`), Radix where focus management matters, tokens only, data-attribute states, stories in every theme and mode, and behaviour tests. They add **no runtime dependencies** beyond `radix-ui`. Every bare control is Field-aware (`markFieldAware` + `useResolvedField`), and every `*Field` composes `Field` (or `Fieldset` for groups) and forwards **all** `FieldLabelProps` through `splitFieldLabelProps`. Each is usable without kiln-forms.

### 8.1 Field plumbing

`FieldLabelProps` gains (also accepted by `Fieldset`):

```ts
warning?: ReactNode        // non-blocking advice; caution-tone text + InfoIcon, id `${id}-warning` in aria-describedby; hidden while an error shows; never role=alert
errorLive?: boolean        // default true: FieldError keeps role="alert"; false renders plain text (still in aria-describedby)
errorHidden?: boolean      // invalid state + aria-invalid kept, message not rendered (shown elsewhere: sentence layout, table cells)
validating?: boolean       // small Spinner after the label + aria-busy on the control
readOnly?: boolean         // into FieldContext; controls set readOnly / aria-readonly and data-readonly
layout?: 'stack' | 'horizontal' | 'inline'   // the FieldLayout type
   // stack (default); horizontal = label+description column | control column (Split-like, collapses below `sm`);
   // inline = control only, in text flow (label forced visually hidden, root display inline-flex)
```

- `FieldControlContext` gains `readOnly: boolean`, `busy: boolean` and `warningId?`.
- Library controls read `readOnly`, `busy` and `required` from context: native `required` + `aria-required` (Input, Textarea), `aria-busy`, and `readOnly` (native on Input and Textarea; Radix controls get `aria-readonly` and ignore changes).
- `TextField` and `TextareaField` gain `showCount?: boolean` (with `maxLength`): a "12 / 280" counter, tabular, linked by `aria-describedby`, announced politely only within 10% of the limit.
- `inputs/internal/fieldProps.ts` exports `splitFieldLabelProps<P extends FieldLabelProps>(props: P): [FieldLabelProps, Omit<P, keyof FieldLabelProps>]`, used by every composed field so future `FieldLabelProps` additions flow everywhere.
- Icons in `src/icons/icons.tsx`: `StarIcon`, `EyeIcon`, `EyeOffIcon`, `UploadIcon` (20 px grid, themed stroke).
- The composed fields `TextField`, `TextareaField`, `SelectField` and `CheckboxField` use `splitFieldLabelProps`; `CheckboxField` accepts `warning`, `errorLive`, `errorHidden`, `validating` and `readOnly`.

### 8.2 Text-like inputs

```ts
// inputs/PasswordInput: Radix unstable_PasswordToggleField
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'trailing'> {
  autoComplete: 'current-password' | 'new-password'
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  showLabel?: string // default 'Show password'
  hideLabel?: string // default 'Hide password'
}
export interface PasswordFieldProps extends FieldLabelProps, PasswordInputProps {
  onValueChange?: (value: string) => void
}

// inputs/NumberInput: WAI-ARIA spinbutton on a text input (never type="number")
export interface NumberInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'inputMode' | 'numeric'
> {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number /*1*/
  largeStep?: number /*10×step*/
  stepper?: boolean /*true: −/+ buttons, tabIndex -1*/
  decrementLabel?: string /*'Decrease'*/
  incrementLabel?: string /*'Increase'*/
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
  clampOnBlur?: boolean /*true*/
}
// role="spinbutton", aria-valuenow/min/max/valuetext; ↑↓ ±step, PgUp/PgDn ±largeStep, Home/End min/max;
// locale-aware parse (group + decimal separators); formatted when blurred, raw while focused; wheel ignored.

// inputs/AmountInput: money; a textbox, not a spinbutton
export interface AmountInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'numeric' | 'leading' | 'trailing'
> {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  currency: string /*ISO 4217*/
  locale?: string
  unit?: 'major' | 'minor' /*'major'*/
  allowNegative?: boolean /*false*/
  showCurrency?: 'symbol' | 'code' | 'both' | 'none' /*'symbol', leading*/
}
// fraction digits from Intl.NumberFormat(locale, { style: 'currency', currency }); grouping on blur; tabular figures.

// inputs/OneTimeCodeInput: Radix unstable_OneTimePasswordField (controlled)
export interface OneTimeCodeInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  length?: number /*6*/
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  onComplete?: (v: string) => void
  validationType?: 'numeric' | 'alpha' | 'alphanumeric' /*'numeric'*/
  masked?: boolean
  name?: string
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  size?: Size
  invalid?: boolean
}
// role=group aria-labelledby (Field label); autoComplete="one-time-code"; a hidden input carries `name`.

// inputs/ColorInput
export interface ColorInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'leading'
> {
  value?: string
  defaultValue?: string
  onValueChange?: (hex: string) => void // '#rrggbb' lowercase
  swatches?: readonly { value: string; label: string }[] // labels required (colour names for AT)
  swatchesOnly?: boolean
  pickerLabel?: string /*'Choose colour'*/
}
// native <input type="color"> as the leading swatch button + a hex text input (normalises #abc → #aabbcc on blur);
// swatches = a Radix RadioGroup of swatch buttons (the only place a raw colour renders: it is data).

// inputs/SwitchField: a settings row, label + description | switch
export interface SwitchFieldProps extends FieldLabelProps, Omit<SwitchProps, 'label' | 'invalid'> {}

// inputs/DateRangeField: Fieldset (legend = label) + two date Inputs side by side (Inline, wraps)
export interface DateRangeValue {
  start: string
  end: string
}
export interface DateRangeFieldProps
  extends FieldLabelProps, Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (v: DateRangeValue) => void
  min?: string
  max?: string
  startLabel?: string /*'Start date'*/
  endLabel?: string /*'End date'*/
  name?: string /* emits name.start / name.end */
  disabled?: boolean
  readOnly?: boolean
  onBlur?: FocusEventHandler
}
```

Each ships its bare control **and** its `*Field` (`PasswordField`, `NumberField`, `AmountField`, `OneTimeCodeField`, `ColorField`, `SwitchField`, `DateRangeField`).

### 8.3 Choice controls

```ts
export interface ChoiceOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

// inputs/CheckboxGroup (+ CheckboxGroupField = Fieldset legend=label + CheckboxGroup)
export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  options?: readonly ChoiceOption[]
  children?: ReactNode // or <CheckboxGroup.Item value label description/>
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (v: string[]) => void
  orientation?: 'vertical' | 'horizontal'
  columns?: Responsive<1 | 2 | 3>
  selectAllLabel?: string // adds a tri-state "select all" checkbox (§13 #32)
  name?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  size?: Size
}
// role="group" aria-labelledby from context; one hidden input per checked value for FormData.

// inputs/RadioGroupField = Fieldset + RadioGroup + items from options
export interface RadioGroupFieldProps
  extends FieldLabelProps, Omit<RadioGroupProps, 'invalid' | 'children'> {
  options: readonly ChoiceOption[]
  orientation?: 'vertical' | 'horizontal'
}

// inputs/ChoiceCards (+ ChoiceCardsField)
type ChoiceCardsBase = {
  options: readonly (ChoiceOption & { meta?: ReactNode })[]
  columns?: Responsive<1 | 2 | 3 | 4>
  name?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
}
export type ChoiceCardsProps = ChoiceCardsBase &
  Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'dir'> &
  (
    | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (v: string) => void } // Radix RadioGroup; the cards are the radios
    | {
        type: 'multiple'
        value?: readonly string[]
        defaultValue?: readonly string[]
        onValueChange?: (v: string[]) => void
      } // role=checkbox cards
  )
// the whole card is the hit target; selected = accent border (one edge treatment); component token --choice-card-radius (fallback --radius-surface).

// actions/ChipGroup (+ inputs/ChipGroupField): Radix ToggleGroup rendering ToggleChip visuals (a shared internal style module, no CSS duplication)
export type ChipGroupProps = {
  options: readonly (ChoiceOption & { icon?: ReactNode; count?: number })[]
  size?: 'sm' | 'md'
  disabled?: boolean
  invalid?: boolean
  name?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'dir'> &
  (
    | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (v: string) => void }
    | {
        type: 'multiple'
        value?: readonly string[]
        defaultValue?: readonly string[]
        onValueChange?: (v: string[]) => void
      }
  )

// actions/SegmentedControl: markFieldAware; aria-labelledby = the field's labelId; aria-invalid; disabled/readOnly from context.
export interface SegmentedFieldProps
  extends FieldLabelProps, Omit<SegmentedControlProps, 'children'> {}

// inputs/Slider, inputs/RangeSlider (+ SliderField, RangeSliderField): Radix Slider
export interface SliderProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  value?: number
  defaultValue?: number
  onValueChange?: (v: number) => void
  onValueCommit?: (v: number) => void
  min?: number /*0*/
  max?: number /*100*/
  step?: number /*1*/
  marks?: readonly { value: number; label: string }[]
  showValue?: boolean // <output> with the formatted value, tabular
  formatOptions?: Intl.NumberFormatOptions
  locale?: string // also aria-valuetext
  name?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  size?: 'sm' | 'md'
}
export interface RangeSliderProps extends Omit<
  SliderProps,
  'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit'
> {
  value?: readonly [number, number]
  defaultValue?: readonly [number, number]
  onValueChange?: (v: [number, number]) => void
  onValueCommit?: (v: [number, number]) => void
  minStepsBetweenThumbs?: number
  thumbLabels?: readonly [string, string] /*['Minimum', 'Maximum']*/
}

// inputs/Rating (+ RatingField): a Radix RadioGroup of stars
export interface RatingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (v: number | null) => void
  max?: number /*5*/
  clearable?: boolean
  itemLabel?: (n: number, max: number) => string /*`${n} of ${max}`*/
  name?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  size?: Size
}
```

### 8.4 Popover and complex inputs

```ts
// inputs/Combobox (+ ComboboxField): ARIA 1.2 combobox, Radix Popover for the listbox (Radix has no combobox)
export interface ComboboxOption {
  value: string
  label: string
  description?: string
  keywords?: readonly string[]
  group?: string
  disabled?: boolean
}
interface ComboboxBase extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'multiple'
> {
  options: readonly ComboboxOption[]
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (query: string) => void
  filter?: 'auto' | 'none' // 'none' when the consumer filters (async)
  loading?: boolean
  loadingMessage?: ReactNode /*'Loading…'*/
  emptyMessage?: ReactNode /*'No matches'*/
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  creatable?: boolean // free text with suggestions (§13 #35): committed text becomes the value
  clearable?: boolean
  clearLabel?: string /*'Clear'*/
  size?: Size
  invalid?: boolean
}
export type ComboboxProps = ComboboxBase &
  (
    | {
        multiple?: false
        value?: string | null
        defaultValue?: string | null
        onValueChange?: (v: string | null) => void
      }
    | {
        multiple: true
        value?: readonly string[]
        defaultValue?: readonly string[]
        onValueChange?: (v: string[]) => void
        maxSelected?: number
        removeLabel?: (label: string) => string /*`Remove ${label}`*/
      }
  )
```

Behaviour (each has a test): the input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`; the listbox has `role="listbox"` (`aria-multiselectable` when multiple); options have `role="option"` and `aria-selected`; groups have `role="group"` and a label. Keys: ↓/↑ open and move (wrapping), Alt+↓ opens, Home/End in the list, Enter selects (single closes; multiple stays open), Esc closes (a second Esc clears the query), Tab closes and keeps focus order, Backspace on an empty query removes the last chip. Focus stays in the input (`onOpenAutoFocus`/`onCloseAutoFocus` prevented). Filtering (`'auto'`) is diacritic-folded, case-insensitive, and ranked exact or keyword, then prefix, then substring (§13 #33). A polite live region announces the result count (debounced 500 ms). Chips are `Tag` with `onRemove`. Hidden inputs carry `name` (one per value). The portal container is the nearest `[data-theme]` (as for Select).

```ts
// inputs/TagsInput (+ TagsField)
export interface TagsInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (tags: string[]) => void
  delimiters?: readonly string[] /*[',', 'Enter']*/
  maxTags?: number
  allowDuplicates?: boolean /*false*/
  normalise?: 'none' | 'trim' | 'lowercase' /*'trim'*/
  onReject?: (tag: string, reason: 'duplicate' | 'max' | 'empty') => void
  removeLabel?: (tag: string) => string
}
// chips before the input in the box (TagList); paste splits on delimiters; Backspace on empty removes the last.

// inputs/FileDrop (+ FileField)
export interface StoredFile {
  id: string
  name: string
  size?: number
  type?: string
  url?: string
}
export type FileValue = File | StoredFile
export interface FileDropProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: readonly FileValue[]
  defaultValue?: readonly FileValue[]
  onValueChange?: (files: FileValue[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number /*bytes*/
  onReject?: (rejections: readonly { file: File; reason: 'type' | 'size' | 'count' }[]) => void
  preview?: 'list' | 'thumbnails'
  dropLabel?: ReactNode /*'Drop files here or'*/
  browseLabel?: string /*'choose files'*/
  removeLabel?: (name: string) => string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  onBlur?: FocusEventHandler
}
// the native <input type="file"> is the real, labelled, focusable control (visually hidden, focus ring on the zone);
// drag and drop is an enhancement; the input's FileList is kept in sync through DataTransfer (FormData works);
// thumbnails use object URLs revoked on unmount; sizes are formatted with Intl (tabular).
```

### 8.5 Layout additions

```ts
// navigation/Stepper: a step indicator (not a form control)
export interface StepperStep {
  value: string
  label: ReactNode
  description?: ReactNode
  status?: 'complete' | 'current' | 'upcoming' | 'error'
}
export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onSelect'> {
  steps: readonly StepperStep[]
  value: string // current step (aria-current="step")
  onStepSelect?: (value: string) => void // steps become buttons when set
  orientation?: 'horizontal' | 'vertical'
  compactBelow?: 'sm' | 'md' // below it: "Step 2 of 4 · Details" (formatCompact)
  formatCompact?: (index: number, total: number, label: ReactNode) => ReactNode
  statusLabels?: { complete?: string; error?: string } // visually hidden suffixes, defaults 'completed' / 'has errors'
}
// <ol>; tabular numbers; no connector gradients; current = accent; error = critical glyph + text.

// layout/ActionBar: a row of form actions
export interface ActionBarProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  align?: 'start' | 'end' | 'between' /*'end'*/
  sticky?: boolean // sticks to the bottom of the scroll container: canvas surface + top hairline, --z-sticky
  gap?: Responsive<Space> /*3*/
  as?: 'div' | 'footer'
}
```

`ActionBar`'s `Responsive<Space>` gap registers `--action-bar-gap-{base..xl}` in `tokens/responsive-props.css`. See A.5 for `StepperStep.invalid`.

---

## 9. Layouts

### 9.0 Shared mechanics

- **Zero CSS**: every layout is a composition of kiln-ui (`Grid`, `Split`, `Stack`, `Inline`, `Fieldset`, `Heading`, `Text`, `Card`, `Tabs`, `Accordion`, `Badge`, `Stepper`, `ActionBar`, `Table`, `List`, `DataList`, `EmptyState`, `IconButton`, `Button`, `VisuallyHidden`).
- **`FieldScope`** (`core/scope`): a layout region that collects the names of fields mounted inside it (bindings register into every ancestor scope) and exposes `names()`, `subscribe()` and an optional `reveal()`. Nested scopes form the reveal chain (§5.6). `useScopeErrors(scope)` returns the **number** of visible errors in the scope (a primitive selector over `fieldMeta` for the scope's names).
- **`FieldPresentation`**: layouts that change how fields render (rows, sentence, table cells, review) provide `{ layout, labelHidden, errorPlacement: 'inline' | 'external', mode }`, and bindings merge it.
- **Hidden but mounted**: tabs, accordion items and steps render inactive panels with `forceMount` + `hidden`, so their fields stay registered, validate on submit, count errors, and can be revealed.
- **Semantics**: groups of related controls are `<fieldset>`/`<legend>`; chapters with headings are `<section aria-labelledby>`; heading levels are props (`headingLevel`, default 3 inside a page `h2`).
- Every layout has a **schema node** (`layout: '<key>'`) whose props are the component's JSON-safe props (§10.2). Compound parts are their own nodes (`tab`, `accordionItem`, `step`, `panel`, `gridItem`).

| Layout                                | Schema key(s)                | Semantics                                                  | Built from                                                      |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| FormGrid (+ `FormGridItem`)           | `grid`, `gridItem`           | none (visual)                                              | `Grid`, `Grid.Item`                                             |
| FormSection                           | `section`                    | `fieldset`/`legend` (default) or `section` + heading       | `Fieldset variant="section"` / `Heading` + `Stack`              |
| FormAside                             | `aside`                      | `section aria-labelledby` + a `role=group` column          | `Split ratio="4/8"` + `Heading` + `Text` + `Stack`              |
| FormRows                              | `rows`                       | none; fields in `layout="horizontal"`                      | `Stack dividers` + presentation                                 |
| FormPanels (+ `FormPanel`)            | `panels`, `panel`            | `section aria-labelledby` per panel                        | `Grid` + `Card variant="outline"`                               |
| FormTabs (+ `FormTab`)                | `tabs`, `tab`                | Radix tabs; error count in the trigger                     | `Tabs` + `Badge` + `VisuallyHidden`                             |
| FormAccordion (+ `FormAccordionItem`) | `accordion`, `accordionItem` | Radix accordion; error count in the trigger                | `Accordion` + `Badge`                                           |
| FormSteps (+ `FormStep`)              | `steps`, `step`              | `Stepper` (`ol`, `aria-current=step`) + step heading focus | `Stepper` + `Stack` + `ActionBar`                               |
| Repeater                              | `repeater`                   | a `fieldset` per item (list, cards) or a `table`           | `Stack`/`Card`/`Table` + `IconButton` + `Button` + `EmptyState` |
| FormSentence                          | `sentence`                   | `fieldset` + hidden legend; inline fields                  | `Text` flow + `Inline` + presentation                           |
| FormReview                            | `review`                     | `DataList` of values (view mode)                           | presentation `mode="view"`                                      |
| FormActions                           | `actions`                    | none                                                       | `ActionBar`                                                     |
| (plain)                               | `stack`, `inline`            | none                                                       | `Stack`, `Inline` (gap and align props)                         |
| When                                  | `when` on any node           | —                                                          | selector gate                                                   |

### 9.1 `FormGrid`

```ts
export interface FormGridProps {
  columns?: Responsive<GridColumns> /*{ base: 1, md: 2 }*/
  gap?: Responsive<Space> /*5*/
  rowGap?: Responsive<Space>
  children: ReactNode
}
export interface FormGridItemProps {
  span?: Responsive<GridSpan>
  start?: Responsive<GridColumns>
  children: ReactNode
}
```

Spans are explicit, columns collapse responsively, and spacers are `start` offsets (§13 #52). There is no string matrix of field names.

### 9.2 `FormSection`

```ts
export interface FormSectionProps {
  title: ReactNode
  description?: ReactNode
  titleHidden?: boolean
  as?: 'fieldset' | 'section' /*'fieldset'*/
  headingLevel?: 2 | 3 | 4 /*3, section only*/
  disabled?: boolean // cascades through FieldPresentation (+ native fieldset disabled)
  readOnly?: boolean // cascades through FieldPresentation
  gap?: Responsive<Space> /*5*/
  children: ReactNode
}
```

`title` is required: a legend-less fieldset isn't a section (use `Stack`).

### 9.3 `FormAside`: the settings layout

```ts
export interface FormAsideProps {
  title: ReactNode
  description?: ReactNode
  headingLevel?: 2 | 3 | 4
  ratio?: '4/8' | '5/7' | '1/3' /*'4/8'*/
  collapseBelow?: 'sm' | 'md' | 'lg' /*'md'*/
  children: ReactNode
}
```

Left: a heading and a prose description (the "why"). Right: the fields in a `Stack gap={5}` with `role="group" aria-labelledby={headingId}`. Stack several with `Stack dividers gap={8}` for an account settings page (DESIGN §2: a hang column for labels).

### 9.4 `FormRows`: label-left rows

```ts
export interface FormRowsProps {
  dividers?: boolean /*true*/
  gap?: Responsive<Space> /*4*/
  children: ReactNode
}
```

Provides `FieldPresentation layout="horizontal"`: every ui `Field` inside renders its label and description in a fixed column with the control beside it (collapsing below `sm`). This is the editor-panel "settings row", with no per-field config. Group fields built on `Fieldset` don't follow it yet (A.5).

### 9.5 `FormPanels`

```ts
export interface FormPanelsProps {
  columns?: Responsive<1 | 2 | 3> /*1*/
  gap?: Responsive<Space> /*5*/
  children: ReactNode
}
export interface FormPanelProps {
  title: ReactNode
  description?: ReactNode
  headingLevel?: 2 | 3 | 4
  actions?: ReactNode
  children: ReactNode
}
```

For self-contained objects (a payment method, a shipping address). DESIGN §2: a card needs a reason.

### 9.6 `FormTabs`

```ts
export interface FormTabsProps {
  label: string /*aria-label of the tablist*/
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  variant?: TabsVariant
  children: ReactNode
}
export interface FormTabProps {
  value: string
  label: ReactNode
  children: ReactNode
}
```

- Each tab is a `FieldScope` whose `reveal()` selects it.
- The trigger shows a `Badge tone="critical" size="sm"` with the scope's visible-error count and a visually hidden `messages.errorCount(n)` when `n > 0` (A.7).
- Panels use `forceMount` + `hidden`. On an invalid submit, focus handling reveals the first tab with errors (by DOM order of fields, which is tab order).

### 9.7 `FormAccordion`

```ts
export interface FormAccordionProps {
  type?: 'single' | 'multiple' /*'multiple'*/
  defaultValue?: string | string[]
  variant?: AccordionVariant
  children: ReactNode
}
export interface FormAccordionItemProps {
  value: string
  title: ReactNode
  description?: ReactNode
  headingLevel?: 2 | 3 | 4
  children: ReactNode
}
```

The same scope, count, reveal and `forceMount` mechanics as tabs; `reveal()` opens the item (and closes the others for `single`).

### 9.8 `FormSteps` and `useFormSteps`

```ts
export interface FormStepsProps {
  label?: string // accessible name for the Stepper
  value?: string
  defaultValue?: string
  onValueChange?: (step: string) => void // controlled = deep-linkable (a router search param)
  linear?: boolean /*true: can't skip ahead past invalid steps*/
  // completion = the form's onSubmit (the last step's primary action submits)
  nav?: 'auto' | 'none' /*'auto' renders Back / Next / Submit in an ActionBar*/
  backLabel?: string
  nextLabel?: string
  submitLabel?: string
  children: ReactNode
}
export interface FormStepProps {
  value: string
  title: ReactNode
  description?: ReactNode
  schema?: StandardSchemaV1 // extra per-step validation; issues filtered to this step's fields
  children: ReactNode
  // Branching: wrap a step in <When form is={…}>. Steps register with FormSteps on mount, so a hidden
  // step drops out of the sequence (and its fields are pruned). Schema mode: `when` on the step node.
}
export interface StepsApi {
  steps: readonly {
    value: string
    title: ReactNode
    status: 'complete' | 'current' | 'upcoming' | 'error'
  }[]
  current: string
  index: number
  count: number
  isFirst: boolean
  isLast: boolean
  next(): Promise<boolean>
  back(): void
  goTo(step: string): Promise<boolean>
}
export function useFormSteps(): StepsApi // inside FormSteps, for custom chrome
```

**Next** validates the current step's scope: `form.validateField(name, 'submit')` for each name, plus `step.schema` (filtered issues go to the `onSubmit` slot of those fields). It marks those fields' errors visible (A.7). If there's any error, the step's status is `error`, focus moves to the first invalid field in the step, and the step stays. Otherwise it advances, moves focus to the new step's heading (`tabIndex=-1`) and announces `messages.stepOf(index, count, title)` in a polite region. On the **last step**, Next is submit. Steps not yet visited are mounted but hidden; the final submit validates everything (an error in a skipped step reveals that step).

Why not TanStack `FormGroup`: it couples step boundaries to a nested value object and re-subscribes about 16 meta slices; scopes are shape-agnostic. (`form.FormGroup` stays available through the escape hatch.)

### 9.9 `Repeater`

```ts
export interface RepeaterProps<A, N extends ArrayPaths<ValuesOf<A>>> {
  form: A
  name: N
  label: ReactNode
  description?: ReactNode
  newItem: ItemOf<ValuesOf<A>, N> | (() => ItemOf<ValuesOf<A>, N>)
  variant?: 'list' | 'table' | 'cards' /*'list'*/
  min?: number
  max?: number
  reorderable?: boolean // Move up / Move down buttons (keyboard-first; no drag in v1)
  itemLabel?: (index: number) => string /*messages.item(index)*/
  addLabel?: string
  empty?: ReactNode
  columns?: readonly { header: ReactNode; width?: TableColumnWidth }[] // table variant: one per child field, in order
  validators?: /* array-level rules, A.7 */ unknown
  children: (item: RepeaterItem<ItemOf<ValuesOf<A>, N>>) => ReactNode
}
export interface RepeaterItem<I> {
  index: number
  count: number
  key: string
  name: string // e.g. 'guests[2]'
  fields: BoundFields<I, R> // item-relative typed shorthand
  remove(): void
  move(to: number): void
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}
```

- The container is `form.AppField name mode="array"` (re-renders only on structural change). Items are keyed by index (safe since TanStack 1.33.2 recreates the FieldApi when `name` changes).
- Array-level validation errors (`minItems`, `unique`) render as the repeater's `Fieldset` error.
- **Focus management**: after add, the first control of the new item; after remove, the first control of the item now at that index, else the previous item, else the Add button; after move, the same Move button in its new position. Each action is announced politely (`messages.itemAdded`, `itemRemoved`, `itemMoved`).
- At `max`, Add is `aria-disabled` with `messages.maxItems(max)`; at `min`, Remove is hidden.
- Variants: **list** is a `Stack dividers` of `fieldset`s (legend = `itemLabel`); **cards** is a `Grid` of `Card`s (title = `itemLabel`); **table** is a ui `Table` with `columns` headers, each cell a field in `FieldPresentation { labelHidden: true, layout: 'inline' }` (labels stay for assistive technology), plus a trailing actions cell, with errors rendered in the cell. Item actions placement and the actions header: A.7.

### 9.10 `FormSentence`: mad-libs

```tsx
<FormSentence label="Recurring invoice">
  Bill <form.TextField name="client" label="Client" htmlSize={14} />{' '}
  <form.AmountField name="amount" label="Amount" currency="GBP" /> every month starting{' '}
  <form.DateField name="start" label="Start date" />.
</FormSentence>
```

Provides `FieldPresentation { layout: 'inline', errorPlacement: 'external' }` (label visually hidden, error message not rendered inline). Renders a `fieldset` (legend = `label`, visually hidden), then the text flow (A.7: a `div`, not a `p`), then a list of visible error messages below it, each with an id the matching control references through `aria-describedby`. Use it for short, low-stakes forms (schedules, filters), never for long data entry.

### 9.11 `FormReview`

```ts
export interface FormReviewProps {
  title?: ReactNode
  onEdit?: (step: string) => void
  children: ReactNode
}
```

Provides `FieldPresentation { mode: 'view' }`: the same field JSX (or schema subtree) renders as a `DataList` of label → formatted value (Select shows the option label, Amount formats the currency, File lists names). Typical use: the last step of a wizard reuses earlier steps' content. `Form mode="view"` does the same for a whole form (read-only detail pages from the same definition). A.4 records how view mode avoids creating field instances; A.7 records `headingLevel`, `step` and the Edit button.

### 9.12 `FormActions`

```ts
export interface FormActionsProps {
  align?: 'start' | 'end' | 'between' /*'end'*/
  sticky?: boolean
  status?: boolean /*renders <FormStatus/> at the start*/
  children: ReactNode
}
```

### 9.13 Custom layouts

Any component can be a layout: use `FieldScope` for counts and reveal, `FieldPresentation` for field rendering hints, and `useScopeErrors` for badges. Render a `FieldViewListBoundary` so view mode produces valid list markup (A.4). Register it for schema mode with `kit.extend({ layouts: { timeline: TimelineLayout } })` (§10.5).

---

## 10. Schema mode

### 10.1 Shape

Verified with tsc: 12 expected errors caught, no false positives, about 55k instantiations, 0.7 s.

```ts
export interface FormSchema<T, R, X, TContext = {}> {
  version: 1
  title?: string
  description?: string
  root: SchemaNodeOf<T, T, R, X, TContext>
}

export type SchemaNodeOf<TScope, TRoot, R, X, C> =
  | FieldNode<TScope, TRoot, R, X, C> // { kind, name, ...field props }
  | RepeaterNode<TScope, TRoot, R, X, C> // { layout: 'repeater', name, newItem, item: Node<Item>[] }
  | LayoutNode<TScope, TRoot, R, X, C> // { layout: 'grid' | 'section' | …, ...layout props, children }
  | ContentNode<TRoot, C> // { content: 'heading' | 'text' | 'alert' | 'divider' | 'submit' | 'reset' | 'errorSummary' | 'status', … }
  | CustomNode<TRoot, X, C> // { custom: key, props?: Json }

type NodeBase<TRoot, C> = { id?: string; when?: Condition<TRoot, C> }
```

`defineFormSchema<T, TContext>()(schema)` is **curried and non-generic in the schema parameter**, so object literals get excess-property checks (a typo like `lable` is an error; a `const S extends …` variant silently accepted it). Typed schemas carry a phantom `'~types'` marker, and `UntypedFormSchema` is the structural type for parsed JSON (A.1, A.8).

### 10.2 Field nodes

Derived from the kit registry. For each kind `K` with contract `C` and props `P`:

```ts
{ kind: K; name: PathsFor<TScope, C> } & FieldNodeCommon & JsonProps<Specialise<C, P, D>>

type FieldNodeCommon<TScope, TRoot, D, X, C> = NodeBase<TRoot, C> & {
  rules?: readonly RuleFor<D, X>[]
  warnRules?: readonly RuleFor<D, X>[]            // the same rules, on the non-blocking channel
  defaultValue?: D                                // field-level default (TanStack prioritised defaults)
  whenHidden?: 'prune' | 'keep' | 'reset'
  disabledWhen?: Condition<TRoot, C>; readOnlyWhen?: Condition<TRoot, C>; excludeWhen?: Condition<TRoot, C>
  requiredWhen?: Condition<TRoot, C>              // toggles the `required` prop + the `required` rule
  optionsFrom?: { loader: LoaderKey<X>; deps?: readonly DeepKeys<TRoot>[] }
  resets?: readonly DeepKeys<TRoot>[]             // reset these when this field changes
  compute?: { computer: ComputerKey<X>; from: readonly DeepKeys<TRoot>[] }   // derived field (readOnly)
}
```

`JsonProps<P>` keeps only props expressible in JSON: function props are dropped, `ReactNode` becomes `string`, and `children`, `className` and `style` are dropped. Option kinds distribute over each path, so `options[].value` is typed to that path's value.

### 10.3 Conditions (JSON, typed)

```ts
export type Condition<T, C = {}> =
  | {
      [K in DeepKeys<T>]:
        | { field: K; op: 'eq' | 'neq'; value: DeepValue<T, K> }
        | { field: K; op: 'in' | 'notIn'; value: readonly DeepValue<T, K>[] }
        | { field: K; op: 'truthy' | 'falsy' | 'empty' | 'notEmpty' }
    }[DeepKeys<T>]
  | {
      [K in PathsFor<T, ExactContract<number>>]: {
        field: K
        op: 'gt' | 'gte' | 'lt' | 'lte'
        value: number
      }
    }[PathsFor<T, ExactContract<number>>]
  | {
      [K in keyof C & string]:
        | { context: K; op: 'eq' | 'neq'; value: C[K] }
        | { context: K; op: 'in'; value: readonly C[K][] }
    }[keyof C & string]
  | { all: readonly Condition<T, C>[] }
  | { any: readonly Condition<T, C>[] }
  | { not: Condition<T, C> }
```

- `context` conditions read `SchemaForm context={{ mode: 'edit', role: 'owner' }}` (create vs edit, §13 #48).
- Paths in conditions are root paths (`TRoot`) everywhere, including on repeater item fields (A.8). Item-relative references are rare and covered by custom nodes or validators.
- `evaluateCondition(cond, values, context)` is pure (in `@mitcsutt/kiln-forms/schema`). `empty` means `''`, `null`, `undefined` or `[]`. The paths a condition reads are collected statically for selectors.

### 10.4 Rules (JSON validation)

```ts
type Msg = { message?: string } // literal text, or '$key' into messages
export type RuleFor<D, X> =
  | ({ rule: 'required' } & Msg)
  | ({ rule: 'custom'; validator: ValidatorKey<X>; args?: Json } & Msg)
  | (NonNullable<D> extends string
      ? | ({ rule: 'minLength' | 'maxLength'; value: number } & Msg)
        | ({ rule: 'pattern'; value: string; flags?: string } & Msg)
        | ({ rule: 'email' | 'url' } & Msg)
      : never)
  | (NonNullable<D> extends number
      ? ({ rule: 'min' | 'max' | 'step'; value: number } & Msg) | ({ rule: 'integer' } & Msg)
      : never)
  | (NonNullable<D> extends ReadonlyArray<unknown>
      ? | ({ rule: 'minItems' | 'maxItems'; value: number } & Msg)
        | ({ rule: 'unique'; by?: string } & Msg)
      : never)
  | (NonNullable<D> extends string ? { rule: 'minDate' | 'maxDate'; value: string } & Msg : never)
```

Rules are compiled per node (memoised by node identity) into one field-level `onDynamic` validator (sync rules) and one `onDynamicAsync` (async custom validators, debounced 300 ms, `signal` honoured). They mount and unmount with the field, so hidden fields never validate. Default messages come from `messages.rules.*` with `{value}` interpolation. A form-level Standard Schema may be passed to `useAppForm` as well; both run. A.8 records the rule semantics the design left open, and A.11 the limits on `pattern` in parsed schemas.

### 10.5 Registries (functions stay out of JSON)

```ts
defineLoader<V extends Primitive>(fn: OptionsLoader<V>): OptionsLoader<V>
defineValidator<V>(
  fn: (value: V, ctx: { values: unknown; args?: Json; signal?: AbortSignal }) =>
    string | null | undefined | Promise<string | null | undefined>,
  opts?: { async?: boolean },
): NamedValidator<V>
defineComputer<Out>(fn: (values: unknown) => Out): Computer<Out>
defineCustomNode<P extends Record<string, Json>>(
  component: ComponentType<{ form: AnyKitForm; props: P; node: CustomNodeShape }>,
): CustomNodeComponent<P>
```

Keys are typed from the kit (`LoaderKey<X> = keyof X['loaders'] & string`, and so on). The layout registry maps each `layout` key to a component: the defaults are the §9 components, and `kit.extend({ layouts: { … } })` adds or overrides them. A custom layout receives `{ node, form, children }` with `children` already rendered (A.9).

### 10.6 Rendering

```tsx
const schema = defineFormSchema<Registration, { mode: 'create' | 'edit' }>()({ version: 1, root: { … } })
const form = useAppForm({ defaultValues: emptyRegistration, onSubmit: ({ value }) => save(value) })

<Form form={form}>
  <SchemaForm form={form} schema={schema} context={{ mode: 'create' }} />
</Form>

// mix with JSX: render one node by id anywhere (§13 #53)
<SchemaNode form={form} schema={schema} id="email" />
```

- `SchemaForm` walks the tree **once per schema identity** (static analysis cached in a `WeakMap`: names per subtree, condition dependencies, default values, rule compilation) and renders **one React component per node**. It never subscribes to values itself.
- A field node becomes `form.AppField name` plus the registered component with the node's props. `when` becomes a `When` wrapper. `disabledWhen`, `readOnlyWhen`, `excludeWhen` and `requiredWhen` become one bit-set selector per field (A.9). `optionsFrom` becomes the field's loader or `useOptions` (A.9). `resets` becomes a field listener, and `compute` a derive registration.
- A layout node becomes the registry component with the node's props, with children rendered recursively. Tab, step and accordion scopes get their **static name lists** from the analysis (no need to mount to count).
- A repeater node becomes a `Repeater` with item nodes rendered under the `name[i].` prefix.
- Content nodes become `Heading`, `Text`, `Alert` and `Divider`, and the form components for `submit`, `reset`, `errorSummary` and `status`.
- Custom nodes become the registry component, given `{ form, props, node }`.
- Unknown keys (possible only with untrusted schemas) render nothing and log in development; `parseFormSchema` rejects them up front.

### 10.7 Hidden-field handling in schema mode

Identical to §5.4: when `when` is false the node is unmounted (its compiled field-level rules go with it), the names from static analysis are marked inactive with the node's `whenHidden` (default `prune`), form-level schema issues for those paths are filtered out, and the payload is pruned to defaults at submit.

### 10.8 Server-driven schemas

```tsx
import { parseFormSchema } from '@mitcsutt/kiln-forms/schema'

// names of registered keys
const result = parseFormSchema(json, { kinds, layouts, loaders, validators, computers, nodes })
if (!result.ok) report(result.issues) // [{ path: 'root.children[2].kind', message: 'Unknown field kind "phone"' }]

<SchemaForm form={form} schema={result.schema} /> // an UntypedFormSchema
```

A hand-written validator (no zod at runtime) checks node shapes, registry keys, rule names and argument types, condition shapes, duplicate names, and repeater `newItem` presence. Values typing is `unknown`-based for untrusted schemas; typed schemas come from `defineFormSchema`. It also treats the JSON as hostile (A.11): DOM-sink props, slow `pattern`s and oversized schemas are reported as issues, and it never throws.

### 10.9 Same rules on the server

`toStandardSchema(schema, { validators, context })` (React-free) returns a Standard Schema that applies the schema's rules to the visible fields (conditions evaluated against the input). Use it in a TanStack Start `createServerValidate` or any API handler, so client and server enforce identical rules. Its success `value` holds only the schema's active fields (A.11): treat it, not the raw input, as the validated payload.

### 10.10 Serialisation

A schema that only uses registry keys **must** round-trip `JSON.parse(JSON.stringify(schema))` unchanged (tested). JSON Schema export is **out of scope**: the conditions, layout and repeater templates have no faithful JSON Schema mapping, and `toStandardSchema` covers the need to share validation. Zod interop: any zod schema is already usable through `useAppForm({ schema })` (Standard Schema).

### 10.11 Parity table (component ↔ schema)

Every row is shown in a "same form twice" story (§16) and has a render-equivalence test (same DOM roles).

| Component mode                                                         | Schema mode                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<form.XField name … />` / `field.XField`                              | `{ kind: 'x', name, … }`                                                                                                                                                                                                                      |
| field `validators`                                                     | `rules`, `warnRules`, form-level `schema`                                                                                                                                                                                                     |
| `warn` prop                                                            | `warnRules`                                                                                                                                                                                                                                   |
| `disabled` / `readOnly` / `excluded` / `required`                      | `disabledWhen` / `readOnlyWhen` / `excludeWhen` / `requiredWhen` (+ static props)                                                                                                                                                             |
| `listeners.onChange → resetField`                                      | `resets`                                                                                                                                                                                                                                      |
| `derive`                                                               | `compute`                                                                                                                                                                                                                                     |
| `loadOptions` + `reloadOn`                                             | `optionsFrom: { loader, deps }`                                                                                                                                                                                                               |
| `<When is / condition>`                                                | `when`                                                                                                                                                                                                                                        |
| every layout in §9                                                     | `layout: 'grid' \| 'gridItem' \| 'section' \| 'aside' \| 'rows' \| 'panels' \| 'panel' \| 'tabs' \| 'tab' \| 'accordion' \| 'accordionItem' \| 'steps' \| 'step' \| 'repeater' \| 'sentence' \| 'review' \| 'actions' \| 'stack' \| 'inline'` |
| `<SubmitButton>` / `<ResetButton>` / `<ErrorSummary>` / `<FormStatus>` | `{ content: 'submit' \| 'reset' \| 'errorSummary' \| 'status', label? }`                                                                                                                                                                      |
| `<Heading>` / `<Text>` / `<Alert>` / `<Divider>`                       | `content: 'heading' \| 'text' \| 'alert' \| 'divider'`                                                                                                                                                                                        |
| custom component                                                       | `{ custom: key, props }`                                                                                                                                                                                                                      |
| `withForm` piece                                                       | a subtree (schemas compose as plain objects: `children: [...addressNodes]`)                                                                                                                                                                   |

---

## 11. Accessibility

### 11.1 Native semantics

`<form noValidate>` (the library renders its own messages; native bubbles are inconsistent and unlocalised), real `<label for>`, `fieldset`/`legend` for groups (radio, checkbox group, choice cards, chips, date range, repeater items, sentence), and `section aria-labelledby` for headed chapters.

### 11.2 Required

A visual `*` (`aria-hidden`) plus native `required` where the element supports it, `aria-required` otherwise; a legend `*` for groups. Optional fields may say "Optional" instead (`optional` prop). Pick one convention per form (the docs recommend marking the minority).

### 11.3 Descriptions and errors

Linked with `aria-describedby` (description, warning and error ids). `aria-invalid` is set only while the error is visible.

### 11.4 Announcements

An inline error is announced once when it appears on blur (`role=alert`, `errorLive`). After a submit attempt (or a step's scoped attempt) only the **ErrorSummary** announces, keyed per attempt. Repeater and step changes use one polite region per layout. Combobox result counts are polite and debounced. Async validation sets `aria-busy`.

### 11.5 Focus

An invalid submit focuses the summary (if present) or the first invalid field in DOM order, after revealing its tab, accordion item or step. Summary links move focus to the control. A new step focuses the step heading. Repeater add, remove and move have deterministic targets (§9.9).

### 11.6 Submit is never disabled

`aria-disabled` plus an explanation; clicking while invalid still validates and moves focus. A "disable until valid" option is deliberately not offered (§13 #5).

### 11.7 Autocomplete and input modes

Text-like fields accept a typed `autoComplete` (`AutoFill` tokens) and `inputMode`. Password requires `current-password` or `new-password`; the one-time code uses `one-time-code`.

### 11.8 Every control has an accessible name

`label` is a required prop on every field (TypeScript-enforced). `labelHidden` keeps it for assistive technology.

### 11.9 Keyboard

Every ui control is operable by keyboard (Radix, or the documented patterns in §8). No keyboard traps. Esc closes popovers without clearing values.

### 11.10 Reduced motion

kiln-forms adds no motion. ui components collapse durations, and focus scrolling is instant under `prefers-reduced-motion`.

### 11.11 Colour

Errors and warnings use tone tokens plus an icon plus text, never colour alone. Focus never looks like validation (DESIGN §2).

### 11.12 Testing

axe-core runs on every field conformance render and every layout in the test suite, and is planned over every `Forms/*` story in every theme and both modes (§15.1).

---

## 12. Performance

Rules, enforced in review and by `test/perf.test.tsx`:

### 12.1 The form host never subscribes

TanStack's `useForm` doesn't. **Never read `form.state` in render.**

### 12.2 Fields subscribe narrowly

Field components subscribe only through their `AppField` plus one boolean (`submitted`).

### 12.3 Primitive selectors

Form-wide reads are **primitive selectors** (`s => s.isSubmitting`). A derived object uses `useSelector(store, sel, { compare: shallowEqual })`. `form.Subscribe` with tuple selectors is banned in the package (a `no-restricted-syntax` lint rule on `selector={(s) => [`).

### 12.4 Small subscriptions

Scope counts are numbers; `When` is a boolean; `useFieldValue` is one path.

### 12.5 Arrays

The Repeater container uses `mode="array"`; each item field is its own subscription.

### 12.6 Caching

Schema analysis is cached per schema object, compiled validators per node object, and bound components per form instance. Consumers should define schemas at module level (identity-stable).

### 12.7 Validation timing

Form-level schemas run on blur and submit, and on change only after the first blur or submit (§5.2), not on every keystroke of a pristine form.

### 12.8 No lazy fields

No `React.lazy` for fields: the whole kit is small, and lazy fields make stories and tests async. Revisit only if the Combobox or FileDrop cost shows up in a size report.

### 12.9 Acceptance test

A 60-field form (mixed kinds, tabs, a repeater of 10 rows, 5 `When`s): typing 10 characters into one text field re-renders exactly that field component 10 times and nothing else (React `<Profiler>` counters per component). The first submit re-renders each field once (its visibility input flips); a second submit re-renders none, beyond the summary and the submit button (A.10).

---

## 13. Coverage matrix

The use cases a form library has to cover, and the feature that covers each. C is component mode, S is schema mode, and ✗ marks something deliberately excluded (with the reason). Code and tests cite rows as `§13 #n`.

| #   | Use case                                                                                     | Covered by                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Create with defaults                                                                         | C: typed `defaultValues`, field `defaultValue` (TanStack prioritised defaults). S: node `defaultValue`. No blanket `''` fallback.                                                                              |
| 2   | Edit, bound to refreshing server data                                                        | C/S: `useServerValues(form, data, { keepDirty })`: an explicit baseline; untouched fields take new server values (§6.5).                                                                                       |
| 3   | Keep errors across a refresh                                                                 | `useServerValues` with `keepErrors: true` (the default) restores visible error maps.                                                                                                                           |
| 4   | Dirty tracking through refreshes and array operations                                        | `isDirty = !isDefaultValue` (deep compare against the baseline) through `useFormStatus`; tests for array add → remove and save → clean; `useUnsavedChanges`.                                                   |
| 5   | Disable save when clean or invalid                                                           | `SubmitButton requireChanges` → `aria-disabled` plus a reason. ✗ "disabled when invalid": inaccessible; an invalid submit reveals the errors instead.                                                          |
| 6   | Prevent double submit                                                                        | `<Form>` ignores submits while submitting; SubmitButton `aria-disabled` + loading; `afterSubmit: 'lock'` for modals.                                                                                           |
| 7   | A throwing submit isn't success, can be resubmitted, and never leaves an unhandled rejection | The submit pipeline, §5.5 (catch, `onSubmitError`, a default form-level message).                                                                                                                              |
| 8   | Server errors mapped to fields                                                               | `throw new FormSubmitError({ fields, form })` / `applyServerErrors`; or TanStack `onSubmitAsync` returning `{ fields }`. Cleared on the next edit.                                                             |
| 9   | `onSubmit` can reset                                                                         | `formApi` in the `onSubmit` context, plus the `afterSubmit` policy (default `rebaseline`).                                                                                                                     |
| 10  | Cancel / reset                                                                               | `ResetButton` (native reset → `form.reset()`), `to: 'baseline' \| 'defaults'`.                                                                                                                                 |
| 11  | External submit button                                                                       | `<Form id>` + `<SubmitButton form={form} formId=…>` (the native `form` attribute).                                                                                                                             |
| 12  | Form-level disabled vs readOnly, merged with field-level                                     | `Form`/`FormSection` `disabled`/`readOnly` cascade through FieldPresentation; §5.4 semantics. S: `disabledWhen`/`readOnlyWhen`.                                                                                |
| 13  | Validation modes                                                                             | `validateOn` plus per-event TanStack validators; reward-early logic (§5.2).                                                                                                                                    |
| 14  | Unregister hidden fields                                                                     | `When whenHidden` (`prune`, `keep`, `reset`), `excluded`; `form.deleteField` through the escape hatch.                                                                                                         |
| 15  | Observe values without re-rendering                                                          | Form `listeners.onChange` (+ `onChangeDebounceMs`), `form.store.subscribe`.                                                                                                                                    |
| 16  | Autosave / live sync to an external store                                                    | `useAutosave` (debounced, only when valid, rebaseline, status) + `FormStatus`; sync to any external store through listeners.                                                                                   |
| 17  | Suspend fields during structural array operations                                            | ✗ not needed: TanStack ≥ 1.33.2 recreates the FieldApi on a name change, and Repeater owns all operations.                                                                                                     |
| 18  | Whole-form schema                                                                            | `useAppForm({ schema })`: any Standard Schema; `output` typed.                                                                                                                                                 |
| 19  | Per-field rules and dependencies                                                             | Field `validators` + `onChangeListenTo`; S: `rules`.                                                                                                                                                           |
| 20  | Cross-field validation; stale errors clear                                                   | Form schema refinements routed by path; form-level `onDynamic` re-runs on any change after the first blur or submit, so the _other_ field's stale error clears; `onChangeListenTo` for field-level validators. |
| 21  | Per-step validation                                                                          | `FormSteps` scope validation + `step.schema` (§9.8).                                                                                                                                                           |
| 22  | Feature-flagged schema variants                                                              | Schemas are values: choose at the call site (`step.schema={flag ? v2 : v1}`, `useAppForm({ schema })`); S: `context` conditions.                                                                               |
| 23  | Focus the first invalid field                                                                | Built in: DOM order, reveal chain, every field registers a ref (conformance-tested).                                                                                                                           |
| 24  | Soft warnings vs errors                                                                      | `warn` prop / `warnRules` → ui `warning`; an error wins.                                                                                                                                                       |
| 25  | Clear errors when locked                                                                     | `disabled`, `readOnly` and `excluded` clear errors and gate validation (§5.4).                                                                                                                                 |
| 26  | Translated messages                                                                          | `formatError`, `messages` (rules use `$keys` + params).                                                                                                                                                        |
| 27  | Keystroke guards                                                                             | ui inputs own them: NumberInput and AmountInput parsing, OTP `validationType`, native `maxLength`, TagsInput rejections.                                                                                       |
| 28  | Displayed value differs from stored value                                                    | Explicit contracts: Select and Radio keep primitive types, Combobox stores the value and shows the label, Amount major/minor, dates as ISO strings, the FileValue union. Phone ✗ (custom field).               |
| 29  | Empty semantics per type                                                                     | The §7.1 table, fixed per value type.                                                                                                                                                                          |
| 30  | Reset a child when its parent changes                                                        | A field listener; S: `resets`.                                                                                                                                                                                 |
| 31  | Sibling-aware rendering                                                                      | `useFieldValue` in a `withForm` piece. S: ✗ dynamic props; use a custom field or a custom node (keeps the schema JSON).                                                                                        |
| 32  | Grouped options, dividers, "All"                                                             | `FieldOption.group` → Select and Combobox groups; CheckboxGroup `selectAllLabel`.                                                                                                                              |
| 33  | Long lists with typeahead and aliases                                                        | Combobox ranking + `keywords`, diacritic folding.                                                                                                                                                              |
| 34  | Async search / injected options                                                              | `loadOptions`/`optionsFrom` + `useOptions` (debounce, abort, cache); injected = the `options` prop.                                                                                                            |
| 35  | Free text with suggestions vs pick-only                                                      | Combobox `creatable` vs the default.                                                                                                                                                                           |
| 36  | Composite values                                                                             | `dateRange` and `range` fields; `withFieldGroup` (address, min/max, password + confirm); custom fields.                                                                                                        |
| 37  | File with an existing placeholder                                                            | The `FileField` value includes `StoredFile` entries (thumbnails from `url`).                                                                                                                                   |
| 38  | PIN / one-time code                                                                          | `OneTimeCodeField` (controlled; a reset clears it).                                                                                                                                                            |
| 39  | Colour with swatches / reset                                                                 | `ColorField` `swatches`, `swatchesOnly`; reset through `ResetButton`/`form.resetField`.                                                                                                                        |
| 40  | Counter, resize, rows                                                                        | ui `showCount`, `rows`, `autoResize`, `maxRows`.                                                                                                                                                               |
| 41  | autoFocus, autoComplete                                                                      | Typed passthrough; `autoFocus` allowed but discouraged in the docs.                                                                                                                                            |
| 42  | Custom component fields                                                                      | `defineField` + `useFieldBinding` + `kit.extend({ fields })`: typed everywhere, schema mode included.                                                                                                          |
| 43  | Server-driven fields                                                                         | Schema JSON + `parseFormSchema` + registries (§10.8).                                                                                                                                                          |
| 44  | Repeaters: add/remove, uniqueness, max, reorder                                              | `Repeater` (min/max, move up/down, focus management) + the `unique` rule or an array validator. Drag ✗ in v1 (keyboard reorder instead).                                                                       |
| 45  | Analytics listeners (once, on blur, if edited)                                               | A field `listeners.onBlur` checking `fieldApi.state.meta.isDirty`.                                                                                                                                             |
| 46  | Dynamic field lock with overrides                                                            | The consumer computes `disabled`/`readOnly`; S: `disabledWhen`/`readOnlyWhen` + `context`.                                                                                                                     |
| 47  | Mutually exclusive branches                                                                  | `excluded` / `excludeWhen` (visible, not validated, default submitted) + a listener that auto-selects the branch.                                                                                              |
| 48  | Create vs edit modes                                                                         | The same components with mode props; S: `context: { mode }` conditions.                                                                                                                                        |
| 49  | Show or hide on other values                                                                 | `When` / `when` (reactive, a boolean selector).                                                                                                                                                                |
| 50  | Branching wizard, step counter, deep link, clear branch                                      | `FormSteps` (`Step` inside `When`, controlled `value`, `Stepper` compact "Step 2 of 4"), pruning.                                                                                                              |
| 51  | Success screen outside the form                                                              | `onSubmit` → app state, or `useFormStatus().isSubmitSuccessful`; a recipe story.                                                                                                                               |
| 52  | Rows of 1 to 3 columns, spacers, sections, dividers                                          | `FormGrid` (+ `start` spacers), `FormSection`, `Stack dividers`.                                                                                                                                               |
| 53  | Render a registered field anywhere by name                                                   | `form.XField name` anywhere; S: `<SchemaNode id>`.                                                                                                                                                             |
| 54  | Label-left rows, inline radios, custom grids                                                 | `FormRows`, `FormAside`, Field `layout="horizontal"`, RadioGroupField `orientation`, `FormGrid`.                                                                                                               |
| 55  | A light/dark theme prop on the form                                                          | ✗ by design: themes and modes come from kiln-ui's theme provider and scopes only.                                                                                                                              |
| 56  | Deterministic test ids                                                                       | ✗ generated ids: tests use roles and labels; a stable `data-field={name}` is on every control for end-to-end tests.                                                                                            |

---

## 14. Escape hatches (never blocked)

| Need                                    | Hatch                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Any TanStack API                        | The `form` object _is_ TanStack's (`form.Field`, `form.Subscribe`, `form.FormGroup`, `form.store`, `setFieldMeta`, …).           |
| The raw field inside a custom component | `useFieldBinding(...).api` or `useFieldContext()`                                                                                |
| A control kiln-forms doesn't ship       | `defineField<V>()(MyField)` with `useFieldBinding`; register it with `kit.extend` to get `field.X`, `form.X` and a schema kind   |
| A bare kiln-ui control, no binding      | `<form.Field name>{(f) => <Slider value={f.state.value} onValueChange={f.handleChange} …/>}</form.Field>`                        |
| A layout kiln-forms doesn't ship        | Any component; `FieldScope`, `FieldPresentation` and `useScopeErrors` for integration; `kit.extend({ layouts })` for schema mode |
| A schema node with arbitrary UI         | `{ custom: 'key', props }` through `defineCustomNode`                                                                            |
| Custom validation timing                | Pass `validationLogic` (inactive gating still wraps it)                                                                          |
| A custom error display policy           | An `errorVisibility` function                                                                                                    |
| Opt out of the summary and focus        | `focusOnInvalid: false`                                                                                                          |
| Skip the kit entirely                   | `useFieldContext` and `fieldContext` are TanStack's; `createFormHook` directly with the kiln-forms field components works        |

---

## 15. Testing strategy

### 15.1 Levels

- **Type tests** (`*.test-d.tsx`, run by `tsc --noEmit` through the package `typecheck`): every row in §3.2, the schema expected errors (§10.1), `withForm`/`withFieldGroup`/`Repeater`/`When` typing, and `useAppForm` inference (schema output, meta, field map keys). Budget: package typecheck under 20 s.
- **Unit**: conditions, the rules compiler, `parseFormSchema`, `toStandardSchema`, issue routing, prune, the validation logic matrix, error normalisation, message interpolation, `shallowEqual`.
- **Behaviour** (Vitest + Testing Library + user-event, jsdom): each field, each layout, the form components, and the hooks (`useServerValues` scenarios, `useAutosave` with fake timers, `useOptions` abort and cache).
- **Conformance suite** (`test/conformance.tsx`, `runFieldConformance(kind, options)`), run for **every** registered field kind:
  1. label ↔ control association (`getByLabelText`);
  2. no error before blur; an error after blur when invalid; `aria-invalid` matches; the error id is in `aria-describedby`;
  3. an error after submit without blur;
  4. focus moves to it on an invalid submit;
  5. `form.reset()` restores the default in the DOM;
  6. disabled: not focusable, not validated; readOnly: focusable, not editable, not validated;
  7. `name` present for FormData (`new FormData(form)` has the key);
  8. view mode renders the display value and no control;
  9. a warning is shown and doesn't block;
  10. axe-core: no violations.

  Field authors supply `valid`, `invalid` and an `interact(user, el, value)` function; compound controls configure the check rather than skipping it (A.6).

- **Performance**: the §12 render-count test.
- **React 18**: `vitest.react18.config.ts` runs the full suite against React 18.3. React 18 comes from the private `@mitcsutt/kiln-testing-react18` fixture package, whose only dependencies are React 18 and the libraries that import React themselves, so pnpm resolves all of them against React 18 ([ADR 0004](../../../docs/adr/0004-react-18-and-19.md)). kiln-ui runs the same way.
- **Storybook** (once the workbench hosts the stories): axe over every `Forms/*` story in every theme (Paper, Monograph, Ledger, Fiesta) and both modes, and a real-browser keyboard pass of Combobox and FileDrop, which jsdom can't verify (A.10). Until then, stories are checked by `typecheck` and `lint`.

### 15.2 Commands that must pass

```sh
pnpm --filter @mitcsutt/kiln-forms typecheck
pnpm --filter @mitcsutt/kiln-forms test
pnpm --filter @mitcsutt/kiln-forms test:react18
pnpm --filter @mitcsutt/kiln-forms lint
pnpm --filter @mitcsutt/kiln-forms build
pnpm --filter @mitcsutt/kiln-forms check:package   # publint + attw, and the ./schema entry in plain Node
pnpm --filter @mitcsutt/kiln-forms size            # size report against size.config.json budgets

# whole repo, from the root (what CI runs)
pnpm lint && pnpm typecheck && pnpm test && pnpm test:react18 && pnpm build && pnpm check:package
```

---

## 16. Storybook plan

Stories are co-located with the source (`<Name>.stories.tsx`) and titled by the shared docs and Storybook tree ([ADR 0010](../../../docs/adr/0010-information-architecture.md)): at the top level, `Forms` always means kiln-forms, and kiln-ui's unbound controls live under `UI/Inputs`. Copy follows DESIGN §2: realistic, invented content, sentence case, no lorem ipsum, no emoji. Every story must be right in every theme and both modes.

| Title                                                                                                                                                                                                                            | Stories                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Forms/Getting started/Account settings`                                                                                                                                                                                         | `FormAside` sections: Profile (name, avatar file), Notifications (switch rows through `FormRows`), Security (a password pair field group), Danger zone; autosave with `FormStatus`.  |
| `Forms/Getting started/Onboarding`                                                                                                                                                                                               | Multi-step with branching (a step inside `When`: business vs personal), a deep-linked step, and the pruned branch shown in the submitted output.                                     |
| `Forms/Getting started/Recurring invoice`                                                                                                                                                                                        | `FormSentence` mad-libs.                                                                                                                                                             |
| `Forms/Fields/<Kind>Field` (28, e.g. `Forms/Fields/TextField`)                                                                                                                                                                   | Playground (args); States (default, with description, error after blur, warning, disabled, readOnly, validating); in a form (`form.XField` + submit); view mode.                     |
| `Forms/Layouts/FormGrid`, `FormSection`, `FormAside`, `FormRows`, `FormPanels`, `FormTabs`, `FormAccordion`, `FormSteps`, `Repeater` (list, table, cards), `FormSentence`, `FormReview`, `FormActions`, `When`, stack and inline | Each: component mode and the **same form in schema mode** side by side (parity, §10.11).                                                                                             |
| `Forms/Layouts/Form`, `SubmitButton`, `ResetButton`, `ErrorSummary`, `FormStatus`                                                                                                                                                | The form components sit beside the layouts that hold them: `Form` (external submit, view mode), `SubmitButton` (`requireChanges`, lock), `ErrorSummary`, `FormStatus` with autosave. |
| `Forms/Schema/Playground`                                                                                                                                                                                                        | A JSON editor (Textarea) → `parseFormSchema` → a live `SchemaForm`, with the issues list and the submitted `output` JSON.                                                            |
| `Forms/Schema/Content nodes`                                                                                                                                                                                                     | Heading, text, alert and divider nodes, and the form-component content nodes.                                                                                                        |

The `Forms/Hooks/` group of the tree holds the hook pages; hooks are exercised inside the field, component and Getting started stories.

Until the Storybook workbench lands, stories are checked by `typecheck` and `lint` only; the per-theme axe pass (§15.1) runs once they are hosted there.

---

## 17. Consequences

- kiln-ui carries about 20 form components (§8), each usable without TanStack or kiln-forms.
- Field components in kiln-forms are about 15 lines each. Custom fields written by a consumer get the same typing, schema support and conformance tests as the built-in ones.
- Component mode and schema mode can't drift, because both read the same registry and every layout has a schema node.
- Forms stay type-safe from `defaultValues` through to the parsed `output`. The type cost is under a second of check time for a large form, and schema typing is opt-in (`defineFormSchema`).
- Consumers must model clearable numbers as `number | null`, and dates and times as ISO strings.
- The bound field components are `Form`-prefixed (`FormTextField`), so a consumer importing both packages can't auto-import kiln-ui's unbound `TextField` by mistake. The kit shorthand is unaffected ([ADR 0017](../../../docs/adr/0017-kiln-forms-port.md)).
- **v2 path**: TanStack Form v2 adds `errorVisibility`, strict field components and `defineFieldGroup`. The facade already matches those concepts, so a migration swaps the internals of `useFieldBinding`, the kit and `kitValidationLogic`, not consumer code. Public types never expose TanStack generics except through `KitForm` and the documented passthroughs.
- **Risks**:
  1. TanStack's private-ish internals (`fieldInfo`, `fieldMetaBase`): not used; the package uses the public `getFieldMeta`, `setFieldMeta` and `store`.
  2. `unstable_` Radix parts (password toggle, one-time password field): each is wrapped in one kiln-ui file, so the cost of swapping one out is local.
  3. Type instantiation cost for very wide value types: kept within what tsc handles in under a second for a large form; schema typing is opt-in.

---

## 18. How the package is organised

- **Layers** (§2.1): kiln-forms is logic only. It depends on `@tanstack/react-form` and renders everything through its kiln-ui peer. A missing input is added to kiln-ui first, then bound here.
- **Core** (`src/core`): the kit (§3), the binding hook (§4), the runtime (§5), scopes and hooks. Fields, layouts, form components and the schema renderer are built only on core's public surface.
- **Fields** (`src/fields`): one folder per bound field, `Form<Kind>Field`, each binding exactly one kiln-ui `*Field` and registered in `defaultFields` under its kind.
- **Layouts** and **components** (`src/layouts`, `src/components`): composition of kiln-ui primitives with `FieldScope` and `FieldPresentation`; no CSS.
- **Schema** (`src/schema`): `core` is React-free and is the `./schema` entry point; `render` maps nodes onto the same fields and layouts.
- **Tests** are co-located (`*.test.ts(x)`, `*.test-d.ts(x)`), with shared harnesses in `src/test` (§15). **Stories** are co-located too (§16).
- **Build**: Vite library mode, ESM only, `preserveModules`, `.d.ts` output; two entry points (`.` and `./schema`). `scripts/check-schema-entry.ts` proves the packed `./schema` entry loads in plain Node with no React installed, and `size.config.json` sets the size budgets.
- **Rules**: [`packages/forms/AGENTS.md`](../AGENTS.md) is binding for contributors. Change it only together with the lint rules or tests that enforce it.

---

## Appendix A. Decisions during build

The body above is the design as planned. These entries record where the build went a different way, each with its reason. Where an entry and the body disagree, the entry wins.

### A.1 Kit and types (§3)

- `FieldRegistry = Record<string, FieldDef<Contract, any>>` uses the one `any` §3.2 allows. `never` fails on `ComponentType`'s class branch (`defaultProps`).
- Submit meta `M` defaults to `undefined`, not `never`. With `never` a `KitForm` isn't assignable to `AnyFormApi`, and `formOptions(...)` spreads infer `undefined` anyway.
- `AnyKitForm` is structural (`{ store; state: { values? } }`) and lives in `core/kit/types`. A concrete `KitForm<T>`'s generic methods collapse to `never` against `AnyFormApi`, so every public API takes `AnyKitForm` and converts with `toFormApi`. Hooks are generic over `A extends AnyKitForm` for the same reason.
- `coreApi(form)` and `runtime.core` give the core `FormApi`. TanStack's React form is a spread copy whose `options` goes stale after `update()`.
- `createFormKit<const K extends KitInput>(registries: K)` takes one const generic, with extras `X = Omit<K, 'fields'>`. The planned `<const R, const X>` over an intersection couldn't infer `X`, which widened every layout key to `string`. `extend` works the same way.
- `kit.defineFormSchema<T, C = {}>()` drops the `C extends Record<string, Primitive>` constraint, so interfaces (no index signature) work as context types.
- Typed schemas carry an optional phantom `'~types'` marker. Every typed schema is assignable to `UntypedFormSchema` by design, so without it any schema would fit any form. JSON round trips are unaffected because it's never set.
- `FieldBindingOptions` also takes `layout`, `labelHidden` and `aria-describedby`, so a field's own props beat presentation. `withForm`'s `props` option is merged under passed props, as TanStack does.
- `useOptionMapping(options, { emptyOption })` in `core/binding/optionValues` was added for the option fields.
- `FormRuntime.registry` holds the kit's field registry (set by `useAppForm`). Repeater uses `bindFields(form, registry, prefix)` for item fields instead of a Proxy over `AppField`.

### A.2 Validation and submit (§4.2, §5)

- `canSubmitWhenInvalid` defaults to `true` in the kit, because TanStack otherwise short-circuits validation once one error shows. `useFormStatus().canSubmit` is computed separately.
- On an invalid submit the kit runs form-level `submit` validators explicitly when field validators failed. TanStack skips them, so a schema's errors wouldn't appear on the first submit.
- Server errors clear on the field's next change or on submit, not on blur, to match §4.2 item 7.
- The form `onChange` debounce is reimplemented per field. The kit needs an undebounced listener to know which field changed for the `onDynamic` live predicate.
- `output` is only ever a successful schema parse (§5.5 step 2). If the submit-time parse of pruned values fails, including on inactive paths only, the pipeline stops with `messages.submitFailed` and a development warning that names the paths. This keeps the `O` type honest. A schema that requires a conditionally hidden field has to make it optional.
- The submit-time schema re-parse is inside the pipeline's try/catch, so a throwing schema never becomes an unhandled rejection (§5.5 step 6).
- A disabled control submits nothing in native `FormData`, including the package's own hidden inputs. The kit submits from state, so it's unaffected.

### A.3 Messages (D15)

`FormMessages` gained `yes`, `no` and `notProvided` (view mode), `actions` (the Repeater table header), `edit` (FormReview), `stepComplete`, `stepError` and `stepCompact(index, count)` (Stepper), and `reset` (the ResetButton's default text, so a schema `{ content: 'reset' }` needs no label).

### A.4 View mode (§9.11)

- No TanStack `FieldApi` is created in view mode. `bindFields` renders a `ViewField` with a read-only field context, so a review step never takes over the real field's instance, validators or meta. Repeater in view mode creates no array field either.
- The canonical `<form.AppField name>{(field) => …}</form.AppField>` render prop gets a read-only stub `field` in view mode (value, name, form, the kit's field components, clean meta, no-op setters). It has no `store` and no array helpers.
- A view-mode field renders its own one-item `DataList`, or a bare `DataList.Item` when it sits directly in a `FieldViewList`. `FormReview` doesn't wrap children in a `DataList`, and every layout renders a `FieldViewListBoundary`. That gives valid list markup everywhere without per-layout view branches.
- `FieldViewList` and `FieldViewListBoundary` are exported from `@mitcsutt/kiln-forms`, so custom layouts (§9.13) can render the boundary. `revealFieldErrors` and `isRevealedMeta` stay internal for now, because they take `AnyFormApi`, not `AnyKitForm`, so a custom step-like layout can't reveal errors yet.
- `FormPasswordField` shows a fixed eight-dot mask in view mode, so it doesn't leak the value or its length.

### A.5 kiln-ui components (§8)

- Group fields built on `Fieldset` (checkbox, radio and chip groups, choice cards, date range) don't support `layout="horizontal"`, because `Fieldset` has no layout. Inside `FormRows` or `FormAside` they stack their legend above the options while the other rows are label-left. A test pins this behaviour until `Fieldset` gains a layout.
- `StepperStep.invalid?: boolean` lets a current step also show errors and keep `aria-current="step"`. An invalid step's hidden error suffix replaces "completed", since announcing both reads badly.
- `SubmitButton` uses `Button asChild`. `Button loading` sets native `disabled`, which breaks "never disabled".
- `ErrorSummary`'s heading is a `<span role="heading" aria-level>` inside the `Alert` title, which is a `<p>`.
- Combobox writes the picked label into its input, which fires `onInputValueChange`. `FormComboboxField` skips a query equal to the just-picked label instead of changing ui.

### A.6 Fields (§7)

- The catalogue has 28 kinds, as §7.2 lists.
- The `chips`, `checkboxGroup` and `multiChoiceCards` kinds bind `string | number` options only, matching §7.2. Only `radio` takes booleans among the choice groups.
- `FormMultiSelectField` has no `creatable` prop, so "creatable is single only" is a type rule. The combobox and multi-select fields have no `emptyOption`, because ui `Combobox` has `clearable`.
- `runFieldConformance` gained `leaveControl`, `describedByTarget`, `focusTarget` and `isDisabled` options. Compound controls configure the check instead of skipping it. The defaults are unchanged.

### A.7 Layouts (§6.6, §9)

- `scopeNames` is accepted by exactly `FormTab`, `FormAccordionItem`, `FormStep`, `FormSentence` and `When`. The other layouts have no scope, so the prop would do nothing there.
- `When` takes `is` or `condition`, both optional (`is` wins; with neither, the content shows), plus an internal `context` for schema `context` conditions. It imports `evaluateCondition` from `#schema/core/conditions`.
- `Repeater` has a `validators` prop for array-level rules (`minItems`, `unique`), because component mode had no other way to attach them.
- Repeater item actions sit after the item's fields. A button inside `<legend>` becomes part of the group's accessible name, and positioning it beside the legend would need CSS.
- The Repeater table's actions column has a visually hidden "Actions" header. The buttons label themselves, so a visible header only adds noise.
- A Repeater's array error treats a structural change (`isTouched`) as its blur. An array has no focus of its own, so under the `blur` policy its error would otherwise wait for submit.
- Next on a step makes that step's errors visible whatever `errorVisibility` says. It never blocks on an error the user can't see. `useScopeErrors` counts revealed errors, so badges and step status agree.
- Enter in a text input on a non-final step means Next. Implicit submission would otherwise submit a half-filled wizard.
- `FormSteps` gained `headingLevel` (default 3) and an opt-in `compactBelow?: 'sm' | 'md'`, so existing wizards don't change on narrow screens.
- `FormReview` gained `headingLevel` and `step`. Its Edit button appears whenever there's an action, with text from `editLabel` or `messages.edit`, and it's described by the step title.
- `FormSentence` renders `Text as="div"`, because bound fields render block elements and a `div` inside a `p` is invalid DOM.
- `FormSection` requires `title` (§9.2); there is no untitled bare `<fieldset>`.
- A tab or accordion trigger's error count is a visually hidden " 2 errors" after the label, and the `Badge` is `aria-hidden`.

### A.8 Schema core (§10.1 to §10.5, §10.8, §10.9)

- `NodeBase` and `FieldNodeCommon` are type literals, not interfaces. Only type literals get the implicit index signature that makes a typed schema assignable to `UntypedFormSchema`.
- `UntypedFormSchema` is its own structural interface, not `FormSchema<Record<string, unknown>, …>`, so untyped literals compile and component props stay readable.
- Conditions use root paths everywhere, including `when`, `disabledWhen`, `readOnlyWhen`, `excludeWhen` and `requiredWhen` on repeater item fields. This follows §10.2's types. An item field that depends on a sibling in the same item needs a custom node or validator for now.
- Static `required: true` on a field node also adds the `required` rule, in `toStandardSchema` and the renderer (`withRequired`). In JSON it's the natural way to say required.
- Rule semantics the design left open:
  - non-`required` rules, custom ones included, skip empty values;
  - `required` treats whitespace and the kind's empty (`false`) as empty;
  - `pattern` is an unanchored test with `g`/`y` stripped;
  - `minDate`/`maxDate` accept `'today'` and compare ISO strings on their common prefix, so `date` and `dateTime` mix;
  - `truthy` treats `[]` as false.
- `parseFormSchema` accepts the default layouts plus `registry.layouts`, gives a `review` subtree its own name scope, rejects stray keys on custom nodes, and checks only required text props on layouts.
- `toStandardSchema` takes optional `validators` and an `empties` map (default `{ checkbox: false, switch: false }`), so an unticked "I agree" fails `required` on the server. Its success output is the active fields only (A.11).
- `RepeaterNode` gained `rules`, `whenHidden`, `description`, `empty` and `columns`. `itemLabel` (a function) isn't available in schema mode. `columns[].width` is `'fill' | 'min'`, a literal union kept equal to ui `TableColumnWidth` by a type test, so schema core stays free of ui imports.
- `analyseSchema(...).names(node, prefix)` returns scope-relative names. A repeater contributes only its array name, since item names aren't known statically.

### A.9 Schema rendering (§10.6, §10.7)

- `compute` registers with a runtime derive registry (`registerDerive`, reference-counted per owner). The form `onChange` listener runs component `derive` and schema `compute` rules the same way: only when a `from` path (or a path under it, A.11) changes, never on mount, and without touching meta. A pristine form stays clean, and a hidden computed field keeps updating. `compute` on a repeater item field is ignored with a development warning, because its path differs per item.
- `optionsFrom` on `combobox` and `multiSelect` maps to the field's `loadOptions` + `reloadOn`, so typed queries, loading, `optionsFailed` and "no request in view mode" all work. Other option kinds resolve through `useOptions` and get `options`, with the loader seeing `query: ''`.
- Condition flags are one bit-set selector per field, not one boolean selector per `*When`. It's one subscription instead of four, and it still re-renders only when a flag flips.
- A `text` content node inside an inline presentation (a sentence, a table cell) renders bare text, not a `<p>`.
- Custom layouts receive `node` and `form`. Built-in layouts get only their JSON props, plus `scopeNames` for the scoped keys, so nothing leaks to the DOM.
- `SchemaNode` takes an optional `prefix` to render an item node outside its repeater (`prefix="guests[0]"`).
- `SchemaNode` renders the node's own `when` but not its ancestors' (it has no ancestors to read). Gate it yourself, or render the subtree from its visible parent, when an ancestor's `when` should hide it.

### A.10 Tooling and verification

- The first submit re-renders every field once (§12.2's `submitted` flip changes each field's error-visibility input). A second submit re-renders none (asserted). This amends the original acceptance sentence "submit re-renders only fields whose error visibility changed" (§12.9).
- After a successful submit with `afterSubmit: 'rebaseline'`, a visible `excluded` field's input is reset to its default, because the baseline is the pruned payload (§5.5 step 4). It contradicts §5.4's "user input survives" for that one case; accepted for v1.
- Type a file field's path as `FileValue[]`. `FormFileField` binds exact `readonly FileValue[]`, so `defaultValues` typed `StoredFile[]` makes `name` resolve to `never`.
- `@storybook/react-vite` is a devDependency of kiln-forms, because its stories can't typecheck without it.
- Two checks sit outside the jsdom suite: axe over every `Forms/*` story in every theme and both modes, and a real-browser keyboard walkthrough of Combobox and FileDrop, which jsdom can't verify.

### A.11 Untrusted schemas and payload semantics

Schemas parsed by `parseFormSchema` may come from a CMS or a database, so the parser and the renderer treat them as hostile.

- **Props.** A prop key must be a camelCase React prop name (`/^[a-z][a-zA-Z0-9]*$/`). Compared case-insensitively, `parseFormSchema` rejects, with the prop's path: `dangerouslySetInnerHTML`, `ref`, `key`, `style`, `className`, `children`, `srcDoc`, any `on…` prop (`/^on/i`), form retargeting (`form`, `action`, `formAction`, `formMethod`, `formEncType`, `formTarget`, `formNoValidate`), the renderer-owned `validators`, `listeners`, `node` and `scopeNames`, and a `javascript:`, `vbscript:` or `data:` URL (control characters ignored) in `href`, `src`, `srcSet`, `xlinkHref`, `poster` and other URL props. A field node's `type` may not be `submit`, `reset`, `button`, `image`, `file` or `hidden`, and no node may carry a `pattern` prop: it would reach the native `<input pattern>`, which the browser runs on every change even under `noValidate` (use a `pattern` rule instead). `fieldNodeProps`, `layoutNodeProps` and `contentNodeProps` strip the same props, so a schema that skipped the parser still can't put HTML in the DOM. Custom node `props` are data handed to the consumer's code and are not filtered: a custom node that spreads them onto the DOM must filter them itself. `parseFormSchema` checks prop safety, not prop meaning: a well-formed but unexpected prop (`as: 'section'`) still reaches the component. Because keys must be camelCase, `aria-*` and `data-*` attributes can't be set from a schema.
- **Patterns.** `parseFormSchema` rejects literal `pattern` rules (in `rules` and `warnRules`) by default, at `….rule`, with "pattern rules aren't allowed in parsed schemas; register a named validator, or pass allowPatterns for trusted sources". No regex heuristic catches every slow pattern (`^\d{0,50}…x$` repeated six times took about 58 s on 256 characters), so untrusted schemas name a registered validator for an email address, a semver string, a slug or a password with lookaheads. `parseFormSchema(json, registry, { allowPatterns: true })` opts in for a trusted source, and the limit checks below then apply as a heuristic, not a guarantee (`^` + `\d{0,10}` ×10 + `x$` passes them), with a bounded quantifier whose range is over 10 (`{0,50}`, `WIDE_RANGE`) counted as unbounded. Typed schemas written in code (`defineFormSchema`), the renderer and `toStandardSchema` keep literal patterns.
- **Limits.** `SCHEMA_LIMITS`: node nesting and condition nesting 64, 2000 nodes, JSON prop nesting 64. With `allowPatterns`, a `pattern` is rejected when it is over 200 characters (`MAX_PATTERN_LENGTH`), repeats a group containing a variable quantifier (`(a+)+`) or an alternation (`(a|a)+`), or has more than 2 unbounded or wide quantifiers (`^a*a*a*b$`, `^a{0,60}a{0,60}a{0,60}b$`; `MAX_UNBOUNDED_QUANTIFIERS`). Schema patterns are for simple formats: the checks are heuristics and reject some safe patterns (`(ab+)+`, the usual slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`). A group with an alternation is allowed when it isn't repeated (`^(Mr|Mrs)?$`). Every breach is an issue; the parser never throws on JSON (a `RangeError` backstop turns into an issue). At runtime a `pattern` rule tests at most 256 characters (`MAX_PATTERN_INPUT`); a longer string fails with the `maxLength` message and code, on the client and in `toStandardSchema`. A hand-built schema that skips the parser can still carry a slow pattern for short inputs, so server code must parse first.
- **Server field set.** The renderer and `toStandardSchema` share `fieldFlags` (static `disabled`, `readOnly`, `excluded` and `required`, the `*When` conditions, and `compute`). On the server, hidden, excluded, disabled, read-only (static or `readOnlyWhen`) and `compute` fields are not validated, matching the client (§5.4), and their values are dropped from the success `value` together with unknown keys. The input decides `*When`, so a client can flip a field to read-only or disabled, but then its value never reaches the payload. The server recomputes or reloads any read-only or computed value it needs. A repeater keeps one object per input item. Fields also inherit `disabled` and `readOnly` from an ancestor layout whose props cascade through `FieldPresentation` (today only `section`, via `layoutFlags`): every field under `{ layout: 'section', readOnly: true }` is skipped and dropped, and a repeater under it is skipped whole. A section's `excluded` is not inherited, because `FormSection` has no such prop and the client keeps those fields. A `review` subtree adds no rules and no output: view mode never validates, so only the field's own node counts.
- **Derive paths.** A `derive` or `compute` rule fires when the changed path equals a `from` path or is nested under it (`splits[0].amount` under `splits`). Derive writes don't leave `runtime.changing` set on the derived field.
- **Repeater prune.** Pruning a field inside a row uses the field-level `defaultValue`, else the row's `newItem` value for that field (each mounted `Repeater` registers its template in `runtime.itemTemplates`), else the form default. If that is `undefined` the key is removed: a pruned path is never written as `undefined`.
- **Autosave.** With `onlyWhenValid` (the default), each save first validates touched fields and the form-level validators with cause `change`, forcing `onDynamic` on for that pass (`runtime.forceDynamic`). An invalid edit is never saved under the default `validateOn: 'blur'`. Errors found stay hidden until `errorVisibility` shows them. Untouched fields aren't validated (TanStack skips pristine fields); their defaults are the consumer's.
- **The `@mitcsutt/kiln-forms/schema` surface.** The entry exports `parseFormSchema`, `evaluateCondition`, `toStandardSchema`, `schemaDefaultValues`, the `define*` helpers, the limits and the types. Internals (`compileRules`, path helpers, key lists, node helpers, `analyseSchema`) are not exported. The main barrel adds `schemaDefaultValues`, `ParseFormSchemaResult`, `SchemaIssue`, `SchemaRegistryNames` and `ToStandardSchemaOptions`.
