# 0012. Carry over the design and authoring standards

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The source has a strong, explicit standard. `DESIGN.md` sets the principles, the "not AI slop" rules, the token contract and the theme catalogue. `packages/ui/CLAUDE.md` sets the component rules:
- `forwardRef`, compatible with React 18 and 19
- unlayered CSS Modules that use only tokens
- variants through data attributes, and typed props instead of style knobs

`packages/forms/CLAUDE.md` has the forms rules: no CSS, a field conformance suite, and a React-free `schema/core`. Several of these rules are enforced by tests.

## Decision

- Port all three as **binding standards**, updated for Kiln naming and the new theme names (`paper`, `monograph`, `ledger`, `fiesta`).
- Every rule the source enforces with a lint rule or test is enforced the same way in Kiln.
- Where a standard references an app (budget, portfolio, sweepstake), rewrite the example generically.

## Consequences

- New components and themes have a clear, reviewable bar.
- Changing a standard means editing the document and its enforcement together.
