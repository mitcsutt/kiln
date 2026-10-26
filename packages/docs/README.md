# @mitcsutt/kiln-docs

Kiln chrome for `fumadocs-core`: the foundation of a docs site built with `@mitcsutt/kiln-ui`, with each site owning its content ([ADR 0045](../../docs/adr/0045-kiln-docs.md)). It's private while it's built, and Kiln's own site in `apps/docs` moves onto it once it holds the chrome. Nothing here is published yet.

## What it holds so far

- **`createDocsSite({ config, collections })`** (`@mitcsutt/kiln-docs`) builds the Fumadocs loader for the docs at `/docs` from the site's `fumadocs-mdx:collections/server` module: `docs`, the hand-written pages, and `generated`, the generated ones. A site has no `lib/source.ts`, so the rules below can't be broken from site code.
- **`writeGenerated(files, options)`** (`@mitcsutt/kiln-docs/generate`) writes a site's generated pages before `next build`, into `.generated/pages` by default. It empties that folder and nothing else, because `.generated/` may hold the site's other build data.
- **`defineSite(config)`** (`@mitcsutt/kiln-docs/config`) types a site's `site.config.ts`. The config is Node-loadable: no tsconfig path aliases, and nothing plain Node can't load, such as kiln-ui's root entry. `src/node/loadConfig.ts` loads it through esbuild, for the `kiln-docs` bin to come.
- **The storage keys** a reader's choices live under: `kiln-docs-theme`, `kiln-color-mode` and `kiln-docs-variant-<axis>`. They never change.

## The rules it owns

- **Precedence by slug.** A page's slug is its path inside its folder minus the extension, so `plugins/git/index.md` and `plugins/git/index.mdx` are one page. A hand-written page beats a generated one with the same slug, whatever the extension of either: `writeGenerated()` skips the generated page and reports it, and the loader leaves out any it still finds. Two files of one page in one collection fail. A hand-written `meta` file beats a generated one at its path.
- **An explicit page order.** `getPages()` lists pages by file path, compared by code unit, so `llms.txt`, `llms-full.txt` and the search index don't depend on the order Fumadocs stored the files in.
- **The peer tuple.** `fumadocs-core ~16.15.18` and `fumadocs-mdx ~15.4.6` are the pair it's tested with, and the workspace catalog holds the same pair. They're widened together, only to a pair a fresh install has passed.

## Working on it

The entries point at TypeScript source that Node runs as written: erasable syntax only, and relative imports that name their `.ts` files. `pnpm --filter @mitcsutt/kiln-docs test` runs the unit tests, including one that loads every entry in plain Node.
