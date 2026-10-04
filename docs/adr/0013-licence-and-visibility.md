# 0013. MIT, private repo written as public

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

Kiln is both a personal toolkit and a portfolio piece. The repo starts private while it's built, but the packages are meant to be public on npm.

## Decision

- MIT licence for every package and for the repo.
- The repo stays private for now. Everything in it is written as if it were already public: no secrets, no internal URLs, no app business logic, and complete community files.
- The repo goes public alongside `1.0.0` (see 0008).
- Bundled fonts ship with their own licences (OFL), which MIT doesn't override.

## Consequences

- Making the repo public is a settings change, not a clean-up project.
