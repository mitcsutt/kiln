---
name: app-structure-websockets
description: "Use when the project depends on WebSockets or server-sent events and you add or change the data layer of a React web app laid out by Kiln's structure rules: the client in src/lib and one data module per resource."
metadata:
  purpose: Where WebSockets or server-sent events code goes in Kiln's app structure.
  type: composition
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with WebSockets or server-sent events

Where WebSockets or server-sent events code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Data recipes

- `src/lib/socket/` holds the connection: one socket for the app, opened by the shell.
- `data/<resource>/<resource>.ts` holds the message types and the subscription hook. Live updates write into the same cache keys as the resource's queries.

```ts title="src/features/contacts/data/contactActivity/contactActivity.ts"
import { useEffect } from 'react'
import { socket } from '#lib/socket'

export interface ContactActivityMessage {
  contactId: string
  kind: 'opened' | 'replied'
}

export function useContactActivity(onMessage: (message: ContactActivityMessage) => void) {
  useEffect(() => socket.subscribe('contact-activity', onMessage), [onMessage])
}
```
