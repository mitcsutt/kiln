# 0006. Monorepo toolchain

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The source monorepo uses pnpm, Turborepo, Vitest, ESLint 9 flat config, Prettier with no config file, and syncpack. Kiln is partly a portfolio piece, so the toolchain should be current, conventional, and a credible example of a well-run library monorepo.

## Decision

| Concern | Choice |
|---|---|
| Package manager | pnpm, with **catalogs** for shared dependency versions (replaces syncpack) |
| Task runner | Turborepo, with remote cache optional |
| Tests | Vitest + Testing Library, co-located with source |
| Lint / format | ESLint (flat) + Prettier, both through Kiln's own config packages (0007) |
| Git hooks | Lefthook (format and lint staged files) |
| Commits | Conventional Commits, enforced by commitlint |
| Releases | Changesets (0008) |
| CI | GitHub Actions |
| Runtime | Node LTS, pinned in `.nvmrc` and `engines`, with `packageManager` set for Corepack |

Biome was considered and set aside: Kiln relies on the react-hooks, jsx-a11y, import-x and Storybook ESLint plugins, which Biome doesn't fully replace.

## Consequences

- Contributors need pnpm through Corepack and the pinned Node version.
- Each tool is the de facto default in its category, so a newcomer recognises the setup.
