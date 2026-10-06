# 0031. The docs sidebar shows one package at a time

- **Status:** Accepted (amends [0019](0019-docs-site.md))
- **Date:** 2026-10-06

## Context

[0010](0010-information-architecture.md) gives the docs site and Storybook one nested tree: UI, Forms and Tooling at the top, then groups, then pages. [0019](0019-docs-site.md) rendered that whole tree in the sidebar, one package after another. UI alone has eleven groups, so on a Forms page the Forms label started below the fold at 1440×900, under every UI group. The pager walked the same single tree, so it crossed packages: UI's last page linked on to the Forms overview, and Forms' last page to Tooling. The topbar already switched between the three packages, but only from `md`, so on a phone the only way to another package was the full tree in the sheet.

## Decision

- `ui`, `forms` and `tooling` are Fumadocs root folders (`"root": true` in each `meta.json`). The tree, the URLs, `docs/tree.json`, search and `llms.txt` are unchanged.
- The sidebar shows only the section that holds the current page: its own pages, then its groups. The topbar names the section, so the sidebar doesn't repeat it. Outside a section (the Introduction), the sidebar lists the three sections, each with the short `description` from its `meta.json`.
- The phone sheet opens with the same section switcher as the topbar, so every section is one tap away below `md`.
- Breadcrumbs start with the section ("UI / Inputs"). Fumadocs' `includeRoot` names that crumb after the whole tree rather than the section, so `src/lib/pageTree.ts` adds the section's name itself.
- The pager stays inside a section. Fumadocs' `findNeighbour` separates roots but leaves a root's own index page out of it, so from the Forms overview it would still go back to UI. `src/lib/pageTree.ts` walks the section including its index instead.
- `src/test/tree.test.ts` fails when a top-level folder isn't a root, and `src/lib/pageTree.test.ts` covers the section, crumb and pager rules.

## Consequences

- A package's sidebar holds only its own pages, so each one fits its context, and the pager never leaves the package.
- Moving between packages is always a topbar or sheet link, never a scroll through another package's tree.
- A new top-level docs folder has to be a root too, or the tree test fails.
- The sidebar and Storybook still share the 0010 tree. The sidebar shows one branch of it at a time.
