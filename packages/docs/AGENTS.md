# packages/docs: `@mitcsutt/kiln-docs`

Kiln chrome for `fumadocs-core`: the foundation of a docs site, with each site owning its content. Read [ADR 0045](../../docs/adr/0045-kiln-docs.md) first, for the design and the invariants readers depend on, then [ADR 0046](../../docs/adr/0046-kiln-docs-frozen-surface.md), for the public surface that's frozen. [`README.md`](README.md) describes the API and the site contract. Kiln's own site in [`apps/docs`](../../apps/docs) is its first consumer. The root [`DESIGN.md`](../../DESIGN.md) applies to the chrome, and this file is a binding standard ([ADR 0012](../../docs/adr/0012-design-standards.md)).

## Rules

- **The frozen surface changes only with an ADR.** The entries, their exports, the route members, the handler signatures and the `SiteConfig` keys are listed in ADR 0046, and `src/entries.test.ts` pins every export. Adding an optional config key is a minor change. Renaming or removing anything is breaking, and needs a record that amends 0046.
- **A reader's saved state never changes.** `kiln-docs-theme`, `kiln-color-mode` and `kiln-docs-variant-<axis>` are in `src/storage.ts`, pinned by `src/storage.test.ts`, by `src/theme.test.ts` and by Kiln's browser check. Never rename one, derive them from a prefix, or add a migration that rewrites one.
- **`defineSite` is strict.** A new `SiteConfig` key goes into the interface and into `SITE_SHAPE` (or the theme shapes) in `src/config.ts` together, with a case in `src/config.test.ts`. A key left out of the shape fails every site that sets it.
- **The Node entries load in plain Node.** `./config`, `./generate`, `./mdx-config`, `./next`, `./variants` and everything under `src/node/` are erasable TypeScript with relative imports that name their `.ts` files, and they import nothing from kiln-ui at runtime: kiln-ui's built-in theme names are written out in `src/themes.ts`, pinned to `THEMES` by a test. `tsconfig.node.json` checks them, and `src/entries.test.ts` loads them in Node.
- **Each route segment imports only its own UI.** The layouts and pages are separate entries (`./layout`, `./docs-layout`, `./docs-page`, `./not-found`, `./shell`), so Next.js loads their CSS in the order the segments nest. Don't import the chrome from `src/site.ts` or the root entry.
- **The chrome styles itself through theme tokens.** Colours, fonts, radii and shadows come from the theme's tokens in its CSS Modules, so any theme works, a site's own included. Its generated class names aren't API: nothing may select them.
- **Client modules say so.** A component with state, effects or context starts with `'use client'`, one module at a time. Server code (`src/site.ts`, the layouts) imports no client-only API.
- **Both theme modes stay working.** A fixed theme's head script is kiln-ui's own `themeScript`, and a picker's is `docsThemeScript` in `src/theme.ts`. A change to either is covered by `src/theme.test.ts` and `src/components/shell/ThemeSwitcher.test.tsx`, and Kiln's picker by its browser check.
- **Kiln's readers notice nothing.** A change to the chrome, the Markdown or the routes is checked against Kiln's site: `compare-export` against the base branch's export, and `pnpm check:browser` ([`apps/docs/README.md`](../../apps/docs/README.md)).
- **It's published.** A pull request that changes it adds a changeset, and one that changes a peer range, a route file or the install line gives it an "Upgrade:" block (ADR 0045). Its first changeset is the 0.1.0 `minor`.
- **An outside site proves it.** `pnpm --filter @mitcsutt/kiln-docs smoke` installs the packed package into `smoke/site` outside the workspace, with its peers resolved fresh, and builds and checks it (ADR 0047). A change to the site contract changes `smoke/site` too: it's the reference site the README points to.
- **The fumadocs peers are a tested pair.** `fumadocs-core ~16.15.18` with `fumadocs-mdx 15.4.6`, exact, because every later fumadocs-mdx needs a newer fumadocs-core. Widen them together, in the catalog too, and only to a pair the smoke test has installed fresh (ADR 0047).
- **A module never reads a file through `new URL('…', import.meta.url)`.** The library build inlines it as a `data:` URL. Build the path from `fileURLToPath(import.meta.url)`.
- React 19 only (ADR 0045): there's no React 18 pass.

## Layout

```
src/
  config.ts       SiteConfig, defineSite (strict) and the config defaults: the ./config entry
  site.ts         createDocsSite: the loader, the Markdown and the route handlers: the root entry
  layouts/        the per-segment entries: root, docs, page, notFound, shell
  components/     the chrome (shell/, page/, mdx/), the theme provider and the config context
  theme.ts        the head scripts for a fixed theme and a picker
  storage.ts      the storage keys, which never change
  themes.ts       kiln-ui's built-in theme names, for the Node entries
  slugs.ts, pageOrder.ts, pageTree.ts, nav.ts, markdown.ts, seo.ts, search.ts
                  slug precedence, the page order, the sidebar model, the Markdown and llms.txt,
                  SEO and search
  mdx-config.ts, mdx/   the MDX preset and its remark and rehype plugins
  generate.ts, next.ts, variants.ts   the ./generate, ./next and ./variants entries
  node/           the bin: postbuild, check-links, the config loader, the route templates and
                  the theme CSS and peer checks
bin/kiln-docs.js  the workspace shim for the bin
scripts/          the 'use client' check after the build, and the smoke test
smoke/site/       the smoke test's site, the reference for a site's files; smoke/variants/ goes over it
```

## Commands

```bash
pnpm --filter @mitcsutt/kiln-docs test           # unit tests, the Node entries in plain Node included
pnpm --filter @mitcsutt/kiln-docs typecheck      # the chrome, then the Node entries with erasableSyntaxOnly
pnpm --filter @mitcsutt/kiln-docs lint
pnpm --filter @mitcsutt/kiln-docs build          # dist/, which publishing ships, then the 'use client' check
pnpm --filter @mitcsutt/kiln-docs check:package  # publint and attw on the packed tarball
pnpm --filter @mitcsutt/kiln-docs smoke          # after build: the packed package in an outside site, three variants
pnpm check:browser                               # Kiln's site built, then the chrome in Chromium, with axe
```

## Don'ts

- No `any`, no `@ts-ignore`.
- Don't add a runtime dependency without an ADR. Today: `esbuild`, `node-html-parser`, `pagefind` (ADR 0048) and `unist-util-visit`; everything else is a peer.
- Don't import kiln-ui's root entry from a Node entry, or from server code: it imports CSS and creates React context.
