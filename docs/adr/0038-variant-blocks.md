# 0038. One docs page carries stack-specific content in variant blocks

- **Status:** Accepted (amends [0020](0020-agent-skills.md))
- **Date:** 2026-10-09

## Context

[0037](0037-app-structure.md) asks for a structure page whose rules hold for every app, plus recipes that depend on the app's stack: the router (TanStack Router or the Next.js App Router) and the data layer (TanStack Query, GraphQL, REST or WebSockets). It also asks for agent skills generated from that page, split so a project loads a small core skill and an add-on only for each stack it uses.

[0020](0020-agent-skills.md) builds one skill from one or more whole pages. A page had no way to mark part of itself as belonging to one stack, so the choices were:

- a page per stack, which repeats the rules each one shares and lets them drift apart;
- one page with every stack in it, which makes every reader skip the stacks they don't use and puts all of them in one skill;
- marking the stack-specific parts on one page, and letting the site, the Markdown and the skills each decide what to show.

## Decision

**A `<Variant>` block marks content for one stack.** It names exactly one axis as a prop, with one value:

```mdx
<Variant router="next">

The shell goes in `app/_shell/`.

</Variant>
```

- The axes are `router` (`tanstack`, `next`) and `data` (`tanstack-query`, `graphql`, `rest`, `websockets`). They and their labels are one record in `apps/docs/src/lib/variants.ts`, so another axis or value is one entry.
- The tags sit on lines of their own, with blank lines around the content, as MDX needs for Markdown inside a component. A block never nests and holds no heading, because a heading inside one would reach the table of contents and the search index for every stack.
- Blocks of one axis that follow each other, with nothing but blank lines between them, are a **run**. A run covers every value of its axis exactly once, so whichever value a reader picks, something shows. `src/lib/variants.test.ts` checks every run on every page.

**On the site, a run reads as one switch.** Each block renders a kiln-ui `SegmentedControl` above its content, and only the block of the chosen value is visible, so a run looks like a package-manager tab. The choice is stored in the browser per axis (`kiln-docs-variant-router`, `kiln-docs-variant-data`), the way the docs already keep the theme, so every block on every page follows it. The server renders the first value of each axis, and a stored choice takes over after hydration. The hidden blocks are in the HTML, so the link check crawls them.

**In the Markdown, every block shows, labelled.** `toMarkdown` resolves the blocks before anything else, because they hold fenced code that its other edits split the text around. Each block becomes its content under a bold label (`**Router: Next.js**`), so the `.md` routes and `llms-full.txt` hold every stack. Fumadocs' processed Markdown indents a component's children, so the parser removes the indentation a block's lines share.

**In the skills, one page can give several skills.**

- A skill with no `addOn` in `apps/docs/src/skills/manifest.ts` is a core skill. Its pages lose every variant block, and any heading left with nothing under it. When add-ons extend it, its SKILL.md ends with a list of them, generated from the manifest.
- A skill with `addOn: { extends, variant }` holds only that value's blocks from its pages, each under the nearest heading above it, after a generated line that points to the core skill. Its frontmatter `requires` the core skill, as Intent expects of a `framework` skill, and its type is `framework` for a router and `composition` for a data library.
- References keep every block, labelled, since an agent reads one only when it needs it.
- `structure` joins the manifest's packages, so `@mitcsutt/kiln-structure` can ship skills from `packages/structure/skills/`.

**Line budgets are tested.** A skill can set `maxLines`, and `skills.test.ts` holds its SKILL.md to that, or to 500 lines as before. Every core skill built from a page with variant blocks, and every add-on, must set one, because an agent loads the core skill beside its add-ons and pays for each line. The budgets are set just above the generated output, so a page that grows past them fails until the budget is raised on purpose.

The existing drift checks are unchanged: each generated file is compared with the committed one, and a shipped file nothing generates fails.

## Consequences

- One page holds every stack, and its shared rules exist once. A reader sees only the stack they chose, and keeps that choice from page to page.
- An agent loads the core skill and the add-ons for its project's stacks, not every recipe.
- Adding a value to an axis means adding a block of it to every run of that axis on every page, or the run test fails.
- A block can't hold a heading, so stack-specific sections are written as paragraphs, lists and code under a shared heading.
- With storage blocked, or before hydration, the site shows each axis's first value.
