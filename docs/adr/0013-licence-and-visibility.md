# 0013. MIT licence, written as public from the start

- **Status:** Accepted, amended by [0032](0032-public-before-1-0.md)
- **Date:** 2026-10-04

## Context

Kiln's packages are published publicly on npm and meant for anyone to use. The repository was built in private, but it is meant to be open source, and a repository that has to be cleaned up before it can go public tends to stay private.

## Decision

- MIT licence for every package and for the repo.
- The repository stays private for now. Everything in it is written as if it were already public: no secrets, no internal URLs, no app business logic or private project details, and complete community files (README, contributing guide, code of conduct, security policy, issue and pull request templates).
- The repository goes public alongside `1.0.0` (see [0008](0008-versioning-and-release.md)).
- Bundled fonts ship with their own licences (OFL), which MIT doesn't override.

## Consequences

- Making the repo public is a settings change, not a clean-up project.
- Contributors keep the bar after the repo is public: [CONTRIBUTING.md](../../CONTRIBUTING.md) and `AGENTS.md` both state it.
