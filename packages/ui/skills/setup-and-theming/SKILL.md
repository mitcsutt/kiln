---
name: setup-and-theming
description: "Use when installing @mitcsutt/kiln-ui in a React app: loading its stylesheet, wrapping the app in ThemeProvider, choosing Paper or a preset theme (Monograph, Ledger, Fiesta, Flightdeck, Riso) and a colour mode, setting the theme before first paint with themeScript under SSR or the Next.js App Router, and passing router links through asChild."
metadata:
  purpose: Install kiln-ui, load its CSS, and apply a built-in theme and colour mode correctly on the client and the server.
  type: lifecycle
  library: "@mitcsutt/kiln-ui"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/ui/index.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/paper.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/monograph.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/ledger.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/fiesta.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/flightdeck.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/themes/riso.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Set up kiln-ui and pick a theme

Install kiln-ui, load its CSS, and apply a built-in theme and colour mode correctly on the client and the server.

`@mitcsutt/kiln-ui` is one set of React components whose whole look (colour, type, shape, density, depth and motion) comes from a theme applied at the root. Behaviour comes from [Radix](https://www.radix-ui.com/primitives) primitives; the look is plain CSS and design tokens. There's no Tailwind and no CSS-in-JS to configure.

## Install

```sh
pnpm add @mitcsutt/kiln-ui
```

React and React DOM 18.3 or 19 are peer dependencies. The only runtime dependency is `radix-ui`.

## Load the stylesheet

Import the stylesheet once, at your app's root, before your own CSS:

```tsx title="src/main.tsx"
import '@mitcsutt/kiln-ui/styles.css'
```

`styles.css` holds the fonts, the tokens, a small reset, the default Paper theme and every component's styles. Kiln's global tokens and reset sit in cascade layers (`kiln.reset`, `kiln.tokens`, `kiln.themes`), so your own CSS always wins over them without a specificity fight.

## Wrap the app in a theme

```tsx title="src/App.tsx"
import { ThemeProvider } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

export function App({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

With no `theme`, you get **Paper**, the neutral default. `ThemeProvider` writes `data-theme` and `data-mode` to `<html>`, remembers the reader's light or dark choice, and gives every component below it `useTheme()`. To use a preset, import its stylesheet and name it:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/flightdeck.css'

;<ThemeProvider theme="flightdeck" defaultMode="dark">
  …
</ThemeProvider>
```

Presets are separate files, so an app pays only for the ones it imports. [Themes](references/paper.md) shows all six, and [Theming](https://kiln.mitchellsutton.com/docs/ui/foundations/theming) shows how to write your own.

## Compose a screen

Screens are built from layout primitives and typed props, never utility classes or inline styles: `gap={5}` is a step on the theme's space scale, `width="text"` is a reading measure, `tone="critical"` is an intent.

```tsx
import { Button, Container, Heading, Inline, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Section space={7}>
      <Container width="text">
        <Stack gap={5}>
          <Heading level={1} size="display-sm">
            Maps for people in a hurry
          </Heading>
          <Text size="lg" tone="muted">
            Every ferry, tram and night bus in the bay, on one timetable that fits in a pocket.
          </Text>
          <Inline gap={3}>
            <Button>Download the timetable</Button>
            <Button variant="outline" tone="neutral">
              See the route map
            </Button>
          </Inline>
        </Stack>
      </Container>
    </Section>
  )
}
```

If a screen needs CSS beyond a layout wrapper or two, Kiln is probably missing a prop or a component. Read [Layout](https://kiln.mitchellsutton.com/docs/ui/layout/stack) for the primitives that replace most custom CSS.

## Render on the server without a flash

When the page is server-rendered, the stored colour mode is only known in the browser. Put `themeScript` in the document `<head>` so the right theme and mode are set before the first paint. Give it the same theme and `defaultMode` as the provider; a reader's stored choice still wins.

```tsx title="app/layout.tsx"
import '@mitcsutt/kiln-ui/styles.css'
import { themeScript } from '@mitcsutt/kiln-ui'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript('paper', 'system') }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` on `<html>` is needed because the script changes its attributes before React hydrates.

### Name the storage key

The reader's mode is stored in `localStorage` under `kiln-color-mode`. Every app on one origin shares that key, so a choice made in one carries into the next. Give each app its own key with `storageKey`, or keep a key the app already used so returning readers keep their choice. Pass the same key to `themeScript`:

```tsx
;<ThemeProvider theme="ledger" defaultMode="light" storageKey="acme:color-mode">
  …
</ThemeProvider>

themeScript('ledger', 'light', { storageKey: 'acme:color-mode' })
```

### Without server rendering

A single-page app served from a static `index.html` still paints before React loads, so it needs the script too. Generate it at build time instead of copying it by hand. The config runs in Node, so import `themeScript` from `@mitcsutt/kiln-ui/theme-script`: that entry has no React and nothing else to load. With Vite, a small plugin in the config puts it at the top of `<head>`:

```ts title="vite.config.ts"
import { themeScript } from '@mitcsutt/kiln-ui/theme-script'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'kiln-theme-script',
      transformIndexHtml: () => [
        {
          tag: 'script',
          children: themeScript('ledger', 'light', { storageKey: 'acme:color-mode' }),
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
})
```

### With the Next.js App Router

Kiln's components use React state and context, so they render in client components. Put `ThemeProvider` in a file marked `'use client'`, and import Kiln components from client components:

```tsx title="app/providers.tsx"
'use client'

import { ThemeProvider } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

Server components can still render those client components and pass them data. These docs are built that way: the pages are server components, and everything they show from Kiln is rendered by client components.

## Links and routers

Anything that navigates takes `asChild`, so your router's link keeps doing the routing while Kiln does the styling:

```tsx
import NextLink from 'next/link'
import { Button, Link, NavLinks } from '@mitcsutt/kiln-ui'

;<>
  <Button asChild>
    <NextLink href="/work">See the work</NextLink>
  </Button>

  <NavLinks.Item asChild active={pathname === '/work'}>
    <NextLink href="/work">Work</NextLink>
  </NavLinks.Item>
</>
```

## What every component promises

- It forwards its ref and spreads native props onto its root, so `id`, `aria-*`, `data-*` and event handlers work as on the element it renders.
- It works on React 18 and 19, and renders on the server.
- It's keyboard- and screen-reader-complete. Anything with focus management (menus, dialogs, tabs, selects) is built on Radix.
- It respects `prefers-reduced-motion`: every duration collapses to almost nothing.
- It accepts `className` and `style` as an escape hatch, not a workflow.

## Joining class names

`cx` joins class names and skips the falsy ones, for the rare `className` you add to a Kiln component or your own element:

```tsx
import { cx } from '@mitcsutt/kiln-ui'

;<Card className={cx(styles.route, isSaved && styles.saved)}>…</Card>
```

```ts
declare function cx(...classes: (string | false | null | undefined)[]): string
```

Merges class names, filtering falsy values.

## Next

- [Tokens](https://kiln.mitchellsutton.com/docs/ui/foundations/tokens): the contract every theme fills in.
- [Theming](https://kiln.mitchellsutton.com/docs/ui/foundations/theming): write a theme of your own.
- [Button](https://kiln.mitchellsutton.com/docs/ui/actions/button): the reference component.
- [AI tooling](https://kiln.mitchellsutton.com/docs/tooling/ai): the agent skills that ship with kiln-ui, and how to load them into your coding agent.

## References

Read a reference when its description matches the task:

- [Paper](references/paper.md): The neutral default. An office that prints for everyone, with white sheets on grey stock, blue-black ink as the accent and Golos Text for type.
- [Monograph](references/monograph.md): A scholarly monograph read under a desk lamp at night. Blue slate, one ember accent, a big serif display. Dark-first.
- [Ledger](references/ledger.md): An accountant's columnar pad. A white sheet ruled in green, banknote-green actions, accounting red, and figures set condensed instead of in a monospace.
- [Fiesta](references/fiesta.md): A screen-printed festival poster. Flat spot inks, hard offsets, condensed signage numerals and springy motion.
- [Flightdeck](references/flightdeck.md): A glass-cockpit flight display. Cyan for what you set, a reverse-video box for what you select, and green, amber and red for status, set in B612. Dark-first.
- [Riso](references/riso.md): A two-drum risograph zine. Fluorescent pink and blue on white stock, screen tints instead of borders, and Shantell Sans.
