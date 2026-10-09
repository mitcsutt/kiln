# @mitcsutt/kiln-structure

## 0.1.0

### Minor Changes

- fed3991: New package: Kiln's recommended structure for React web apps, with an ESLint preset that enforces it. `kilnStructure({ features })` from `@mitcsutt/kiln-structure/eslint` checks owners, each feature's public surface, a declared one-way feature graph, routes and `app/` as the composition root, a private test-support kind, `#` and `./` imports, narrow `index.ts` files, module folders and kind names, named exports and Fast Refresh boundaries. It supports TanStack Router and the Next.js App Router. ESLint is an optional peer dependency.
- fed3991: Ship agent skills for TanStack Intent: `app-structure`, the structure rules and the ESLint preset, plus one add-on per stack, `app-structure-tanstack-router`, `app-structure-nextjs`, `app-structure-tanstack-query`, `app-structure-graphql`, `app-structure-rest` and `app-structure-websockets`. They're generated from the Project structure docs page.
