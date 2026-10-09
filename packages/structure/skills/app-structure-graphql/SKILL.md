---
name: app-structure-graphql
description: "Use when the project depends on GraphQL and you add or change the data layer of a React web app laid out by Kiln's structure rules: the client in src/lib and one data module per resource."
metadata:
  purpose: Where GraphQL code goes in Kiln's app structure.
  type: composition
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with GraphQL

Where GraphQL code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Data recipes

- `src/lib/graphql/` holds the client. Codegen writes to one output folder inside it, which the preset leaves alone (`__generated__/`).
- `data/<resource>/<resource>.ts` holds typed `graphql()` documents and the hooks that run them. No `.graphql` files, and no `.graphql.ts` suffix.

```ts title="src/features/contacts/data/contacts/contacts.ts"
import { graphql } from '#lib/graphql/__generated__'

export const contactDocument = graphql(`
  query Contact($id: ID!) {
    contact(id: $id) {
      id
      name
    }
  }
`)
```
