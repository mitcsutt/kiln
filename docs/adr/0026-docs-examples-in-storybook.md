# 0026. Docs examples run as Storybook stories

- **Status:** Superseded by [0028](0028-docs-stories.md)
- **Date:** 2026-10-05

## Context

Docs examples are moving next to the code they document, one `<Owner>.examples.tsx` per public export, where each named export is one example. [0019](0019-docs-site.md) keeps them in `apps/docs/examples/`, where they are typechecked and linted but never rendered in a browser. Stories get more than that through `pnpm test:storybook`: they must render, pass axe, and do both in every built-in theme and mode ([0018](0018-storybook-workbench.md)). The examples are the code readers copy, so they should get the same checks.

An examples file is CSF without a default export. It carries no Storybook meta, so it reads as plain code on the docs site. Storybook and its Vitest addon need a default export to read a file as stories, and a title to place it in the tree.

## Decision

- **The workbench loads `packages/*/src/**/*.examples.tsx` as stories**, next to the `*.stories.tsx` globs. Each named export is a story, so every example renders and passes axe in each theme and mode of the CI matrix, like any other story.
- **One rule names every examples file** (`examplesRule`), and the indexer and `apps/storybook/tree.test.ts` both use it, so they can't disagree. Owner stories are `<Owner>.stories.tsx` beside the file or, when it isn't there, the one file of that name in the same package (forms hooks keep their stories in `src/stories/hooks`). Names match with exact case, so a title is the same on a case-insensitive file system and on Linux CI.
  - **The owner has stories:** the owner's stories title plus `/Examples`. `Button.examples.tsx` appears as `UI/Actions/Button/Examples`, and `Settings.examples.tsx` beside `docs/patterns/Settings.stories.tsx` as `UI/Patterns/Settings/Examples`. Deriving the title from the stories, rather than from the folder, keeps examples on the [0010](0010-information-architecture.md) tree wherever the source moves.
  - **Otherwise, a guide under `src/docs/`**, at any depth, is named by path, on its 0010 group and without `/Examples`: `docs/getting-started/first-form.examples.tsx` is `Forms/Getting started/First form`, like the guide stories.
  - **Otherwise, a storyless owner** takes the group and naming of its sibling components' stories, plus `/Examples`: `FormHiddenField.examples.tsx` beside `FormAmountField` (`Forms/Fields/AmountField`) is `Forms/Fields/HiddenField/Examples`, and `useScopeErrors.examples.tsx` beside `useAutosave` in `src/hooks/` is `Forms/Hooks/useScopeErrors/Examples`. Source folders such as `components/` never appear in a title.
- **One function supplies the default export** (`apps/storybook/.storybook/examples.ts`). A custom indexer adds it before Storybook indexes the file, and a Vite plugin that runs before Storybook's own adds it when the file loads, so the sidebar, the dev server and the Vitest addon see the same title. The examples files themselves never change.
- **Examples are excluded wherever stories are.** Each package's `tsconfig.build.json` leaves out `*.examples.tsx`, so no declarations are emitted for them. The Vite library build only follows the public entries, which never import an examples file. A change that only touches examples needs no changeset, like stories and tests.
- `apps/storybook/tree.test.ts` checks every indexed examples file against its rule: an owner's title must equal its stories title plus `/Examples`, a guide's must sit on a 0010 group without `/Examples` and must not take a stories file's title, and a storyless owner's must sit on a 0010 group. The docs tree test skips examples entries, because the owner's stories already map that title to a page.

## Consequences

- An example that renders with an axe violation, or that throws, fails CI in the theme and mode where it breaks.
- An examples file without owner stories still indexes, on the tree. One that lands off it, such as a storyless owner whose siblings have no stories (`<Package>/<Owner>/Examples`), or a lowercase `settings.examples.tsx` beside `Settings.stories.tsx` (a guide titled `UI/Patterns/Settings`, the stories file's own title), fails the tree test and names the file. Only an ambiguous owner, with more than one `<Owner>.stories.tsx` in the package, fails indexing.
- The story tests grow with every example. Measured locally, the run takes about 0.5 s longer per example with the default isolation, about 0.6 s per examples file, so the roughly 218 docs examples would about double each matrix job.
- The Storybook sidebar shows each owner as a folder with its stories and an `Examples` group.
