# 0032. The repository goes public before 1.0.0

- **Status:** Accepted (amends [0013](0013-licence-and-visibility.md))
- **Date:** 2026-10-06

## Context

[0013](0013-licence-and-visibility.md) kept the repository private until `1.0.0`, and [0008](0008-versioning-and-release.md) tied going public to that release. The repository already meets the bar 0013 sets for going public: it is written as if public, holds no private project details, and has complete community files. Waiting for `1.0.0` would only delay npm provenance, which [0016](0016-trusted-publishing.md) can attach only from a public repository.

## Decision

- The repository goes public once it meets the public-readiness bar in 0013, before `1.0.0`, rather than alongside `1.0.0`.
- The rest of 0013 stands: MIT licence, written as if public, and bundled fonts under their own licences.

## Consequences

- 0008's statement that `1.0.0` is when the repository goes public no longer holds. `1.0.0` still comes once the docs site is live and the token contract is frozen.
- Per 0016, releases from the release workflow carry npm provenance once the repository is public. Releases published before that have none.
