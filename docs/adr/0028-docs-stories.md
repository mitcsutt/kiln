# 0028. Docs examples are stories tagged `docs`

- **Status:** Accepted (supersedes [0025](0025-colocated-examples.md)'s examples files and [0026](0026-docs-examples-in-storybook.md))
- **Date:** 2026-10-05

## Context

[0025](0025-colocated-examples.md) put each export's docs examples in `<Owner>.examples.tsx` beside it, and [0026](0026-docs-examples-in-storybook.md) ran those files as Storybook stories through a custom indexer. That left two files per component, written for overlapping jobs: 182 examples files with 218 examples sat beside 172 stories files with 620 stories, and 13 examples had a story of the same name beside them.

A proof of concept made the stories file the only source: a story is a docs example, its JSDoc is the caption, and 0025's slicer cuts the code shown from it. It worked, and it raised the question this record answers: which stories are docs examples.

- **Opt-out** (Storybook's documented default: `tags: ['autodocs']` on the meta or in the preview, `!autodocs` on the stories to leave off) makes every story a docs example until it's tagged. Measured across the repo, the stories the docs would show are the 218 examples, and the other 607 are workbench stories: 156 Playgrounds, states grids, kit harnesses, parity stories, `play` tests and args-driven variants. Opt-out needs 591 `!autodocs` tags, and one on every new workbench story. A workbench story that happens to pass the copy-safety lint rule would be published without anyone choosing to publish it.
- **Opt-in** needs 218 tags, each on a story that is public code. Its risk is a component with no docs examples, which a test can catch.

## Decision

**A story tagged `docs` is a docs example.** The tag goes on the story, one story at a time, never on the meta: the reader and the lint rule both fail on a meta tagged `docs`. Every other story is a workbench story and needs no tag.

**Storybook's autodocs stays separate.** The preview sets `tags: ['autodocs']`, so every component gets a Storybook Docs page showing all its stories, the workbench view. The docs site shows only the `docs` stories. A custom tag keeps the two audiences apart: reusing `autodocs` would have tied the docs site to Storybook's Docs pages.

**A docs story is code a reader can copy:**

- a JSDoc comment, its caption, in Markdown;
- a `render` that takes no args, so the code shown is the code that runs (a named function when it uses hooks);
- imports from package names only, including the package's own name (`@mitcsutt/kiln-ui` inside kiln-ui), never `#…` or relative paths;
- layout with components (`Stack`, `Inline`, `Grid`), never `style`.

`kiln/docs-story`, published as `@mitcsutt/kiln-eslint-config/docs-stories` and tested with ESLint's RuleTester, enforces all four on the story and on every top-level helper it reaches. A `Playground` is never a docs story. Workbench stories keep `#` imports, the story kits and `args`.

**Names.** Pages name a stories file's examples by `of`: the file's name beside an export (`Button`), or, under a package's `src/docs/` or `src/stories/`, the page path of its title (`Forms/Getting started/Account settings` is `forms/getting-started/account-settings`). `<Example of="Button" name="Tones" />` shows one docs story. `<Examples of="Button" />` shows them all, in file order: the first follows the page's lead without a heading, as Storybook's Docs page shows its primary story, and each later one gets its story `name`, or its export name in sentence case, as an `##` heading. A remark plugin expands `<Examples of>` before Fumadocs' own plugins, so those headings get ids and reach the table of contents, the search index and the processed Markdown, and the captions render as Markdown.

**The code shown is a slice, and the preview renders that slice.** `apps/docs/scripts/stories-examples.ts` reads a stories file as an examples file: each docs story's `render` becomes `export function <Name>()`, and the meta and workbench stories drop out. 0025's slicer then cuts each one with the helpers and imports it reaches, and each slice is typechecked on its own, as before. The generated slice carries `'use client'` and is what the live preview renders, so the preview is the code shown. No story module, story kit, `#` import or Storybook runtime reaches the docs bundle; rendering through Storybook's portable stories (`composeStories`) cost about 270 KB gzipped.

## Consequences

- A docs story is written for the docs site, so `src/test/tree.test.ts` fails when a page shows none of a file's docs stories, or names one that doesn't exist.
- Renaming a docs story changes its heading, its anchor and its Storybook URL.
- A docs story can't use `args` or decorators, and its Controls panel does nothing. Controls belong to the Playground.
- Stories are excluded from the library builds and from changesets already, so docs stories ship nothing and need no changeset.
- 0025's slicer, the slice typecheck and `<Example of name>` carry over unchanged.
