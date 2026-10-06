# 0002. Port by copy, rename Press to Kiln

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The source is the `ui` and `forms` packages of the application monorepo they grew up in ([0001](0001-standalone-repo-and-naming.md)), at a pinned commit. Its history is interleaved with app work and doesn't add much to a standalone library. The design system's internal name, Press, runs through the generated class prefix, the cascade layer names and the branding. No consumer uses a published version yet, so renaming is cheap now and gets expensive later.

## Decision

- Copy the source as plain files at the pinned commit, with no `git filter-repo` and no history.
- Rename every trace of "Press" to "Kiln": the class prefix (`kiln-`), the cascade layers (`kiln.*`), custom properties, comments, docs and branding.
- Rename the `ui` component group `forms/` to `inputs/`, so that "forms" always means `kiln-forms`.
- Leave all app-specific material behind: the apps' copy, data and screens, and the patterns stories that mirrored them.

## Consequences

- The new repo's history starts clean at the import. A component's earlier history stays in the source repository.
- Fixes made in the source after the import aren't picked up automatically.
