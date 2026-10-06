# 0008. Changesets, independent versions, start at 0.1.0

- **Status:** Accepted, amended by [0017](0017-kiln-forms-port.md) and [0032](0032-public-before-1-0.md)
- **Date:** 2026-10-04

## Context

Kiln publishes several packages that change at different rates. A config package might release weekly while `forms` stays stable. Consumers need trustworthy changelogs and provenance.

## Decision

- Changesets, with **independent** versions per package.
- Every PR that touches a published package carries a changeset, and CI enforces it.
- Releases go through a GitHub Actions workflow: a "Version packages" PR, then publishing to npm **with provenance**.
- Every package starts at **`0.1.0`**. `1.0.0` comes once the docs site is live and the token contract is frozen, and that is also when the repo goes public.
- The pipeline is built and dry-run verified before anything is published. The first publish is a separate, deliberate step.

## Consequences

- Breaking changes during `0.x` bump the minor version, as usual for semver.
- `kiln-forms` declares its peer range on `kiln-ui` explicitly, and Changesets keeps it updated. Amended by [0017](0017-kiln-forms-port.md): before 1.0 the range is `>=0.1.0 <1.0.0` and Changesets leaves it alone while it stays in range.
