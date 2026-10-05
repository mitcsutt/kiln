# 0026. Docs examples run as Storybook stories

- **Status:** Accepted (amends [0018](0018-storybook-workbench.md))
- **Date:** 2026-10-05

## Context

Docs examples are moving next to the code they document, one `<Owner>.examples.tsx` per public export, where each named export is one example. [0019](0019-docs-site.md) keeps them in `apps/docs/examples/`, where they are typechecked and linted but never rendered in a browser. Stories get more than that through `pnpm test:storybook`: they must render, pass axe, and do both in every built-in theme and mode ([0018](0018-storybook-workbench.md)). The examples are the code readers copy, so they should get the same checks.

An examples file is CSF without a default export. It carries no Storybook meta, so it reads as plain code on the docs site. Storybook and its Vitest addon need a default export to read a file as stories, and a title to place it in the tree.

## Decision

- **The workbench loads `packages/*/src/**/*.examples.tsx` as stories**, next to the `*.stories.tsx` globs. Each named export is a story, so every example renders and passes axe in each theme and mode of the CI matrix, like any other story.
- **The title is the owner's stories title plus `/Examples`.** `Button.examples.tsx` takes the title of `Button.stories.tsx` (`UI/Actions/Button`) and appears as `UI/Actions/Button/Examples`. The owner's stories file sits beside the examples file or, when it doesn't, is the one file of that name in the same package (forms hooks keep their stories in `src/stories/hooks`). Deriving the title from the stories, rather than from the folder, keeps examples on the 0010 tree wherever the source moves.
- **One function supplies the default export** (`apps/storybook/.storybook/examples.ts`). A custom indexer adds it before Storybook indexes the file, and a Vite plugin that runs before Storybook's own adds it when the file loads, so the sidebar, the dev server and the Vitest addon see the same title. The examples files themselves never change.
- **Examples are excluded wherever stories are.** Each package's `tsconfig.build.json` leaves out `*.examples.tsx`, so no declarations are emitted for them. The Vite library build only follows the public entries, which never import an examples file. A change that only touches examples needs no changeset, like stories and tests.
- `apps/storybook/tree.test.ts` checks that every examples file is indexed under its owner's title. The docs tree test skips examples entries, because the owner's stories already map that title to a page.

## Consequences

- An example that renders with an axe violation, or that throws, fails CI in the theme and mode where it breaks.
- An examples file without owner stories still indexes, on the [0010](0010-information-architecture.md) tree. A guide topic, `src/docs/<guide>/<topic>.examples.tsx`, appears as `<Package>/<Guide>/<Topic>`, like the guide stories (`Forms/Getting started/First form`). Any other file takes the group and naming of its sibling components' stories, plus `/Examples`: `FormHiddenField.examples.tsx` beside `FormAmountField` (`Forms/Fields/AmountField`) appears as `Forms/Fields/HiddenField/Examples`. Source folders such as `components/` never appear in a title. Only an ambiguous owner, with more than one `<Owner>.stories.tsx` in the package, fails indexing and names the file.
- The story tests grow with every example. Measured locally, the run takes about 0.5 s longer per example with the default isolation, about 0.6 s per examples file, so the roughly 218 docs examples would about double each matrix job.
- The Storybook sidebar shows each owner as a folder with its stories and an `Examples` group.
