# 0047. kiln-docs is proven by an outside site before its first release

- **Status:** Accepted (amends [0045](0045-kiln-docs.md))
- **Date:** 2026-10-27

## Context

[0045](0045-kiln-docs.md)'s Phase 4 builds a site outside the workspace, shaped like a real one, before `@mitcsutt/kiln-docs` comes off `"private": true` and gets its 0.1.0 changeset. Building that site from the packed tarball found three things that worked inside the workspace and would have broken every site that installed the package:

- **There was no published build.** Every entry pointed at TypeScript source. Inside the workspace that's how [0005](0005-library-build.md) and [0045](0045-kiln-docs.md) want it, but Node won't strip types from a file under `node_modules`, so `next.config.mjs` couldn't load `@mitcsutt/kiln-docs/next`, and the bin couldn't run. 0045 already called for `kiln-dist`, `publishConfig.exports` and `publishConfig.bin` pointing at `dist`, and a check that every `'use client'` module keeps its directive. None of them existed yet.
- **The peer range let in an untested pair.** 0045 declared `fumadocs-mdx ~15.4.6` beside `fumadocs-core ~16.15.18`. The tilde allows 15.4.7 to 15.4.10, and every one of those needs `fumadocs-core ^16.17`. A fresh install resolved `fumadocs-mdx@15.4.10` with `fumadocs-core@16.15.18`: the untested pair 0045 set out to prevent.
- **The library build inlined the manifest.** `postbuild`'s peer check read kiln-docs' own `package.json` through `new URL('../../package.json', import.meta.url)`, which Vite turns into a `data:` URL that `readFileSync` can't open.

## Decision

### The published build

`packages/docs` builds with the shared library build ([0005](0005-library-build.md)), one entry per `exports` subpath with code, and the bin's CLI. Every subpath has `kiln-dist` and `publishConfig.exports` pointing at `dist` ([0022](0022-linked-consumers.md)), `publishConfig.bin` points at `dist/node/cli.js`, and `files` is `dist`. Node's built-ins stay imports, rather than Vite's browser stubs. The chrome's CSS Modules land in `dist/styles.css`, as kiln-ui's do. `scripts/check-client-directives.ts` runs after the build and fails when a client module in `dist` lost its `'use client'`. `check:package` runs publint and attw on the packed tarball, as for every published package. Inside the workspace nothing changes: the entries' `default` is still the source.

A module that reads a file next to it builds the path from `fileURLToPath(import.meta.url)`, never with `new URL('…', import.meta.url)`, which the library build inlines.

### The peer tuple is exact for fumadocs-mdx

kiln-docs declares `fumadocs-core ~16.15.18` and `fumadocs-mdx 15.4.6`, and the workspace catalog holds the same pair. The rest of 0045's peer policy stands: the two are widened together, and only to a pair the smoke test has installed fresh. The install line becomes:

```sh
pnpm add @mitcsutt/kiln-docs @mitcsutt/kiln-ui next react react-dom fumadocs-core@~16.15.18 fumadocs-mdx@15.4.6 zod
pnpm add -D typescript @types/react @types/react-dom @types/node @types/mdx wrangler
```

**`shiki` stays off it.** kiln-ui's highlighter needs Shiki at build time, but `fumadocs-core` depends on `shiki` itself, so every site already has it, and a site built without `shiki` in its own dependencies highlights its code.

**A pnpm site approves two build scripts.** pnpm fails an install whose dependencies' build scripts aren't approved: `esbuild`, which kiln-docs loads `site.config.ts` with, and `workerd`, which Wrangler runs for `check-links`. The site's `pnpm-workspace.yaml` sets `allowBuilds` for both. It joins the site contract.

### The smoke test

`packages/docs/smoke/site` is the reference site that 0045's site contract points to, and `pnpm --filter @mitcsutt/kiln-docs smoke` (`scripts/smoke.ts`) is the test. It packs the built package into a temporary folder outside the repository, so nothing resolves through the workspace, installs each variant there with no lockfile, so its peers resolve fresh from npm, runs the site's `build` (its generator, `next build`, then `kiln-docs postbuild`) and `check-links`, and then checks the export:

- a landing page at `/`, docs at `/docs`, every route file, a themed 404 page, the sitemap and `robots.txt`;
- every page's HTML and Markdown, each listed in `llms.txt` and joined into `llms-full.txt`;
- that the sidebar reaches every page, in a tree with no `"root": true` sections;
- that a hand-written page beats the generated page with its slug;
- that `<name>` in a `.md` page is text in the HTML and verbatim in the Markdown;
- the theme mode: `data-theme`, the head script, and whether the picker is rendered.

It runs in three variants: **fixed** (Flightdeck, the mode toggle, no picker; kiln-ui the newest in its range), **picker** (three themes, with kiln-ui at the floor of its range) and **no-shiki** (the install line as written). The `docs-smoke` CI job runs it on every pull request and is in `ci-passed.needs`.

0045's variant "at `baseUrl: '/'`" is dropped: [0046](0046-kiln-docs-frozen-surface.md) froze the docs at `/docs` with no key to move them, and the smoke site serves its own page at `/`. The kiln-ui floor stays `0.8.0`, the newest kiln-ui on npm, which the picker variant installs.

### Search

Phase 4 measured Pagefind against the static Orama index, through the search seam, on Kiln's 257 pages. The numbers are in the pull request that adds this record. Pagefind ranked the expected page first more often and downloads about a fifth as much for the first search, at about a second of extra build time. The static Orama index stays the only provider here. As 0045 says, the provider is chosen before 0.1.0 is published.

## Consequences

- A site installs kiln-docs from npm and builds, and CI proves it on every pull request with a fresh install. It catches a broken tarball, a peer range that lets in an untested pair, and a regression in the chrome a site sees.
- `packages/docs` is published: a pull request that changes it needs a changeset. Its first changeset is a `minor`, so "Version packages" takes it from the `0.0.0` placeholder to 0.1.0, and the maintainer publishes it as [`docs/releasing.md`](../releasing.md) "Adding a new package" sets out.
- A fumadocs-mdx patch can't reach a site without a kiln-docs release. That's the price of an exact range, and 0045 already makes a fumadocs minor a kiln-docs minor.
- The smoke test needs the npm registry, so it can fail when npm is down. It adds a CI job that builds three small sites.
