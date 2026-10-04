# 0002. Port by copy, rename Press to Kiln

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The source is `packages/ui` and `packages/forms` in `mitchell-sutton` at `origin/main` @ `0fc4294`. Its history is interleaved with app work and doesn't add much to a standalone library. The design system's internal name, Press, runs through the generated class prefix, the cascade layer names and the branding. No consumer uses a published version yet, so renaming is cheap now and gets expensive later.

## Decision

- Copy the source as plain files at the pinned commit, with no `git filter-repo` and no history.
- Rename every trace of "Press" to "Kiln": the class prefix (`kiln-`), the cascade layers (`kiln.*`), custom properties, comments, docs and branding.
- Rename the `ui` component group `forms/` to `inputs/`, so that "forms" always means `kiln-forms`.
- Leave all app-specific material behind (budget, portfolio and sweepstake copy, and the patterns stories).

## Consequences

- The new repo's history starts clean at the import.
- Anyone tracing a component's past goes to `mitchell-sutton` at `0fc4294`.
- Fixes made in the source after `0fc4294` aren't picked up automatically.
