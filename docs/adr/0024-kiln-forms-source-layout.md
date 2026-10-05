# 0024. `kiln-forms` source layout: components by group, hooks together, no `core`

- **Status:** Accepted (amends [0017](0017-kiln-forms-port.md))
- **Date:** 2026-10-05

## Context

`packages/forms/src` was ported as a copy of the source monorepo's forms package ([ADR 0002](0002-port-by-copy.md)), and kept its tree:

- `fields/`, `layouts/` and `components/` sat side by side at the top level.
- Everything else went in `core/`: the kit factory, the binding hook and its helpers, the per-form runtime, scopes, contexts and the public hooks.

The tree didn't follow the conventions the rest of Kiln uses:

- kiln-ui puts every component in `components/<group>/<Name>/` and keeps non-component code in top-level folders named for what they hold (`theme/`, `utils/`).
- `core/` wasn't a layer. It held React components (`FieldScope`, `FieldPresentation`, `FieldView`) and hooks. That made it easy to confuse with `schema/core`, the one folder where "core" means framework-free, as it does in TanStack's `form-core`.
- The main public hook, `useFieldBinding`, sat in `core/binding/` with error picking, presentation and view rendering, while the other public hooks sat in `core/hooks/`.

The package hasn't been widely adopted yet, so moving files now costs little. Consumers can't deep-import: `exports` allows only `.` and `./schema`.

## Decision

`src/` follows kiln-ui's shape:

- `components/<group>/<Name>/` holds every component, each in a folder with its test, stories and `index.ts`. There are three groups:
  - `fields`: the 28 bound fields, `FieldView`, `FieldPresentation` and `defaultFields.ts`, plus `internal/` for field-authoring plumbing.
  - `layouts`: every layout, `When` and `FieldScope`, plus `internal/`.
  - `form`: `Form`, `SubmitButton`, `ResetButton`, `ErrorSummary` and `FormStatus`.
- `hooks/` holds every public hook as a flat `useX.ts` file, behind one `index.ts`. That includes `useFieldBinding`, `useOptionMapping` and `useScopeErrors`. A hook that belongs to one component stays with it (`useFormSteps` in `FormSteps/`, `useFieldPresentation` in `FieldPresentation/`).
- `kit/` holds the kit: `createFormKit`, the default kit (`defaultKit.ts`), types, value contracts and `accepts`, contexts, `bindFields`, view-mode `AppField`, and the TanStack option mapping.
- `runtime/` holds the per-form runtime, which isn't React state: options, registrations, inactive paths, validation logic, submit, server errors, baseline, focus, messages, error picking and visibility, reveal, and label reading.
- `utils/` holds small helpers with no React in them: `env`, `paths`, `shallow`.
- `schema/core/` and `schema/render/`, `test/` and `stories/` don't change. `schema/core` keeps its name because it is exactly the React-free core, enforced by lint, a Node-environment test and `check:package`, and it is the source of the `./schema` entry.

`#` imports follow the folders (`#components/fields/FormTextField`, `#hooks/useFieldBinding`, `#kit/createFormKit`, `#runtime/formRuntime`). This amends ADR 0017's note that field files live at `fields/FormTextField/FormTextField.tsx`: they now live under `components/fields/`.

## Consequences

- No public export changes. `dist/` paths change (`dist/components/fields/FormTextField/FormTextField.js`), and `size.config.json` follows, but no consumer can import them.
- `packages/forms/AGENTS.md`, `docs/design.md` §2.2 and §18, and the `add-forms-field` skill describe the new tree. `schema/core/node.test.ts` lists the runtime modules the React-free entry may reach under their new paths.
- History follows the files (`git mv`). Branches that touch forms source need a rebase onto the new paths.
