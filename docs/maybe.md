# Maybe

Ideas that were considered and deliberately left for later. Each entry says what it is, why it waited, and what would bring it back. Move an entry into an ADR or an issue when it's picked up.

## Lint for modules placed higher than they need to be

- **From:** [ADR 0037](adr/0037-app-structure.md)
- **What:** warn when a module has only one user but lives in an owner above that user, for example a hook at a feature root that only one page imports.
- **Why it waited:** it needs the whole import graph, which would slow lint, and it would fire often on code that works. Review covers it for now.
- **Revisit if:** shared folders such as `src/components/` or feature-root `components/` start filling with single-use modules.
