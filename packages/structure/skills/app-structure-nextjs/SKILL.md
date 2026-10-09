---
name: app-structure-nextjs
description: Use when the project depends on the Next.js App Router and you add or move routes, the app shell or router setup in a React web app laid out by Kiln's structure rules.
metadata:
  purpose: Where the Next.js App Router code goes in Kiln's app structure.
  type: framework
  library: "@mitcsutt/kiln-structure"
requires:
  - app-structure
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# App structure with the Next.js App Router

Where the Next.js App Router code goes in Kiln's app structure.

Adds to the `app-structure` skill, which holds the rules for every stack: load it first.

## Routes

- The App Router owns `src/app/`: route files there follow Next.js and export a default. Set `router: 'next'` in the preset.
- The shell, providers and their stores go in `src/app/_shell/`, a private folder the router ignores. Import it as `#app/_shell/components/AppShell`.
- A `page.tsx` reads params, then renders a page module:

```tsx title="src/app/contacts/[contactId]/page.tsx"
import { Contact } from '#features/contacts/pages/Contact'

export default async function ContactPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params
  return <Contact contactId={contactId} />
}
```
