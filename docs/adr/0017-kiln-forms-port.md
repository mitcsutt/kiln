# 0017. How `kiln-forms` was ported: names, entries and checks

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

[0002](0002-port-by-copy.md), [0004](0004-react-18-and-19.md), [0005](0005-library-build.md) and [0012](0012-design-standards.md) set the shape of the `forms` port, and [0015](0015-kiln-ui-port.md) recorded how `ui` was done. The target state leaves one decision open: the source exports names that `ui` also exports, and a consumer who imports both packages mustn't be able to auto-import the wrong one. Porting also raised questions those records don't answer:

- how the React-free `./schema` entry is built and proven React-free
- where the source's design spec goes, since its section numbers are cited throughout the code
- how source written against a looser lint config meets Kiln's (0007, 0014)

## Decision

**Name collisions**

- The overlap was wider than the eight names the target state lists. 19 of the 28 bound fields shared a name with a `ui` export (`TextField`, `TextareaField`, `SelectField`, `CheckboxField`, `PasswordField`, `NumberField`, `AmountField`, `OneTimeCodeField`, `ColorField`, `SwitchField`, `DateRangeField`, `SegmentedField`, `ChoiceCardsField`, `CheckboxGroupField`, `SliderField`, `RatingField`, `ComboboxField`, `TagsField`, `FileField`), each with its `…Props` type, and so did the `FieldLayout` type.
- **Every bound field is exported with a `Form` prefix**: `FormTextField`, `FormAmountField`, … `FormHiddenField`, with `FormTextFieldProps` and so on. That's all 28, not only the 19 that collide, so there's one rule: kiln-ui's `TextField` is the unbound control, kiln-forms' `FormTextField` is the bound field. It matches the layouts, which already read `FormGrid`, `FormSection`, `FormSteps`. The field folders and files carry the same names (`fields/FormTextField/FormTextField.tsx`), as `ui`'s do.
- **Inside a kit, names don't change.** The shorthand is derived from the field's kind, so it stays `form.TextField`, `field.TextField` and schema `{ kind: 'text' }`, with a display name of `Bound(TextField)`. A name on a form object can't be auto-imported, so it can't collide. Field stories use the shorthand as their title (`Forms/Fields/TextField`).
- **`FieldLayout` is kiln-ui's.** The two declarations were identical, so `forms` imports `ui`'s type and no longer exports its own.
- `src/test/exportNames.test.ts` fails if any export of `.` or `./schema`, value or type, shares a name with a kiln-ui export. It reads both packages' public surface with the TypeScript checker.
- Prefixing only the colliding names was rejected: half the fields would carry a prefix, and the next field kiln-ui gains would bring the problem back. Dropping the top-level field exports was rejected because custom kits and field wrappers import them. Renaming kiln-ui's exports was out of scope: its names belong to the unbound controls, which are usable without forms.

**Entries and build**

- `defineLibraryConfig` (0015) takes a list of entries. `forms` builds `src/index.ts` and `src/schema/core/index.ts`, so `./schema` is a real module in `dist/` with no CSS and `sideEffects: false`.
- `@mitcsutt/kiln-ui` is a peer dependency declared as `workspace:^`, which packs as `^0.1.0` (0008).
- `check:package` runs publint and attw as `ui`'s does, then `scripts/check-schema-entry.ts`. That unpacks the tarball into an empty project, checks that `react` can't be imported there, then parses a schema and validates a payload through `@mitcsutt/kiln-forms/schema`. That's the plain-Node proof. `schema/core/node.test.ts`, from the source, checks the same from source files.
- Size budgets in `size.config.json`: forms core (`createFormKit`, `Form`, `SubmitButton`), a single field, isolated to its own import graph, the default kit, the `./schema` entry, and everything.
- The React 18 fixture (0015) also provides `@tanstack/react-form`, which requires React itself.

**Standards and lint**

- The source `packages/forms/CLAUDE.md` is ported as `packages/forms/AGENTS.md`, a binding standard (0012), with `CLAUDE.md` as a symlink. The source design spec, which the code cites as `§n` and `A.n`, is ported as `packages/forms/docs/design.md` with its section numbers kept and everything app-specific removed.
- The source's forms lint rules move to the root config, scoped to `packages/forms` (0014): no tuple selectors, and type-only imports of React, TanStack Form and kiln-ui in `schema/core`.
- Tests get `ui`'s exceptions (0015), for the same reason: the hidden inputs, `name`s and `aria-describedby` targets they assert on are what a form submits and announces. `vitest/expect-expect` also accepts `expectNoAxeViolations`, and `vitest/valid-title` accepts a variable title for tests generated from data.
- Every other finding was fixed in the code. Async `act` callbacks with nothing to await became `act(() => Promise.resolve())`, as in `ui`, and `!` assertions in tests became `must()`. The remaining one-off exceptions carry an `eslint-disable-next-line` with the reason. The notable ones: the fields' `binding.value ?? ''` guards (a null value passes their `accepts` guard, and an untyped schema can leave a default out), TanStack typing field names and validators as `any`, and the validation logic returning what TanStack's `void`-typed `runValidation` returns, which TanStack uses.
- The a11y-tree helper, which imports Testing Library, moved from `schema/render` to `test/`.

**Content**

- The recipes that mirrored the source apps (new transaction, sweepstake entry, contact) weren't ported. The remaining recipes live under `Forms/Getting started`. The schema fixtures and every story were rewritten with invented, generic content. Internal QA and review labels were replaced with descriptions of the behaviour they guard.
- Story titles follow 0010: `Forms/Fields/<Name>Field`, `Forms/Layouts/<ExportName>`, `Forms/Schema/…`. The form components (`Form`, `SubmitButton`, `ResetButton`, `ErrorSummary`, `FormStatus`) sit under `Forms/Layouts`, beside the layouts that hold them. Schema mode treats them as content nodes beside layout nodes.

## Consequences

- A consumer who imports both packages gets one candidate for every name. Code moving from the source's `@repo/forms` renames its field imports (`TextField` → `FormTextField`). Code that only uses the kit shorthand doesn't change.
- A new bound field must be named `Form<Name>`, and a new kiln-ui export that matches a kiln-forms name fails the forms test suite. That's how the collision rule stays enforced as both packages grow.
- The `./schema` guarantee is checked twice: from source on every test run, and from the built tarball by `check:package` in CI.
