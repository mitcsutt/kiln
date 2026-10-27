# 0046. kiln-docs freezes its public surface before it's published

- **Status:** Accepted (amends [0023](0023-theme-script-entry.md) and [0045](0045-kiln-docs.md))
- **Date:** 2026-10-27

## Context

[0045](0045-kiln-docs.md) locked the plan for `@mitcsutt/kiln-docs` and its reader invariants, but left the API open while Phase 3 built it: "a new record at the end of Phase 3 amends this one and freezes the route-member names, the handler signatures and the config keys. From then `defineSite` is strict." Phase 3 is done. The package is in `packages/docs`, Kiln's site runs on it, and `compare-export` showed that Kiln's readers see no change. Two things Phase 3 found also differ from 0045's text and are recorded here: the layouts and pages are entries of their own, and Kiln's picker names are written out.

What's frozen is what a site writes against: its route files, its `site.config.ts` and its `source.config.ts`. A site pins kiln-docs exactly during `0.x`, but every pin is upgraded sooner or later, and these are what an upgrade must not break silently.

## Decision

### The entries and their exports

`packages/docs/src/entries.test.ts` pins the runtime exports of every entry but the stylesheet, so adding or removing one fails a test. The types are part of the surface too.

| Entry                                                                | Exports                                                                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@mitcsutt/kiln-docs`                                                | `createDocsSite`, `DOCS_BASE_URL`, `THEME_STORAGE_KEY`, `MODE_STORAGE_KEY`, `variantStorageKey`; types `DocsCollection`, `DocsSiteOptions`                                             |
| `@mitcsutt/kiln-docs/config`                                         | `defineSite`, `DEFAULT_CONTENT_DIR`, `DEFAULT_GENERATED_DIR`, `DEFAULT_SEARCH_PROVIDER`, `SEARCH_ROUTE`; types `SiteConfig`, `SiteLink`, `FixedTheme`, `ThemePicker`, `SearchProvider` |
| `@mitcsutt/kiln-docs/mdx-config`                                     | `defineDocsCollections`, `defineDocsConfig`, `rehypeRawAsText`, `remarkCodeTitle`                                                                                                      |
| `@mitcsutt/kiln-docs/next`                                           | `withKilnDocs`, `MARKDOWN_REWRITES`                                                                                                                                                    |
| `@mitcsutt/kiln-docs/generate`                                       | `writeGenerated`                                                                                                                                                                       |
| `@mitcsutt/kiln-docs/variants`                                       | `createVariants`, `dedent`                                                                                                                                                             |
| `./layout`, `./docs-layout`, `./docs-page`, `./not-found`, `./shell` | `createRootLayout`, `createDocsLayout`, `createDocsPage`, `NotFound` and `Shell`, one per entry                                                                                        |
| `./styles.css`                                                       | the chrome's stylesheet                                                                                                                                                                |
| `kiln-docs` (bin)                                                    | `postbuild` and `check-links`                                                                                                                                                          |

### Per-segment route entries

0045 said a site's route files "re-export what `createDocsSite()` returns". The layouts and pages aren't on it: each is its own entry, a factory the route file calls with `site` (`createRootLayout(site)`, `createDocsLayout(site)`, `createDocsPage(site, { components })`), and `NotFound` and `Shell` are components. Next.js loads CSS by route segment, the root layout's first, so when each segment imports only its own UI, the chrome's CSS and a site's MDX components' CSS load in the order the segments nest. When one module graph held them all, the bundler's CSS chunks decided which of two equally specific rules won, and moving the chrome reshuffled them: Kiln's specimen margins flipped. `createDocsSite()` keeps the data, the metadata and the route handlers, and holds no React. A site's own MDX components go to `createDocsPage`, in the page's route file, for the same reason.

### Route members and handler signatures

`createDocsSite({ config, collections, markdown })` takes the site's config, its `fumadocs-mdx:collections/server` module as `{ docs, generated? }`, and `markdown.transform`, `(processed: string, page) => string`. It returns:

| Member                                                                                       | What it is, and the route file that uses it                                                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `config`, `source`, `markdown`                                                               | the config, the Fumadocs loader and the site's Markdown, for a site's own code                         |
| `metadata`                                                                                   | `app/layout.tsx`: Next.js `Metadata`                                                                   |
| `generateStaticParams()`                                                                     | `app/docs/[[...slug]]/page.tsx`: `{ slug?: string[] }[]`                                               |
| `generateMetadata({ params })`                                                               | `app/docs/[[...slug]]/page.tsx`: `params: Promise<{ slug?: string[] }>`, returning `Promise<Metadata>` |
| `routes.search.GET()`                                                                        | `app/api/search/route.ts`: `Promise<Response>`                                                         |
| `routes.llmsTxt.GET()`, `routes.llmsFullTxt.GET()`                                           | `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts`: a `Response`, or a promise of one            |
| `routes.pageMarkdown.GET(request, { params })`, `routes.pageMarkdown.generateStaticParams()` | `app/llms.mdx/[...slug]/route.ts`: `params: Promise<{ slug: string[] }>`; `{ slug: string[] }[]`       |
| `routes.sitemap()`, `routes.robots()`                                                        | `app/sitemap.ts` and `app/robots.ts`: `MetadataRoute.Sitemap` and `MetadataRoute.Robots`               |

The route files are the stamped templates in `src/node/routes.ts`, and each route handler file keeps `export const dynamic = 'force-static'` written in it.

### The config keys

```text
defineSite({
  name, description, url,
  repository: { url },
  theme: { fixed, modeToggle?, custom? } | { picker, default, custom? },
  nav: { sections: [{ href, label }], labels?: { pages?, sections? } },
  footer: { text, links: [{ href, label }] },
  search: { placeholder, provider? },
  notFound: { description, action: { href, label } },
  markdown: { llms: { intro, sections } },
  variants: { [axis]: { label, values } },
})
```

`defineSite` is strict. A key that isn't above, at any depth, throws, naming every such key by its path (`nav.sections[0].icon`), so a key from an older shape, such as the spike's top-level `baseUrl`, fails loudly instead of quietly being ignored. `theme` is one mode or the other: setting both `fixed` and `picker` throws, a picker's `default` must be one of `picker`, and a picker's keys on a fixed theme (or the other way round) are unknown keys. The record keys (`markdown.llms.sections`, `variants.<axis>.values`) take any names. TypeScript checks the value types; `defineSite` checks the keys at runtime, because a generic `const` parameter gets no excess-property check.

### The fixed theme

`theme: { fixed: 'flightdeck' }` is 0045's fixed mode. The head script is kiln-ui's `themeScript(theme, 'system', { storageKey: 'kiln-color-mode' })` from `@mitcsutt/kiln-ui/theme-script`, so the theme is a constant and only the mode is read, under Kiln's key. The header shows `ModeToggle` alone, or nothing with `modeToggle: false`, and a `kiln-docs-theme` left in storage is ignored. `postbuild`'s theme CSS check covers the fixed theme like a picker's.

`defineSite` warns when a theme is neither kiln-ui's nor listed in `theme.custom`, the site's own themes that its stylesheets define. 0045 said this of a fixed theme, and it applies to a picker's themes too, since an unstyled theme renders as Paper either way. The Node entries import nothing from kiln-ui at runtime, so kiln-ui's built-in names are written out in `packages/docs/src/themes.ts`, and a test pins them to `THEMES`.

### Kiln's picker names are written out

0045 said Kiln's `picker: THEMES` reads `THEMES` from a Node-loadable kiln-ui entry, and that Phase 3 picks the entry. kiln-ui exports `THEMES` only from its root entry, which imports CSS, and adding an entry is a kiln-ui change outside this work. So Kiln's `site.config.ts` lists the six names, and `apps/docs/src/test/site-config.test.ts` fails when they differ from `THEMES`. If kiln-ui later exports `THEMES` from a Node-loadable entry, the config can import it then.

### The theme-script entry inside the workspace

[0023](0023-theme-script-entry.md) gave `@mitcsutt/kiln-ui/theme-script` a `node` condition that points at `dist/`, and said nothing in the workspace imports the subpath by name. kiln-docs now does, and Next.js's server build and Vitest both resolve with `node`, so inside the workspace they'd need kiln-ui built first. Kiln's `next.config.js` (`turbopack.resolveAlias`) and kiln-docs' `vitest.config.ts` (`resolve.alias`) point the subpath at kiln-ui's source, as every other kiln-ui entry resolves in the workspace. An installed site gets `dist/` either way.

### Browser checks in CI

`pnpm check:browser` (`apps/docs/scripts/check-browser.ts`) runs on every pull request, in the `docs-browser` job. It drives Kiln's built site in Chromium: the sidebar and its labels, the breadcrumb, search, the picker and its stored pick, the phone navigation, and a reader's saved state, with the four keys seeded before load and checked before the first paint and after a reload. axe checks the landing page's chrome, the docs index, a component page and the 404 page in light and dark. These are the checks Phase 3 drove by hand, now committed.

### What isn't frozen

The chrome's markup and its CSS Module class names (which were never API), anything under `src/` that no entry exports, the wording of errors and warnings, and the bin's output. They change in any release.

### Changing the surface

Adding an optional config key, an export or a route member is a minor release. Renaming or removing any of the above, changing a handler's signature, or making an optional key required is breaking, and needs a record that amends this one. During `0.x` a breaking change is a minor release with an "Upgrade:" block in its changeset, as 0045 set out.

## Consequences

- A site's route files, `site.config.ts` and `source.config.ts` keep working across kiln-docs releases until a record says otherwise, and a config with a stray or misspelt key fails at build time with the key named.
- toolbelt's site can be built against this surface: `theme: { fixed: 'flightdeck' }`, the per-segment route entries, and no picker.
- Kiln's picker, its storage keys and its readers' saved state are unchanged, and CI now checks them on every pull request.
- A new key costs two edits, the interface and the shape `defineSite` checks, and `packages/docs/AGENTS.md` says so.
- The browser checks add a CI job that builds Kiln's docs site a second time.
