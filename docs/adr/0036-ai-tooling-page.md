# 0036. AI tooling gets a docs page under Tooling

- **Status:** Accepted (amends [0010](0010-information-architecture.md))
- **Date:** 2026-10-08

## Context

[0011](0011-ai-tooling.md) and [0020](0020-agent-skills.md) ship agent skills in `kiln-ui` and `kiln-forms`, serve `llms.txt`, `llms-full.txt` and a Markdown version of every page, and keep contributor skills in `.claude/skills/`. All of it works, and the skills are in the published packages, but the docs described it in one short paragraph at the end of the Introduction. Readers couldn't find which skills exist or how to load them.

The docs tests put every page under UI, Forms or Tooling ([0033](0033-docs-sections.md)), and the sidebar's groups must match the [0010](0010-information-architecture.md) tree in `docs/tree.json`.

## Decision

- Tooling gets a fourth page, **AI tooling** (`/docs/tooling/ai`). It lists every skill in both packages, explains loading them with TanStack Intent (`install`, `list`, `load`), covers the Markdown endpoints, and points contributors at `AGENTS.md`, `.claude/skills/` and `pnpm generate:skills`.
- It sits under Tooling because it's cross-package setup, like the configs, and not part of either package's API. `docs/tree.json` adds it to `Tooling`, so 0010's tree becomes `Tooling/ ESLint config  Prettier config  TSConfig  AI tooling`. Storybook gets no page for it: its tree test needs every title to sit inside the tree, not every node to have a title.
- The Introduction, Tooling's overview, and both packages' getting-started pages link to it.

## Consequences

- A new skill or a change to the Intent workflow means updating this page by hand. The skill tables are prose, not generated from `apps/docs/src/skills/manifest.ts`.
- The getting-started pages are skill sources, so the link is also in the `setup-and-theming` and `component-mode` skills after `pnpm generate:skills`.
