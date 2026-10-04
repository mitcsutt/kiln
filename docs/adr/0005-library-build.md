# 0005. Vite library mode for every runtime package

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

`ui` already builds with Vite library mode (preserveModules ESM, a single stylesheet, CSS Modules with generated class names), followed by `tsc` for declarations. `forms` has no build at all. tsdown is the other obvious choice, but its CSS Modules support is less mature than Vite's, and CSS Modules are central to `ui`.

## Decision

- `ui` and `forms` share one Vite library-mode setup: ESM only, `preserveModules`, declarations and source maps.
- The build is tuned for consumers:
  - per-module output so bundlers can tree-shake
  - an accurate `sideEffects`
  - an `exports` map that resolves correctly under `bundler` and `node16`
  - the base stylesheet and each theme preset as separate CSS files
- Correctness is proven by tools, not by trust: `publint`, `@arethetypeswrong/cli`, and a size report with budgets, all in CI.
- Inside the workspace, packages are consumed as source (Just-in-Time). Built `dist/` is used only for publishing.

## Consequences

- Development needs no prebuild, and builds exist only for publish and CI checks.
- The implementer is free to improve on the source build (for example faster declaration generation, or per-component CSS if measurements justify it) as long as the criteria in `target-state.md` hold.
