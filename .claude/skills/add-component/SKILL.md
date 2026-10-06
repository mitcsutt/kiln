---
name: add-component
description: Use when adding a new component to @mitcsutt/kiln-ui in this repository (packages/ui), or porting one in. Covers the component folder, CSS Module, tests, stories, the public export, its docs page and example, the changeset and the checks to run.
---

# Add a kiln-ui component

A component is done when it's exported, tested on React 18 and 19, has stories that pass in every theme and mode, and has a docs page. CI fails on each of those if it's missing, though on a component-only pull request it runs the story tests in Paper only ([ADR 0031](../../../docs/adr/0031-storybook-theme-matrix-on-theme-changes.md)), so run the other themes yourself.

## Read first

- [`DESIGN.md`](../../../DESIGN.md) §1 and §2: the principles and anti-slop rules. Binding.
- [`packages/ui/AGENTS.md`](../../../packages/ui/AGENTS.md): the rules for API, CSS, stories and tests. Binding. Copy `actions/Button` for variants, tones and component tokens, and `layout/Stack` for responsive props.

Check the catalogue in DESIGN.md §6 first: if an existing component plus a prop would do, add the prop instead.

## Steps

1. **Pick the group** from the tree in [`docs/tree.json`](../../../docs/tree.json): `layout`, `typography`, `actions`, `inputs`, `display`, `navigation`, `feedback` or `overlays`.
2. **Create the folder** `packages/ui/src/components/<group>/<Name>/` with `<Name>.tsx`, `<Name>.module.css`, `<Name>.test.tsx`, `<Name>.stories.tsx` and `index.ts`, following packages/ui/AGENTS.md. In short: `forwardRef`, typed props instead of style knobs, data attributes for variants, unlayered CSS that uses only tokens, component tokens listed in the module's header comment.
3. **Responsive props** only: register the five inputs in `src/tokens/responsive-props.css`. `utils/responsive-registry.test.ts` fails otherwise.
4. **Export it** from `packages/ui/src/index.ts` in its group's section, with its prop types.
5. **Stories:** title `UI/<Group>/<Name>`, a `Playground` story and stories for real states, with invented content. Give an interactive component a story whose `play` function drives its main interaction. The docs examples are stories too: tag each one `docs` (`tags: ['docs']`, never on the meta), give it a JSDoc caption and a `render` that takes no args, and import from `@mitcsutt/kiln-ui` only (copy `Button.stories.tsx`). `kiln/docs-story` lints them.
6. **Docs page:** it's generated from the component's TSDoc and its docs stories ([ADR 0029](../../../docs/adr/0029-generated-reference-pages.md)); add the slug to `apps/docs/content/docs/ui/<group>/meta.json` where it belongs in the sidebar. Give the component a TSDoc comment (copy `Button.tsx`): the summary, one or two sentences, is the page's description; `@remarks` is its lead in Markdown, and any `##` sections in it follow the examples; `{@link Other | text}` links to another export's page; notes for maintainers go in `@privateRemarks`. It's public copy, so DESIGN.md's copy rules apply. Defaults come from the destructured props. The API section and component tokens are added for you. `pnpm --filter @mitcsutt/kiln-docs dev` shows the page.
7. **Skills:** if the page is one an agent skill is built from (see `apps/docs/src/skills/manifest.ts`), run `pnpm generate:skills` and commit what changes.
8. **Changeset:** `pnpm changeset`, a `minor` bump for `@mitcsutt/kiln-ui` while it's below 1.0.

## Check it

```bash
pnpm --filter @mitcsutt/kiln-ui typecheck
pnpm --filter @mitcsutt/kiln-ui test
pnpm --filter @mitcsutt/kiln-ui test:react18
pnpm --filter @mitcsutt/kiln-ui lint
pnpm --filter @mitcsutt/kiln-docs test
pnpm test:storybook
pnpm size
```

Then look at it in Storybook with "All themes side by side", in light and dark. If it introduced a new idea, such as a component token pattern, note it in DESIGN.md in the same pull request.
