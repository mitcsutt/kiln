# 0031. Story tests run every theme only when themes change

- **Status:** Accepted
- **Date:** 2026-10-06

## Context

[0018](0018-storybook-workbench.md) runs the story tests on every pull request as a matrix of every built-in theme in light and dark. With six themes that is twelve jobs, about 79 billed Actions minutes per CI run, and this private repo has a limited allowance of minutes.

Most of that is repeated work. A story renders and its `play` function passes the same way in every theme, since a theme is only CSS tokens. The one result that depends on the theme is axe's colour contrast check, and that changes when a theme, a token or the Storybook setup changes, not when a component's markup or behaviour does.

## Decision

- A `storybook-matrix` job in CI diffs the pull request's merge commit against its base and picks the themes for `storybook-test`:
  - **Every built-in theme**, light and dark, when the pull request touches `packages/ui/src/themes/`, `packages/ui/src/tokens/`, `packages/ui/src/styles/`, `packages/ui/src/theme/` (the theme registry), `apps/storybook/` (including `.storybook/`) or `.github/workflows/ci.yml`.
  - **The default theme only**, light and dark, otherwise.
- The theme list and the default come from `THEMES` and `DEFAULT_THEME` in `packages/ui/src/theme/themes.ts`, which Node loads directly. A new preset needs no CI change.
- Job names keep the `Storybook tests (<theme>, <mode>)` form, so the two default-theme jobs have the same names on every pull request. The repo has no required status checks today. If some are added, require those two.

This amends 0018's decision that CI runs every theme on every pull request. The rest of 0018 stands.

## Consequences

- An everyday pull request runs two story test jobs instead of twelve, saving about 25 billed minutes per run.
- A component change that passes in the default theme but breaks contrast in a preset, through a token pairing only that preset makes low-contrast, is not caught by CI on that pull request. It is caught on the next pull request that touches themes or tokens. Authors should run the themes their change could affect locally with `STORYBOOK_THEME`.
- A new path that changes how themes render, such as a new stylesheet folder, must be added to the path list in `storybook-matrix`.
