# 0039. A small add-on is a subpath entry; a component family is a package

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

Kiln has two ways to ship something new: a subpath entry of an existing package, such as `@mitcsutt/kiln-ui/highlight` ([0035](0035-code-highlighting.md)) or `@mitcsutt/kiln-ui/theme-script` ([0023](0023-theme-script-entry.md)), or a package of its own, such as `@mitcsutt/kiln-forms`. Until now each case was settled on its own merits. Two new component families are coming, charts ([#47](https://github.com/mitcsutt/kiln/issues/47)) and drag-and-drop with grid layouts ([#48](https://github.com/mitcsutt/kiln/issues/48)), and both could go either way, so the choice needs a rule.

What decides it:

- **One version covers every entry.** Packages version independently ([0008](0008-versioning-and-release.md)), but a subpath shares its package's version. A breaking change in any entry is a breaking release of the whole package (a minor during `0.x`, a major after), and every consumer has to read and absorb it, including those who never import that entry.
- **A dependency's majors become the package's.** `highlight` keeps Shiki an optional peer, so nobody installs it unasked, but its peer range is part of kiln-ui's contract: a new Shiki major means a new kiln-ui release. For a small entry that is rare and cheap. For a family built on an engine such as Recharts or dnd-kit, the engine's majors would set kiln-ui's breaking releases.
- **Release cadence.** A new family changes often while its API settles. kiln-ui is heading for a frozen token contract at `1.0.0`; a family still finding its shape shouldn't hold that back or churn its changelog.
- **Size doesn't decide it.** Subpaths and tree-shaking already keep an unused entry out of a consumer's bundle. The drag-and-drop spike also found the engine is about 90% of the grid feature's 40 KB (gzip), and shared by every pattern, so splitting the family itself into finer entries saves little.

## Decision

**Ship a subpath entry** of an existing package when the addition:

- extends something that package already has, the way `highlight` extends `CodeBlock`;
- has a small API that is expected to stay stable;
- brings no dependency, or only an optional peer that loads on first use;
- can release on the package's own cadence.

**Ship a new package** when the addition is a family of components, or is built on a heavy dependency of its own, or needs its own release cycle. Any one of these is enough.

A new package follows the existing pattern: `packages/<name>` publishes as `@mitcsutt/kiln-<name>`, starts at `0.1.0`, peer-depends on kiln-ui like kiln-forms does, and carries its own changesets, docs section, agent skills and size budget. Anything every theme must set, such as new tokens, stays in kiln-ui's theme contract, because the themes live there.

The rule applies inside a package too: a small add-on to a package's component is a subpath of that package.

## Consequences

- Charts ship as `@mitcsutt/kiln-charts` and drag-and-drop as `@mitcsutt/kiln-dnd`. Their tokens (the chart ramps and chrome, and any elevation token the lifted look needs) ship in a kiln-ui minor that both peer-depend on.
- A Recharts or dnd-kit major, or a breaking change in either family, is a release of that package alone. kiln-ui's consumers see nothing.
- A consumer installs one more package per family, and keeps its kiln-ui peer range satisfied.
- Existing entries already fit: `highlight` and `theme-script` are subpaths, and kiln-forms is a package. Nothing moves.
- Each new package adds a docs section, a skills manifest entry, size budgets and a CI footprint, so a borderline case leans toward a subpath unless one of the package conditions clearly holds.
