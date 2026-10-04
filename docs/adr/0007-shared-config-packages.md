# 0007. Shared ESLint, Prettier and TS config packages

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The same ESLint, Prettier and TypeScript configs get copied, with drift, into every repo (`mitchell-sutton`, `world-cup-draw`, `markr`, …). A survey of those repos found:

- **Consistent:**
  - flat config, `@eslint/js` + typescript-eslint
  - react-hooks and react-refresh for React code
  - TS `strict`, `noUncheckedIndexedAccess`, Bundler resolution, ES2022
  - lint rules that enforce import boundaries in the newer repos
- **Inconsistent:**
  - quotes, semicolons and print width
  - strictness (`recommended` in some repos, `strict` in others; hook problems as warnings in some, errors in others)

Kiln is the natural home for a single canonical version.

## Decision

Publish three config packages, and use them in Kiln itself first:

- **`@mitcsutt/kiln-eslint-config`**: flat config, composable exports (at least `base`, `react`, `storybook`):
  - `@eslint/js` recommended, plus typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` (type-aware)
  - `consistent-type-imports`
  - react-hooks as **errors**, react-refresh, and `eslint-plugin-jsx-a11y`
  - `eslint-plugin-import-x`, available for boundary rules
  - Vitest and Testing Library rules for test files, and the Storybook plugin for stories
  - `eslint-config-prettier` last
  - `reportUnusedDisableDirectives` set to error
  - Rules stay at their intended severity. No "only warn" downgrades.
- **`@mitcsutt/kiln-prettier-config`**: single quotes, no semicolons, trailing commas `all`, `printWidth: 100`, 2-space indent. It matches how the ported source is already written.
- **`@mitcsutt/kiln-tsconfig`**: presets `base` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`, Bundler, ES2022), `react`, `library` (declarations) and `app`.

A shared Vitest preset is deferred, because test setup varies too much between projects.

## Consequences

- Other repos can replace their copied configs with one dependency each, which is a separate migration.
- Rule changes are semver changes to the config packages: a new error-level rule is a minor or major bump, never a patch.
