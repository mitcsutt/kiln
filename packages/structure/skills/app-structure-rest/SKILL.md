---
name: app-structure-rest
description: "Use when the project depends on a REST API and you add or change the data layer of a React web app laid out by Kiln's structure rules: the client in src/lib and one data module per resource."
metadata:
  purpose: Where a REST API code goes in Kiln's app structure.
  type: composition
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with a REST API

Where a REST API code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Data recipes

- `src/lib/http/` holds the configured `fetch` wrapper: base URL from `src/config/`, headers, error handling.
- `data/<resource>/<resource>.ts` holds the request functions, and the mappers between the API's shapes and the app's types.

```ts title="src/features/contacts/data/contacts/contacts.ts"
import { http } from '#lib/http'
import type { Contact } from '#features/contacts/types/Contact'

interface ContactResponse {
  id: string
  full_name: string
}

const toContact = (response: ContactResponse): Contact => ({
  id: response.id,
  name: response.full_name,
})

export async function getContact(id: string): Promise<Contact> {
  return toContact(await http.get<ContactResponse>(`/contacts/${id}`))
}
```
