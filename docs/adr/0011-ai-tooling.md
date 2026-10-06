# 0011. Agent skills via TanStack Intent, plus llms.txt

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

Coding agents in consumer projects use libraries better when the library tells them how. TanStack's approach ships versioned skills inside the npm package, and the `@tanstack/intent` CLI wires them into the consumer's agent setup. The monorepo Kiln was extracted from already loaded skills this way.

## Decision

- **Consumer skills:** `kiln-ui` and `kiln-forms` each ship skills (SKILL.md + references) in the layout TanStack Intent discovers. They're versioned with the code they describe.
- **One source of truth:** skill content is generated from, or checked against, the docs site content, and CI fails on drift.
- **Docs for agents:** the docs site serves `llms.txt`, `llms-full.txt` and a raw markdown version of every page.
- **Contributor tooling:** the repo has a root `AGENTS.md` (with `CLAUDE.md` as a symlink) and project skills for adding a component, a theme preset and a forms field.
- A custom Kiln CLI and an MCP server are deferred. Intent already covers installation.

## Consequences

- Publishing a package also publishes its guidance, so agents read guidance that matches the installed version.
- Docs changes can break the skills build, which is deliberate.
