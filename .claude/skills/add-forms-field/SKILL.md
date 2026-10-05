---
name: add-forms-field
description: Use when adding a new bound field to @mitcsutt/kiln-forms in this repository (packages/forms), such as a Form<Name>Field registered in the default kit. Covers the field folder, defineField and useFieldBinding, view mode, registration, the conformance suite, stories, its docs page and the changeset. Not for a custom field inside a consumer app.
---

# Add a kiln-forms field

A bound field wraps one kiln-ui `*Field`, so the field needs no CSS and no new control. If the control doesn't exist yet, add it to kiln-ui first with the `add-component` skill.

## Read first

- [`packages/forms/AGENTS.md`](../../../packages/forms/AGENTS.md): the rules, the architecture, and "Adding a field", step by step. Binding.
- `src/components/fields/FormTextField/`: the smallest complete field to copy.

## Steps

1. **Folder.** Create `packages/forms/src/components/fields/Form<Name>Field/` with `Form<Name>Field.tsx`, `Form<Name>Field.test.tsx`, `Form<Name>Field.stories.tsx` and `index.ts`.
2. **Contract.** Wrap the component in `defineField<V>()`, or `defineOptionField<B>()` and `defineOptionsField<B>()` for one or many choices. The contract decides which value paths the field can bind to.
3. **Binding.** Call `useFieldBinding` with the props, an `accepts` guard and the `empty` value. Spread `binding.fieldProps` and `binding.ref` onto the kiln-ui field, and wire `value`, `setValue` and `onBlur`.
4. **View mode.** When `binding.mode` is `'view'`, return `FieldView` with the value formatted for reading.
5. **Register.** Add the kind to `src/components/fields/defaultFields.ts`, and export `Form<Name>Field` and its props from `src/components/fields/index.ts`. The `Form` prefix is required: `src/test/exportNames.test.ts` fails if an export shares a name with kiln-ui.
6. **Schema.** If the field takes props a schema can't safely set, check the untrusted-schema rules in packages/forms/AGENTS.md.
7. **Tests.** Run `runFieldConformance` from the test harness in the field's test, as packages/forms/AGENTS.md describes, plus tests for its own behaviour.
8. **Stories.** Title `Forms/Fields/<Name>Field`, with a `Playground` story and real states, with invented content. Add a `Usage` story tagged `docs` (copy `FormTextField.stories.tsx`): a JSDoc caption, a `render` that takes no args, and imports from `@mitcsutt/kiln-forms` and `@mitcsutt/kiln-ui` only, not the story kit.
9. **Docs page.** Add `apps/docs/content/docs/forms/fields/<kebab-name>-field.mdx` (copy `text-field.mdx`) with `exports: [Form<Name>Field]`, list it in that folder's `meta.json`, show its docs stories with `<Examples of="Form<Name>Field" />`, and end the page with an `## API` section holding `<ApiTable of="Form<Name>FieldProps" />`. Update the field count on `forms/index.mdx` if it changes, then run `pnpm generate:skills`, because that page is part of the `component-mode` skill.
10. **Changeset:** `pnpm changeset`, a `minor` bump for `@mitcsutt/kiln-forms`.

## Check it

```bash
pnpm --filter @mitcsutt/kiln-forms typecheck
pnpm --filter @mitcsutt/kiln-forms test
pnpm --filter @mitcsutt/kiln-forms test:react18
pnpm --filter @mitcsutt/kiln-forms lint
pnpm --filter @mitcsutt/kiln-docs test
pnpm test:storybook
```
