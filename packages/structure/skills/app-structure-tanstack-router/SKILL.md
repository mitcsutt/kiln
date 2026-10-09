---
name: app-structure-tanstack-router
description: Use when the project depends on TanStack Router and you add or move routes, the app shell or router setup in a React web app laid out by Kiln's structure rules.
metadata:
  purpose: Where TanStack Router code goes in Kiln's app structure.
  type: framework
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with TanStack Router

Where TanStack Router code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Routes

- File routes live in `src/routes/`, named as TanStack Router requires. Import the generated tree as `#routeTree`.
- The shell, providers and router setup live in `src/app/`. Set `router: 'tanstack'` in the preset, the default.
- A route file holds the route's config and renders a page:

```tsx title="src/routes/contacts/$contactId.tsx"
import { createFileRoute } from '@tanstack/react-router'
import { contactQuery } from '#features/contacts/data/contacts'
import { Contact } from '#features/contacts/pages/Contact'

export const Route = createFileRoute('/contacts/$contactId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(contactQuery(params.contactId)),
  component: Contact,
})
```
