---
'@mitcsutt/kiln-structure': minor
---

New package: Kiln's recommended structure for React web apps, with an ESLint preset that enforces it. `kilnStructure({ features })` from `@mitcsutt/kiln-structure/eslint` checks owners, each feature's public surface, a declared one-way feature graph, routes and `app/` as the composition root, a private test-support kind, `#` and `./` imports, narrow `index.ts` files, module folders and kind names, named exports and Fast Refresh boundaries. It supports TanStack Router and the Next.js App Router. ESLint is an optional peer dependency.
