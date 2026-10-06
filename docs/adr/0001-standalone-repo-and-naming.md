# 0001. Standalone repo and `@mitcsutt/kiln-*` naming

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

The design system (internally called "Press") and the form library grew up as internal packages inside an application monorepo. Projects outside that repo already use them, or plan to, and they'll back future projects too. Keeping them inside one app's monorepo couples their releases to that app and hides them from anyone else. More general utilities will be added later, so the name has to stretch beyond UI.

## Decision

- Create a standalone repository, `mitcsutt/kiln`.
- **Kiln** is the brand for the whole family. Packages publish as `@mitcsutt/kiln-<name>`: `kiln-ui`, `kiln-forms`, `kiln-eslint-config`, `kiln-prettier-config` and `kiln-tsconfig` to start, with things like `kiln-utils` later.
- Directories inside the repo use the short name (`packages/ui`), and the package name carries the brand.

## Consequences

- One brand is recognisable across npm, the docs site and the CSS (see 0002).
- The `@mitcsutt` npm scope must be owned before anything is published (see [`docs/releasing.md`](../releasing.md)).
- Existing consumers keep their in-repo copies until they migrate to the published packages.
