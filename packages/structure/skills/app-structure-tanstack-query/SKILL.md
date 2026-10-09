---
name: app-structure-tanstack-query
description: "Use when the project depends on TanStack Query and you add or change the data layer of a React web app laid out by Kiln's structure rules: the client in src/lib and one data module per resource."
metadata:
  purpose: Where TanStack Query code goes in Kiln's app structure.
  type: composition
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with TanStack Query

Where TanStack Query code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Data recipes

- `src/lib/queryClient/` holds the `QueryClient`.
- `data/<resource>/<resource>.ts` holds the query keys, `queryOptions`, mutations and the hooks that wrap them. Child resources build their keys on the parent's.

```ts title="src/features/contacts/data/contacts/contacts.ts"
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '#lib/http'
import type { Contact } from '#features/contacts/types/Contact'

export const contactKeys = {
  all: ['contacts'] as const,
  detail: (id: string) => [...contactKeys.all, id] as const,
}

export const contactQuery = (id: string) =>
  queryOptions({
    queryKey: contactKeys.detail(id),
    queryFn: () => http.get<Contact>(`/contacts/${id}`),
  })

export function useRenameContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      http.patch(`/contacts/${id}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  })
}
```
