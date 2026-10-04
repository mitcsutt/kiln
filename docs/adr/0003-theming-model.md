# 0003. Token contract, `paper` default, opt-in presets

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

In the source, a theme is pure CSS: tokens scoped by `[data-theme]` and `[data-mode]`, with three themes (`studio`, `ledger`, `fiesta`) bundled into the one stylesheet, each named after the app it served. A public library needs a neutral starting point. It should keep those themes as proof of how far the system stretches, without forcing them on every consumer.

## Decision

- The **token contract** is the public theming API. Any consumer can write a complete theme as a single CSS file against it.
- `kiln-ui` ships one default theme, **`paper`**. It's new, neutral and polished, and it's active when no theme is set.
- It also ships three **presets** as opt-in stylesheet imports:
  - **`monograph`**, ported from source `studio`
  - **`ledger`**, ported from source `ledger`
  - **`fiesta`**, ported from source `fiesta`
- The runtime (`ThemeProvider`, `themeScript`, …) only sets attributes. It accepts preset names and consumer-defined names alike.

## Consequences

- Consumers who don't import a preset don't pay for it.
- The token contract becomes a semver surface: renaming or removing a token is a breaking change.
- The docs site has to document the contract well enough to write a theme from scratch.
- `paper` has to meet the same `DESIGN.md` standard as the presets (see 0012). "Neutral" doesn't mean generic.
