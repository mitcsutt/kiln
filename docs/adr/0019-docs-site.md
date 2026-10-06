# 0019. How the docs site is built

- **Status:** Accepted, amended by [0025](0025-colocated-examples.md), [0029](0029-generated-reference-pages.md) and [0032](0032-docs-sections.md)
- **Date:** 2026-10-04

## Context

[0009](0009-docs-and-storybook.md) puts a Fumadocs site on Next.js in `apps/docs`, built with `kiln-ui`, with a live preview, a generated props table and copyable code on every component page. [0010](0010-information-architecture.md) gives it Storybook's tree, and [0011](0011-ai-tooling.md) asks for `llms.txt`, `llms-full.txt` and Markdown for every page, from content the agent skills can later be generated from or checked against. Building it raised questions those records leave open:

- Fumadocs' ready-made UI is styled with Tailwind, which Kiln doesn't use
- where examples live so the preview and the code shown can't drift
- how props tables are generated
- how kiln-ui, which has no `'use client'` directive, renders in the App Router
- how "no broken internal links" is checked
- where the shared tree lives ([0018](0018-storybook-workbench.md) left that to the docs site)

## Decision

**Fumadocs core, Kiln chrome**

- The site uses `fumadocs-core` (content loader, page tree, search, TOC) and `fumadocs-mdx`, and not `fumadocs-ui`. The shell, sidebar, search dialog, theme switcher, page frame and every MDX element are kiln-ui components, so the site is a real consumer of the library and every page previews the selected theme, chrome included. A few small CSS Modules in the app use tokens only.
- Code blocks are kiln-ui's `CodeBlock`, unhighlighted by design, so Fumadocs' Shiki pass is off.
- The theme switcher covers the four built-in themes and three modes. The choice is stored in the browser and applied by a head script before first paint.

**Examples, API tables and tokens come from source**

- Every live example is a typed file in `apps/docs/examples/`, named by its path. A generator indexes them, and the page renders the component and shows its source from the same file. Examples are typechecked and linted with the app.
- Props tables and signatures come from `scripts/generate-api.ts`, which reads both packages' public entries with the TypeScript checker. A property is listed when it's declared in Kiln's source; props inherited from React or Radix are summarised as "Also accepts every prop of …". Defaults come from `@default` tags or the source's "Default `x`" doc comments.
- The token reference, the starter theme on the Theming page and each component's token table are read from `paper.css`, `foundation.css` and each CSS Module's header comment. kiln-ui's contract test already keeps Paper and DESIGN.md §3.2 identical.

**Server and client**

- kiln-ui and kiln-forms use React state and context but carry no `'use client'` directive, so the docs pages are server components and everything they render from Kiln goes through the app's own client components (examples, the shell, MDX elements). The Getting started guide documents the same pattern for consumers.

**Agents and search**

- Each page's processed Markdown is served at `/docs/<page>.md` (a rewrite to a route handler) and joined into `/llms-full.txt`; `/llms.txt` lists every page. In the Markdown, examples become their source and API tables become Markdown tables, from the same generated data.
- Search is Fumadocs' static index, exported at build time and searched in the browser, so the site needs no server beyond static hosting.
- Page frontmatter carries `exports`, the public exports a page documents, so a later skills build can find the page that owns an export.

**Checks**

- `src/test/tree.test.ts` fails when a Storybook title has no page, when a component, field, layout, hook or exported function has no page, when a page names an example or API type that doesn't exist, or when the sidebar's groups differ from the shared tree.
- `docs/tree.json` is the 0010 tree. Storybook's `tree.test.ts` now reads it instead of its own copy, as 0018 proposed.
- `scripts/check-links.ts` serves the production build on a free local port, crawls it from `/` (including `llms.txt` and the Markdown routes) and fails on any non-200 page or missing `#anchor`. Fragment-only links inside live examples are illustrative and skipped. It starts and stops its own server, times out every request and the whole run, and needs no network. CI runs it as the `docs` job.

**Room for the form builder**

- The future form and schema builder (0009) is an ordinary App Router route in `apps/docs/src/app`, a client component that uses `kiln-forms` and `kiln-forms/schema` like any consumer. Nothing about it is built. The schema [playground](../../apps/docs/content/docs/forms/schema/playground.mdx), which parses JSON with `parseFormSchema` and renders it live, shows those pieces already run in the site.

**Content**

- The Theming guide builds a complete custom theme, Harbour, as an ordinary stylesheet in the docs app, to show a theme kiln-ui has never heard of working.
- Examples use invented content (a coastal ferry and bus network), following DESIGN.md's copy rules.

## Consequences

- A change to a component's props, a token or an example shows up in the docs on the next build, with nothing to update by hand. A component without a page fails the docs tests.
- Adding a page means an MDX file, its examples, and an `exports` line. A new kiln-ui export or Storybook title without a page fails CI.
- The docs build depends on both packages' source (Turborepo's `^build` dependency), so a library change invalidates the docs cache.
- Moving the tree means editing `docs/tree.json`, the docs folders and the story titles together; both apps' tests enforce it.
- Two things surfaced that belong to other packages and are left for their own pull requests: kiln-ui and kiln-forms could ship a `'use client'` directive so server components can render them directly, and `@mitcsutt/kiln-tsconfig`'s README suggests `extends: ["react", "library"]`, which drops the DOM libraries because `library` re-applies `base`'s `lib` (the docs show `react` last).
