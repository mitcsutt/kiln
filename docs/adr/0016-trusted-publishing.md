# 0016. Trusted publishing, switched on by the owner

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

[0008](0008-versioning-and-release.md) sets Changesets, a "Version packages" pull request, and publishing to npm with provenance from GitHub Actions. It leaves open how the workflow authenticates to npm, how it gets provenance, and what keeps the first merge to `main` from publishing.

Changesets 3 publishes with `pnpm publish` and a fixed set of flags, so it can't pass `--provenance`. pnpm 12 attaches provenance by itself only when it publishes through npm trusted publishing (OIDC) from a public repository. npm sets up trusted publishing per package, after the package exists, and generates no provenance from a private repository.

## Decision

- **Trusted publishing only.** The release workflow publishes through npm trusted publishing. No npm token is stored in the repository. This is also how provenance gets attached, since a token-based publish through Changesets gets none.
- **The workflow follows the Changesets split-job layout.** Separate jobs select the mode, version, pack and publish. Only the publish job gets `id-token: write`, and it runs in an `npm` environment that can require approval. Jobs that can write skip the dependency cache.
- **Publishing is off until the owner switches it on.** The pack and publish jobs run only when the repository variable `NPM_PUBLISH_ENABLED` is `true`. Until then, merging to `main` can open version pull requests but can't publish.
- **Test-only changes don't need a changeset.** Changesets ignores test files (`test/`, `*.test.*`) and stories (`*.stories.*`) when deciding whether a package changed. Every other change to a published package needs one, or an empty changeset.

## Consequences

- The first version of each new package is published by hand (without provenance), because trusted publishing can only be set up once the package exists. [`docs/releasing.md`](../releasing.md) lists the steps.
- Provenance needs a public repository, but [0013](0013-licence-and-visibility.md) keeps the repository private until `1.0.0`. Publishing `0.x` with provenance means making the repository public first. That's left to the owner.
- If Changesets later forwards publish flags, or pnpm reads provenance from config, a token-based fallback becomes possible and would need a new record.
