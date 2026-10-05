# packages/forms: `@mitcsutt/kiln-forms`

Form state on TanStack Form 1.33, rendered only through `@mitcsutt/kiln-ui`. Two authoring modes share one registry and one set of layouts. In component mode you write `form.TextField name="email"`, and in schema mode you write `{ kind: 'text', name: 'email' }`.

The design is in [`docs/design.md`](docs/design.md), cited as `§n` in code comments. Where the build departed from the plan, its Appendix A "Decisions during build" has the ruling: read it before changing core behaviour. How the package was ported, and how its names avoid `kiln-ui`'s, is [ADR 0017](../../docs/adr/0017-kiln-forms-port.md). This file and the rules below are binding standards ([ADR 0012](../../docs/adr/0012-design-standards.md)): change a rule only together with the lint rule or test that enforces it.

## Rules

- No CSS in this package: no `*.module.css` and no `style`. Layouts compose `@mitcsutt/kiln-ui` primitives through their props. If a layout needs a visual the primitives can't express, add a prop or component to `@mitcsutt/kiln-ui` first.
- Import `@mitcsutt/kiln-ui` only from its barrel (`import { Fieldset } from '@mitcsutt/kiln-ui'`).
- Inside the package, import with `#` subpath imports (`#hooks/useFieldBinding`). Relative `../` imports are out.
- Apps import everything from `@mitcsutt/kiln-forms` (or the React-free `@mitcsutt/kiln-forms/schema`). They never import `@tanstack/react-form`. When an app needs a TanStack type or helper, add it to the passthrough block at the bottom of `src/index.ts`.
- All user-facing text comes from `FormMessages` (`#runtime/messages`), overridable per kit and per form. A new string means a new key with an English default.
- Public functions and props take `AnyKitForm` and convert with `toFormApi(form)` internally. A concrete `KitForm<T>` isn't assignable to TanStack's `AnyFormApi`.
- Anything that reads TanStack form `options` goes through `coreApi(form)`. The React form is a spread copy whose `options` goes stale after `update()`.
- **No export may share a name with a `@mitcsutt/kiln-ui` export**, types included, so an editor can't auto-import the wrong one. Bound fields are exported as `Form<Name>` (`FormTextField`, `FormAmountField`, with `FormTextFieldProps`), while kiln-ui's `TextField` is the unbound control. Inside a form, use the bound `form.TextField` (or `FormTextField`). `src/test/exportNames.test.ts` enforces this.
- Must work on **React 18 and 19** ([ADR 0004](../../docs/adr/0004-react-18-and-19.md)): no `use()`, no ref-as-prop, no React 19-only APIs. The test suite runs on both.

## Architecture

```
src/
  components/
    fields/       one folder per bound field (Form<Name>Field), plus FieldView/FieldViewList (view mode)
                  and FieldPresentation; defaultFields.ts is the registry; internal/ holds field plumbing
    layouts/      one folder per layout + When, plus FieldScope (names + reveal chain);
                  internal/ holds the part registry, badges, announcer
    form/         Form, SubmitButton, ResetButton, ErrorSummary, FormStatus
  hooks/          every public hook, one flat file each: useFieldBinding (the field policy),
                  useOptionMapping, useScopeErrors, useFormStatus, useFieldValue, useServerValues,
                  useAutosave, useUnsavedChanges, useOptions
  kit/            createFormKit, defaultKit (createFormKit({ fields: defaultFields })), types, field
                  contracts (defineField…) and accepts, contexts, bindFields, view-mode ViewField
  runtime/        per-form runtime (not React state): options, field registrations, inactive paths,
                  derive registry, kit field registry, focus, submit pipeline, messages, server errors,
                  error picking and visibility, reveal, field display, label reading
  utils/          env, paths, shallow
  schema/core/    React-free (the ./schema entry): types, conditions, rules, parseFormSchema,
                  toStandardSchema, analyseSchema
  schema/render/  React renderer: SchemaForm/SchemaNode, field/layout/content/custom node views
  test/           renderForm, runFieldConformance, axe helper, perf harnesses, a11y tree
  stories/        story kit, parity fixtures, layout/schema stories, recipes
scripts/          check-schema-entry.ts (the ./schema entry in plain Node, from the packed tarball)
docs/design.md    the design reference (§n)
```

The layout follows kiln-ui's ([ADR 0024](../../docs/adr/0024-kiln-forms-source-layout.md)): every component in `components/<group>/<Name>/`, every public hook in `hooks/`, and a hook owned by one component next to it (`useFormSteps`).

The kit (`createFormKit`) takes one `const K` input: `{ fields, formComponents?, loaders?, validators?, computers?, nodes?, layouts?, messages? }`. `kit.extend({...})` adds to it, and new field kinds can't shadow existing ones. `useAppForm` attaches a `FormRuntime` to each form. Layouts and the schema renderer reach the kit's field registry through `runtime.registry` and call `bindFields(form, registry, prefix)` for typed shorthand under a path prefix (Repeater items).

`schema/core` must load on a server. ESLint blocks runtime imports of `react`, `react-dom`, `@tanstack/react-form` and `@mitcsutt/kiln-ui` there (type imports are fine), `schema/core/node.test.ts` catches React arriving transitively through the `#` modules it imports, and `pnpm check:package` imports the packed `./schema` entry in a project with no React installed. Put anything that renders in `schema/render`.

## Adding a field

1. Build the input in `@mitcsutt/kiln-ui` first if it doesn't exist (a bare control plus a `*Field` wrapper in `components/inputs/`).
2. Create `src/components/fields/Form<Name>Field/` with `Form<Name>Field.tsx`, `index.ts`, `Form<Name>Field.test.tsx` and `Form<Name>Field.stories.tsx` (title `Forms/Fields/<Name>Field`, the kit shorthand).
3. Wrap the component in `defineField<V>()(…)`, or `defineOptionField<B>()` / `defineOptionsField<B>()` for one-of and many-of option fields. The contract is what filters which paths the field can bind to.
4. Call `useFieldBinding<V>({ ...props, accepts: accepts.<guard>, empty })` and spread `binding.fieldProps` and `binding.ref` onto the ui `*Field`. Wire `value`/`setValue`/`onBlur` from the binding and chain the consumer's own `onBlur`. Option fields map values with `useOptionMapping(options, { emptyOption })`. `FormTextField` is the smallest complete example.
5. Return `<FieldView label={props.label}>{display}</FieldView>` when `binding.mode === 'view'`. Format the value for reading and pass `null`/`''` through so it shows `messages.notProvided`.
6. Register the kind in `src/components/fields/defaultFields.ts` (`kind: Component`). The kind `amount` becomes `form.AmountField`, `field.AmountField` and schema `{ kind: 'amount' }`. Export the component and its props from `src/components/fields/index.ts`, with the `Form` prefix.
7. Run `runFieldConformance<V>('<kind>', { build, valid, invalid, interact })` in the test file. It runs the ten §15.1 checks. When a check fails because the control is compound, configure the check instead of skipping it:
   - `leaveControl` for when one `Tab` stays inside the control (an input with its own toggle button, two inputs in a fieldset). `tabOutOfGroup` handles groups where every item is a tab stop.
   - `describedByTarget` for when `aria-describedby` lives on a wrapper, such as a fieldset or a group root (`fieldsetDescribedByTarget`).
   - `focusTarget` for when focus lands somewhere other than `control()`, like the checked radio in a roving group.
   - `isDisabled` for when the control isn't a form element `toBeDisabled()` understands.
   - `control`, `display`, `shown` and `viewText` for finding and reading unusual controls.

   Use `skip` only for a check the field structurally can't pass (DateRange's `formData` has `name.start`/`name.end` keys), and add a dedicated test that covers the same ground.

8. Run the tests under both React versions: `pnpm --filter @mitcsutt/kiln-forms test` and `test:react18`.

## Adding a layout

- Create `src/components/layouts/<Name>/` and export it from `src/components/layouts/index.ts`. Compound parts get a flat export too (`FormTab`, `FormStep`), because the schema layout registry maps keys to flat components.
- Wrap the content in `FieldViewListBoundary` so view-mode fields inside render their own lists instead of leaking `dd`s into a parent `FieldViewList`. In-package layouts import it from `#components/fields/FieldView`. Custom layouts in an app import it from `@mitcsutt/kiln-forms`.
- A layout that hides fields (tabs, accordion items, steps) keeps them mounted (`forceMount` + `hidden`) and wraps each part in `<FieldScope reveal={…} names={scopeNames}>`. Focus management calls `reveal` before focusing an invalid field inside, and `useScopeErrors(scope)` gives the badge count.
- Only scope-bearing parts accept `scopeNames`. Today that's `FormTab`, `FormAccordionItem`, `FormStep`, `FormSentence` and `When`. The schema renderer passes it for the `tab`, `accordionItem`, `step` and `sentence` keys (`SCOPED_LAYOUTS` in `schema/render/layouts.ts`) and to `When`. A layout with no scope doesn't take the prop.
- Parts that register with a container (tabs, steps) use `useOrderedRegistry` from `#components/layouts/internal/registry`. Entries stay in DOM order, so a part wrapped in `When` or a schema node still works.
- Give the layout a schema key (`DefaultLayoutProps` in `schema/core/types.ts`, `DEFAULT_LAYOUT_KEYS`, `defaultLayouts` in `schema/render/layouts.ts`) if it should exist in both modes, and add a parity fixture in `src/stories/fixtures`.
- Story title: `Forms/Layouts/<ExportName>` ([ADR 0010](../../docs/adr/0010-information-architecture.md)).

## View mode

`<Form mode="view">`, `FormReview` and `FieldPresentation mode="view"` switch fields to reading. In view mode no TanStack `FieldApi` is created for the path. `bindFields` renders `ViewField` in place of `AppField`, so a review step that shows an earlier field never takes over that field's instance, validators or meta.

- The canonical render-prop `<form.AppField name>{(field) => …}</form.AppField>` still works in view mode, but `field` is a read-only stub. It has `value`, `form`, `name`, the kit's field components and frozen clean meta. `handleChange`/`setValue` are no-ops, and it has no `store` and no array helpers. Code that needs those must not run in view mode.
- A view-mode field renders a self-contained one-item `DataList`, or a bare `DataList.Item` when it sits directly inside `FieldViewList`.
- Repeater in view mode creates no array field either.
- Fields that load data (`FormComboboxField`, `FormMultiSelectField` with `loadOptions`) make no request in view mode.

## Schema registries

Schemas are JSON. Functions live in kit registries and the schema refers to them by key, so the keys are type-checked by `kit.defineFormSchema<T, C>()(schema)`.

| Registry     | Referenced by                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`     | `{ kind: 'text' }`                                                                                                                       |
| `layouts`    | `{ layout: 'tabs' }` (defaults plus overrides; custom layouts get `node` and `form`, built-ins get only their JSON props)                |
| `loaders`    | `optionsFrom: { loader, deps }`. Combobox and multiSelect get it as `loadOptions` + `reloadOn`, other option kinds as resolved `options` |
| `validators` | `rules: [{ rule: 'custom', validator: 'myKey' }]`, built with `defineValidator`                                                          |
| `computers`  | `compute: { computer, from }`, registered in the runtime derive registry (same path as component-mode `derive`). Root-scope fields only  |
| `nodes`      | `{ custom: 'key', props }`, built with `defineCustomNode`                                                                                |

Conditions (`when`, `disabledWhen`, `readOnlyWhen`, `excludeWhen`, `requiredWhen`) use root paths everywhere, including inside repeater items. Validate untrusted JSON with `parseFormSchema(json, registryNames)`, and run the same rules on a server with `toStandardSchema(schema, { validators })` from `@mitcsutt/kiln-forms/schema`.

## Untrusted schemas

`parseFormSchema(json, registryNames, options?)` is the gate for schema JSON from a CMS, a database or a client. Run it before rendering or before `toStandardSchema` on a server. On `ok: true` it guarantees:

- every key it references is registered, and every node, rule and condition has the right shape;
- every prop key is a camelCase React prop name (`/^[a-z][a-zA-Z0-9]*$/`, so no `Style`, `HREF` or `xlink:href`). That also means `aria-*` and `data-*` attributes can't be set from a schema; give the field or layout a camelCase prop for them;
- no DOM-sink props, compared case-insensitively: `dangerouslySetInnerHTML`, `ref`, `key`, `style`, `className`, `children`, `srcDoc`, any `on…` prop, form retargeting (`form`, `action`, `formAction`, `formMethod`, …), renderer-owned props (`validators`, `listeners`, `node`, `scopeNames`), and `javascript:`/`vbscript:`/`data:` URLs in URL props (`href`, `src`, `srcSet`, `poster`, …) (`schema/core/unsafeProps.ts`);
- no field `type` of `submit`, `reset`, `button`, `image`, `file` or `hidden`, and no `pattern` prop (it would become a native `<input pattern>`, which the browser runs on every change);
- bounded size (`SCHEMA_LIMITS`: depth 64, 2000 nodes, JSON nesting 64);
- no literal `pattern` rules (in `rules` or `warnRules`). No regex heuristic catches every slow pattern, so formats like email, semver, slug or a password with lookaheads use a registered validator (`kit.extend({ validators })`, `{ rule: 'custom', validator: 'email' }`). For a trusted source only (your own CMS, fixtures) pass `{ allowPatterns: true }`. The screening that then runs is a heuristic, not a guarantee (`^` + `\d{0,10}` ×10 + `x$` gets past it): patterns are allowed if they are 200 characters or fewer, repeat no group containing a quantifier or a `|`, and use at most 2 unbounded or wide quantifiers (`*`, `+`, `{n,}`, or a range over 10 such as `{0,50}`) (`schema/core/patterns.ts`). Typed schemas written in code (`kit.defineFormSchema`) keep literal patterns.

It never throws on hostile JSON; every problem is an issue with a path. Its limits:

- with `allowPatterns`, the pattern checks are heuristics: they reject some safe patterns (the usual slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`) and can't promise every accepted one is fast. Rules cap the tested string at 256 characters (longer fails like `maxLength`), but don't run unparsed schemas on a server;
- custom node `props` are not filtered, so a custom node that spreads them onto the DOM must filter them itself;
- it checks that props are safe, not that they make sense for the component.

The renderer strips the same unsafe props (`fieldNodeProps`/`layoutNodeProps`), as defence in depth for schemas that skip the parser. `toStandardSchema` validates and returns only the fields the client validates: hidden, excluded, disabled, read-only (static or `readOnlyWhen`) and `compute` fields, and every field under a `section` with `readOnly: true` or `disabled: true`, are neither validated (a `review` subtree adds nothing; a section's `excluded` isn't inherited) nor in the success `value`, and unknown keys are dropped. Use `value` as the server payload, and recompute or reload any read-only or computed value the server needs; never trust it from the input. See design Appendix A.11.

## Stories and tests

- Stories follow the ui standard ([`packages/ui/AGENTS.md`](../ui/AGENTS.md), "Stories"): realistic invented content, sentence case, no lorem ipsum, no emoji, right in every theme and mode. Titles: `Forms/Fields/<Name>Field`, `Forms/Layouts/<ExportName>`, `Forms/Hooks/<hookName>`, `Forms/Schema/…`, and whole worked forms under `Forms/Getting started/…`. Every field, layout and form component has a `Playground` story. Every story is also a browser test in `apps/storybook` (`pnpm test:storybook`, [ADR 0018](../../docs/adr/0018-storybook-workbench.md)): it must render, its `play` function must pass, and axe must find no violations, in every theme and mode.
- Tests are behaviour, not snapshots. `vi`, `describe`, `it` and `expect` are globals. Use `must()` from `#test/must` for a node a test needs to exist, rather than a `!` assertion. Render through `renderForm` from `#test/renderForm`, and check accessibility with `expectNoAxeViolations` from `#test/a11y`.

## Lint

The root `eslint.config.js` applies `base`, `react` and `storybook` from `@mitcsutt/kiln-eslint-config` here, type-aware, with no warnings. Two forms rules are enforced there, scoped to this package: no tuple selectors (`form.Subscribe selector={(s) => [a, b]}` re-renders on every store change; select a primitive, or use `useSelector(store, sel, { compare: shallowEqual })`), and type-only imports of React, TanStack Form and kiln-ui in `schema/core`. Tests get the same exceptions as ui's (ADR 0015), and the axe helper counts as an assertion. Anything else that needs an exception gets an `eslint-disable-next-line` with a reason.

## Commands

```bash
pnpm --filter @mitcsutt/kiln-forms test            # Vitest on React 19
pnpm --filter @mitcsutt/kiln-forms test:react18    # the same suite on React 18.3
pnpm --filter @mitcsutt/kiln-forms typecheck       # tsc --noEmit, including the *.test-d.ts type tests
pnpm --filter @mitcsutt/kiln-forms lint            # eslint
pnpm --filter @mitcsutt/kiln-forms build           # dist/ for publishing (not needed in the workspace)
pnpm --filter @mitcsutt/kiln-forms check:package   # publint, attw, and ./schema in plain Node
pnpm --filter @mitcsutt/kiln-forms size            # size report against size.config.json budgets
```

## Don'ts

- No CSS, no `style`, no class names: every pixel is kiln-ui's.
- No `any`, no `@ts-ignore`. The one documented `any` is `FieldRegistry`'s (§3.2).
- Don't add runtime dependencies without an ADR. Today: `@tanstack/react-form` only. No validation library at runtime; zod is a dev dependency for tests and stories.
