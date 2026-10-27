# 0045. kiln-docs: the docs site becomes a publishable foundation, with kiln's site as its first consumer

- **Status:** Accepted, amended by [0046](0046-kiln-docs-frozen-surface.md), [0047](0047-kiln-docs-smoke-and-release.md) and [0048](0048-kiln-docs-pagefind.md) (amends [0004](0004-react-18-and-19.md), [0005](0005-library-build.md), [0019](0019-docs-site.md), [0022](0022-linked-consumers.md), [0023](0023-theme-script-entry.md), [0029](0029-generated-reference-pages.md), [0034](0034-docs-on-cloudflare-workers.md) and [0038](0038-variant-blocks.md))
- **Date:** 2026-10-26

## Context

The docs site in `apps/docs` ([0019](0019-docs-site.md)) is Fumadocs core with Kiln chrome: a kiln-ui shell, a theme picker, static search, Markdown for every page, `llms.txt`, a link check and a static export on Cloudflare Workers ([0034](0034-docs-on-cloudflare-workers.md)). None of that is specific to Kiln, but all of it lives in a private app, mixed with what is: Kiln's landing page, its TSDoc and Storybook generators, its token tables and its skills build.

A second site wants the same foundation. [claude-toolbelt](https://github.com/mitcsutt/claude-toolbelt), a public kit of Claude Code plugins, needs docs at `claude-toolbelt.mitchellsutton.com`. Most of its pages would be generated from files it already has (`marketplace.json`, `plugin.json`, READMEs, `SKILL.md` files and agent files), it needs plain `.md` pages, and it wants one fixed theme with no picker. Kiln keeps its picker.

The goal is a reusable, publishable package, `@mitcsutt/kiln-docs`, extracted from `apps/docs`, with as much as possible in the package and the content owned by each site. A design was drafted with a working spike: a lab package and a toolbelt-shaped site built a 37-page static export with a fixed theme in 69 lines of site code. A consumer plan for toolbelt was drafted alongside it. A panel of six reviewers then read both. All six kept the architecture, found 17 things to fix before building and 14 worth doing, and changed the order of work. Every recommendation was accepted.

This record locks that plan in. It records the decisions and the invariants readers depend on now. The package's API isn't frozen here: route-member names, handler signatures and config keys are frozen by a later record at the end of Phase 3, before anything is published (see "What this record freezes").

The design and the consumer plan aren't in this repository. Where either differs from this record, this record wins.

## Decision

### Architecture

**`@mitcsutt/kiln-docs` is Kiln chrome for `fumadocs-core`**, the role `fumadocs-ui` plays for Tailwind sites. It ships the site config, the Next.js config wrapper, the shell, the theme modes, search, the Markdown and `llms.txt` output and the post-build tools. Each site owns its content, its `site.config.ts`, its landing page and a handful of thin route files that re-export what `createDocsSite()` returns. The site owns `app/`, so a landing page or an extra route (Kiln's future form builder, a changelog feed) is an ordinary file.

- **Name and home.** The package is `packages/docs`, published as `@mitcsutt/kiln-docs` ([0001](0001-standalone-repo-and-naming.md)), and it's a package rather than a subpath because it's a family with heavy dependencies of its own ([0039](0039-subpath-or-package.md)). Kiln's private app is renamed `@mitcsutt/kiln-docs-site`. **Its directory stays `apps/docs`**: only the package name changes, so the ESLint scopes, `.prettierignore`, the deploy paths and the `sources:` lines in every generated skill stay put.
- **Stack.** Next.js and `fumadocs-core`, as [0009](0009-docs-and-storybook.md) and [0019](0019-docs-site.md) chose. No framework switch.
- **Kiln's generators stay in Kiln's app.** The TSDoc API tables, the docs stories, the reference pages, the token tables, the design-rules page and the skills build depend on Kiln's own conventions. They move into a package only when a second React library wants them. The same rule of two applies the other way: toolbelt's own helpers (its plugin reader, a lenient frontmatter reader, a last-modified-from-git helper and a repo-link rewriter) live in toolbelt until a second site needs them.
- **Highlighting comes from kiln-ui.** Shell, JSON, YAML and diff are added to `@mitcsutt/kiln-ui/highlight`'s grammar table, as [0035](0035-code-highlighting.md) says a new language is added. kiln-docs doesn't bundle its own highlighter.
- **Docs live at `/docs`**, with the site's landing page at `/`.

### Theme modes

A site has **one fixed theme** or **a picker**, set in `site.config.ts`:

- **Fixed** (`theme: { fixed: 'flightdeck' }`): the head script is kiln-ui's own `themeScript`, so the theme is a constant and only the colour mode is read from storage. The header shows the mode toggle, or nothing with `modeToggle: false`. The site imports kiln-ui's `styles.css` and that one preset. Paper is the base stylesheet and needs no preset import.
- **Picker** (`theme: { picker, default }`): today's docs glue, generalised. **Kiln's config is `picker: THEMES, default: 'paper'`**, exactly the themes the picker offers today. Adding Harbour, or any other theme, to Kiln's picker is a separate change.

`defineSite` warns when a fixed theme is neither a built-in nor declared by the site. A check in `postbuild` fails when a configured theme's CSS didn't reach the export, and the error names the missing import (Phase 3).

### Content

- **Hand-written pages** are `content/docs/**/*.{md,mdx}` plus `meta.json`, with Fumadocs' conventions unchanged. `.md` is CommonMark and GFM with no JSX. `.mdx` is MDX.
- **Raw HTML in `.md` is shown as text.** A `.md` page that says `<name>` shows `<name>`. The conversion happens at the hast stage, so the served Markdown keeps `<name>` verbatim with no backslash, and HTML comments are dropped. There's no setting for it. Dropping raw HTML is what Fumadocs' default does, and it loses text without an error.
- **Generated pages are files**, written before `next build` by `writeGenerated()` into their own folder (below). Files go through fumadocs-mdx's whole pipeline, so they get a table of contents, search data and processed Markdown, and they can be read on disk when something goes wrong.
- **Frontmatter extends through `source.config.ts`.** The schema hook lives in the MDX config preset, because a field the collection schema doesn't declare is stripped.
- **Header facts are written into the page body** as Markdown, so the `.md` page, `llms-full.txt` and search all carry them. React page headers chosen by a frontmatter `kind` can come later.

### What 0.1.0 ships, and what waits

0.1.0 is **foundation first**, published as soon as the out-of-workspace smoke test (Phase 4) is green:

- route files carrying a version stamp, so a later `sync` can refresh the ones a site hasn't edited;
- `kiln-docs postbuild`, which moves the Markdown files into place and runs the checks (theme CSS, the peer tuple and the route stamps);
- `writeGenerated()`, with the slug precedence and the generated-pages folder below;
- a `markdown.transform` hook, so Kiln's Markdown steps run in its own order and its output stays the same;
- `kiln-docs check-links`, which needs Wrangler, so the check runs on the server the site is deployed on;
- SEO basics from `site.url`: `metadataBase`, canonical links, `sitemap.xml`, `robots.txt` and basic Open Graph tags;
- a seam for the search provider. The static Orama index stays for now. Phase 4 measures Pagefind, and the provider is chosen before 0.1.0 is published, because switching afterwards would change the API and every site's search route.

**Later minors (0.2 onwards):** `kiln-docs init` and `sync`; a Docs section on Kiln's site, a `setup-a-docs-site` agent skill and its AI tooling entry; a `ContentAdapter` interface and a dev watch; public parts under `./components` and named slots, added when a site needs one; and the move of Kiln's generated pages (below).

**Not planned:** a serializer registry for Markdown output (the transform hook covers Kiln, its only user), a built-in static server for the link check, a programmatic fumadocs-mdx run (the site's own fumadocs-mdx bin is on its PATH), and a `drop` setting for raw HTML.

### Rules the package owns

A site can't break these by accident, because they live in kiln-docs, not in site code:

- **Precedence by slug.** See the reader invariants.
- **Building the loader.** `createDocsSite()` builds the Fumadocs loader from the site's collections. There's no `lib/source.ts` in a site, so the order of sources never lives in site code.
- **The storage keys.** The package defaults are Kiln's four key names, so Kiln is right by construction. Storage is per origin, so another site using the same names is harmless.
- **An explicit page order.** The `llms.txt` index, `llms-full.txt` and the search index read pages in a defined order, not in whatever order Fumadocs stored them.

### Reader invariants

These are what readers of either site, and the sites themselves, depend on. No phase changes them, and each is pinned by a test in the phase that first touches it.

**Slug precedence.** A page's slug is its path inside its folder minus the extension, with a trailing `/index` folded into its folder as Fumadocs does, so `plugins/git.md`, `plugins/git/index.md` and `plugins/git/index.mdx` are one page. A hand-written page beats a generated page with the same slug, whatever the extension of either. `writeGenerated()` skips the generated page and reports it. Two generated pages with one slug fail the build. Tests cover both extensions on index pages and on leaf pages. (Left to Fumadocs, a hand-written `.mdx` over a generated `.md` index publishes the generated page and moves the hand-written one to `/x/index` without an error, and over a leaf page the build throws `Duplicated slugs`.)

**Kiln's saved reader state.** These five strings never change:

| String                     | What it is                                    | Where it's read today          |
| -------------------------- | --------------------------------------------- | ------------------------------ |
| `kiln-docs-theme`          | the theme a reader picked                     | `packages/docs/src/storage.ts` |
| `kiln-color-mode`          | the colour mode (kiln-ui's own key)           | `packages/docs/src/storage.ts` |
| `kiln-docs-variant-router` | the router a reader picked in variant blocks  | `packages/docs/src/storage.ts` |
| `kiln-docs-variant-data`   | the data layer a reader picked                | `packages/docs/src/storage.ts` |
| `kiln-docs`                | the Cloudflare Worker that serves Kiln's site | `apps/docs/wrangler.jsonc`     |

The variant keys follow `kiln-docs-variant-<axis>`, and the axes become site config ([0038](0038-variant-blocks.md)). A unit test pins all four keys from Phase 1. A browser check seeds them before load and asserts that they apply and persist. The Phase 1 rename leaves all five strings, and the ADR text, alone. Deriving keys from a prefix is ruled out: it would turn `kiln-color-mode` into `kiln-docs-color-mode` and reset every reader's choice.

**Peers and the peer policy.**

- kiln-docs declares the fumadocs pair it was tested with: `fumadocs-core ~16.15.18` and `fumadocs-mdx ~15.4.6` (made exact, `15.4.6`, by [0047](0047-kiln-docs-smoke-and-release.md)). A wider caret doesn't work: `fumadocs-mdx@15.4.10` needs `fumadocs-core ^16.17.8`, so `^15.4` beside `~16.15` fails a fresh npm install and gives pnpm an untested pair.
- Both are peers, installed by the site, because the code fumadocs-mdx generates resolves them from the site's own folder.
- `react` and `react-dom` are `^19.2.0`, because fumadocs-core requires it and Next.js 16 needs React 19. `next` is `^16.3.8`, and `@mitcsutt/kiln-ui` is `>=0.N.0 <1.0.0` in the style of [0017](0017-kiln-forms-port.md), where `0.N.0` is the oldest kiln-ui the Phase 4 smoke test passes against. `zod` is `^4`. `wrangler ^4` is an optional peer that `check-links` requires.
- The two fumadocs ranges are widened together, and only to a pair the smoke test has installed fresh. A fumadocs minor is a kiln-docs minor during `0.x`. `fumadocs-core`, `fumadocs-mdx` and `next` move into the workspace catalog.
- The published manifest has real ranges only: no `workspace:` or `catalog:`.

**Config loading and the Node engine.**

- The bin loads `site.config.ts` through esbuild, which fumadocs-mdx already depends on, so kiln-docs keeps the `>=22.12.0` engine of every published Kiln package. Plain Node only strips types by default from 22.18.
- A site's config is Node-loadable: it uses no tsconfig path aliases (`@/…`) and imports nothing plain Node can't load, such as kiln-ui's root entry. Kiln's `picker: THEMES` therefore reads `THEMES` from a Node-loadable kiln-ui entry, as [0023](0023-theme-script-entry.md) says Node-side tooling should, not from the root. Phase 3 picks the entry.
- In the workspace, kiln-docs' Node entries (`./config`, `./next`, `./mdx-config`) have `default` pointing at erasable `.ts` source with explicit `.ts` imports, which Node 24 loads, and no `node` condition. `kiln-dist` and `publishConfig.exports` point at `dist`, as [0022](0022-linked-consumers.md) requires. These entries import nothing from kiln-ui at runtime.
- `bin` points at a small committed JS shim in the workspace, so pnpm can link it before anything is built, and `publishConfig.bin` points at `dist`. The library build's check that `kiln-dist` matches `publishConfig.exports` extends to `bin`.

**The generated-pages folder.** Generated pages go in `.generated/pages`, and the folder is configurable. `writeGenerated()` empties that folder and nothing else. Kiln's `.generated/` already holds `api.json`, `tokens.json` and the example slices, which Kiln's build reads, so emptying all of `.generated/` would break it. Generated pages are a gitignored build intermediate. A generated page renders a source file, it doesn't copy one, so it doesn't break toolbelt's rule that a fact is written in one place.

**URLs and the Markdown formats.**

- Pages are at `/docs/<slug>`, their Markdown at `/docs/<slug>.md` and `/docs.md`, and the indexes at `/llms.txt` and `/llms-full.txt`, as [0034](0034-docs-on-cloudflare-workers.md) set up. Kiln's URLs don't change.
- **`llms.txt` keeps Kiln's format, not Fumadocs' `llms()` helper:** `# <site name>`, a `>` intro from config, a line pointing at the absolute `llms-full.txt` URL, then a `## <section>` group per top-level folder, each page as `- [<title>](<absolute URL>.md): <description>`. Section titles come from config.
- **Each page's Markdown** is `# <title>`, then `> <description>` when there is one, then `Source: <absolute URL>`, then the body. `llms-full.txt` joins the pages with `---` lines.
- The docs index page's HTML title is the site name alone, not `<name> · <name>`.

**Class names aren't API.** The chrome's CSS Module class names change whenever a module moves or is edited. Sites and their stylesheets style the chrome through the theme's tokens, and nothing may select a generated class name. Kiln's no-regression check normalises them.

### The site contract

A working site owns about twenty files, not nine. In 0.1.0 a site writes them by hand from the package README, and the Phase 4 smoke-test site is the reference. `init` writes them from 0.2. Paths are from the site's root, and `app/` and `lib/` may sit under `src/`, as Kiln's do.

| File                                                                                                                | What it holds                                                                                                                                              | Changes on upgrade                     |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `package.json`                                                                                                      | the dependencies below; `build` runs the site's generator, if it has one, then `next build`, then `kiln-docs postbuild`; `check-links`                     | ranges, per the changeset's "Upgrade:" |
| `site.config.ts`                                                                                                    | `defineSite({ … })`: name, description, URL, repository, theme, nav, footer, search, Markdown, variant axes                                                | only when a minor says so              |
| `source.config.ts`                                                                                                  | the MDX config preset, with the site's frontmatter fields                                                                                                  | only when a minor says so              |
| `next.config.mjs`                                                                                                   | `withKilnDocs(…)`                                                                                                                                          | only when a minor says so              |
| `tsconfig.json`                                                                                                     | `paths` for `@/*` and `fumadocs-mdx:collections/*` → `./.source/*`                                                                                         | no                                     |
| `lib/site.ts`                                                                                                       | `createDocsSite({ config, collections })`, which builds the loader                                                                                         | only when a minor says so              |
| `app/layout.tsx`                                                                                                    | CSS imports: kiln-ui `styles.css`, each theme preset the site offers, kiln-docs `styles.css`, then the site's own; re-exports the root layout and metadata | stamped                                |
| `app/not-found.tsx`, `app/docs/layout.tsx`, `app/docs/[[...slug]]/page.tsx`                                         | re-exports                                                                                                                                                 | stamped                                |
| `app/api/search/route.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `app/llms.mdx/[...slug]/route.ts` | re-exports, each with `export const dynamic = 'force-static'` written in the file, because Next ignores re-exported segment config                         | stamped                                |
| `app/sitemap.ts`, `app/robots.ts`                                                                                   | re-exports                                                                                                                                                 | stamped                                |
| `app/page.tsx`                                                                                                      | the landing page                                                                                                                                           | no, the site's own                     |
| `content/docs/**`                                                                                                   | hand-written pages and `meta.json`                                                                                                                         | no                                     |
| `wrangler.jsonc`, `public/_headers`                                                                                 | the Worker, with a name the site chooses (never `kiln-docs` outside Kiln), and the content types                                                           | rarely                                 |
| `.gitignore`                                                                                                        | `node_modules/`, `.next/`, `out/`, `.source/`, `.generated/pages/`, `.wrangler/`, `next-env.d.ts`                                                          | when a new build folder appears        |

The install line is `pnpm add @mitcsutt/kiln-docs @mitcsutt/kiln-ui next react react-dom fumadocs-core@~16.15.18 fumadocs-mdx@15.4.6 zod` and `pnpm add -D typescript @types/react @types/react-dom @types/node @types/mdx wrangler`. If Phase 4 finds that kiln-ui's highlighter needs `shiki` at build time, `shiki` joins the first line. `postbuild` fails when a stamped route file is missing.

### What this record freezes

**Now:** the decisions above and the reader invariants. **Before publishing:** a new record at the end of Phase 3 amends this one and freezes the route-member names, the handler signatures and the config keys. From then `defineSite` is strict: it rejects unknown keys, so a key from an older shape (a top-level `baseUrl`, say) fails loudly instead of quietly moving every URL. The API itself is documented in TSDoc and the package README, not in records.

### Kiln's no-regression check

"`out/` is byte-identical" can't be the gate, because the CSS Module class names change, and because two content collections reorder `getPages()` (and with it `llms.txt`, `llms-full.txt` and the search index) unless the package sorts pages itself. The explicit page order lands first, in its own behaviour-neutral change with a test that pins it. Then `compare-export` checks Kiln's export against `main`:

- `llms.txt`, `llms-full.txt`, every `.md` file and `_headers` byte for byte;
- each page's HTML, normalised: title, meta tags, `id`s, `href`s, visible text, `data-theme`, `data-mode` and the head script, with `-module__<hash>__` class names normalised;
- the search index, decoded and compared as a set;
- the CSS rules for each theme selector;
- a full HTML diff, as a report only.

The browser check on the five pinned strings runs beside it.

### Roadmap

Each Kiln phase is one pull request with a Conventional Commit title, and Phase N elsewhere in this record is PN here. The critical path to toolbelt's site going live is **P0 → (P1 ∥ P2) → P3 → P4 → publish → TB-site → TB-live**. TB-drift and P6 run alongside it.

| Phase        | Where                      | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TB-drift** | toolbelt, now              | Fix the stale facts its docs would publish, put `<name>` and `<persona>` in backticks, and start tagging releases.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P0**       | Kiln `docs(adr)`           | This record and the index.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P1**       | Kiln `chore(docs)`         | Rename the app to `@mitcsutt/kiln-docs-site`, nothing else. Completeness is `git grep -nE '@mitcsutt/kiln-docs([^-[:alnum:]]\|$)'` finding only the records (a `\b` grep also matches the new name). Every `pnpm --filter` in the workflows and root scripts gets `--fail-if-no-match`, because a filter that matches nothing exits 0 and would skip the deploy. A list of strings the rename must not touch (the five above and the records), and the test that pins the keys.                                                                                                                                                                                |
| **P2**       | Kiln `refactor(docs)`      | In-app seams, no package yet. The explicit page order first, then `compare-export` as specified above. Kiln's specifics move behind a `site.config.ts` with `picker: THEMES`. The `markdown.transform` hook. Kiln's generated pages stay where they are.                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P6**       | Kiln `feat(ui)`, alongside | Shell, JSON, YAML and diff highlighting in kiln-ui. Released before kiln-docs' "Version packages" pull request opens, then a new `compare-export` baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P3**       | Kiln `feat(docs)`          | `packages/docs` with `"private": true`. Slug precedence, with the loader inside `createDocsSite`; the generated-pages folder; a nav model for trees with no `"root": true` sections, with the "Kiln" and "Packages" labels as config; the theme CSS check in `postbuild`, matching `[data-theme=<name>]` with or without quotes, because the built CSS is minified; HTML as text at the hast stage; the schema hook; Kiln's `llms` format; stamped route files; SEO basics; `packages/docs/AGENTS.md` and a README; unit tests, and browser and axe tests on the chrome. Deploy paths gain `packages/docs/**`. Ends with the record that freezes the contract. |
| **P4**       | Kiln `test(docs)`          | A smoke-test site outside the workspace, shaped like a real one: landing page at `/`, docs at `/docs`, every route file, `postbuild`, a themed 404 and a green `check-links`. Variants: a picker site, one at `baseUrl: '/'`, fumadocs peers installed fresh, kiln-ui at the declared floor and the newest in range, and a run without `shiki`. It asserts the sidebar reaches every page. The job joins `ci-passed.needs`. Pagefind is measured. Then `private` comes off and the 0.1.0 `minor` changeset goes in.                                                                                                                                            |
| **publish**  | maintainer                 | [`docs/releasing.md`](../releasing.md) "Adding a new package", steps 2 to 4: the `0.0.0` placeholder, `npm trust`, two-factor, then merging "Version packages", so 0.1.0 publishes from the workflow with provenance. Never by hand.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **TB-site**  | toolbelt `site/`           | The site, against published 0.1.x and the toolbelt plan as amended below. A `docs.yml` check on pull requests and a `docs-deploy.yml` on `main`, the repo-rule updates and the upgrade plumbing.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **TB-live**  | toolbelt owner             | The first deploy creates the Worker `claude-toolbelt-docs`. Attach the domain, confirm the zone, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Done when the live URL returns 200 with `data-theme="flightdeck"`, `/docs/*.md`, `llms.txt` and `llms-full.txt` resolve, and `check-links` passes against the live URL.                                                                                                                                                                                                                                                                                                                               |
| **0.2+**     | Kiln, later minors         | `init` and `sync`; the Docs section, the skill and its AI tooling entry; `ContentAdapter` and the dev watch; `./components` and slots on demand; Kiln's generated-page move; per-page Open Graph images, redirects, a hybrid HTML mode for README-heavy sites.                                                                                                                                                                                                                                                                                                                                                                                                 |

`packages/docs` stays `"private": true` until the 0.1.0 changeset, so P3 and P4 don't trip the `Changeset` job and the release workflow never tries to publish an unregistered `0.0.0`. From the changeset on, it follows the same steps kiln-charts did.

### claude-toolbelt, the second consumer

Toolbelt's own decisions, recorded here because they set what kiln-docs must do:

- **Where and how:** an in-repo `site/` that installs the published package, with its own lockfile. Flightdeck, fixed, with the mode toggle. It pins `@mitcsutt/kiln-docs` exactly during `0.x`, and Dependabot groups kiln-docs, kiln-ui and the fumadocs peers. Each kiln-docs changeset carries an "Upgrade:" block: peer ranges, any route-file change and the exact `pnpm add` line.
- **Scope at launch:** about 45 pages. Hooks, MCP servers and `bin` commands are sections of their plugin's page, not pages of their own, because folding pages in later breaks URLs and splitting them out later only adds URLs. Skill and agent bodies are shown in full under "What Claude reads": a collapsed view can't be built in `.md`, where `<details>` shows as text. Shared rules are published with a note that they're personal rules, not repo policy.
- **URLs** follow the toolbelt plan's scheme, which has `skills/` and `agents/` segments so a skill and an agent with one name can't collide, minus the pages folded in above. TB-site commits the URL list, and its acceptance checks it.
- **Changelog:** toolbelt starts tagging releases now, and the changelog is built from tags later.
- **No hand-kept requirements matrix.** A plugin's requirements come from its README's mandatory `## Install` section, which its page already renders. No dependency graph until a manifest holds that data. The site's name and description come from `marketplace.json`.
- **CI:** a separate `docs.yml` builds and link-checks on pull requests that touch docs inputs, with path filters that reach nested files (`**.md`, `rules/**`, `config/**`, `scripts/**`), and site tests stay out of the repo's `*.test.mjs` glob. The deploy runs on `main`.
- **The Cloudflare token** is scoped to deploying Workers, the deploy job is guarded by `github.repository`, and it runs in a protected environment. A Workers token can redeploy any Worker in the account, Kiln's included, so a deploy template requires a Worker name and refuses `kiln-docs`.

**Errata to the plans.** This record supersedes the spike's API and the consumer plan's conventions where they differ: the spike's `lib/source.ts`, top-level `baseUrl`, string `repository` and string `footer` are history, not the API. Generated pages never go in `content/docs` behind `!` lines in `.gitignore`. The plan's hand-kept requirements matrix is dropped. The app directory stays `apps/docs`, and Kiln's picker is `THEMES`.

### Obligations on other records

- **[0019](0019-docs-site.md):** the chrome, theme glue, search, Markdown routes and link check move from the app into kiln-docs. The site keeps "Fumadocs core, Kiln chrome", and the theme switcher becomes the picker mode above.
- **[0029](0029-generated-reference-pages.md):** when Kiln's reference pages move (a separate pull request after P3), slug precedence replaces "gitignored in `content/docs`, with a `!` line for a hand-written page". That pull request also makes the docs tests read both folders and assert the page count, or `code-blocks` and `variants` silently check 56 pages instead of 257, and it deletes the `!` lines and their `.prettierignore` entries.
- **[0034](0034-docs-on-cloudflare-workers.md):** `markdown-files.ts` becomes `kiln-docs postbuild`, `check-links.ts` becomes `kiln-docs check-links`, and the deploy paths gain `packages/docs/**`. The Worker stays `kiln-docs`, so the custom domain needn't be attached again.
- **[0038](0038-variant-blocks.md):** the `<Variant>` mechanism moves into kiln-docs, and the axes and their labels become site config. The storage keys stay as pinned above.
- **[0005](0005-library-build.md):** kiln-docs is the first package with per-module `'use client'` directives, a `bin` and Node entries. A probe found the directive already survives the Vite 8 / Rolldown library build with `preserveModules`, so nothing needs adding to preserve it. A cheap check after the build fails when a client module's file lacks it.
- **[0022](0022-linked-consumers.md) and [0023](0023-theme-script-entry.md):** the Node entries and the `bin` resolve as set out under "Config loading". The build check extends to `bin`.
- **[0004](0004-react-18-and-19.md):** kiln-docs supports React 19 only, because Next.js 16 and fumadocs-core do. kiln-ui, kiln-forms and the other runtime packages keep React 18, and kiln-docs has no React 18 test pass.
- **[0036](0036-ai-tooling-page.md):** when the `setup-a-docs-site` skill ships (0.2), the AI tooling page lists it, as 0036's consequences already require. Adding a Docs section to Kiln's sidebar amends [0010](0010-information-architecture.md) and [0033](0033-docs-sections.md) in that pull request.
- **Stale docs move with the phase that makes them stale.** `AGENTS.md`, `CONTRIBUTING.md`, `apps/docs/README.md`, `.prettierignore`, the comment in `generate-pages.ts`, the error text in `src/skills/build.ts` and `src/test/content.ts`, this index and `ai.mdx` are what agents are routed through, so each is edited in the pull request that changes what it describes.

### Alternatives considered

| Route                                           | Why not                                                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fumadocs-ui` with a Kiln theme layer           | About 16 colour variables can't carry Kiln's 124-token theme contract, it needs Tailwind v4, and it gives up the chrome [0019](0019-docs-site.md) chose.              |
| Astro Starlight                                 | The best fit for toolbelt alone, but React chrome becomes islands ([0009](0009-docs-and-storybook.md)), and one maintainer would keep two chromes and two toolchains. |
| A `create-kiln-docs` scaffold                   | About 2,000 lines copied into each site, with no upgrade path.                                                                                                        |
| A GitHub template repo                          | No package at all, and it can't land in a subfolder of an existing repo.                                                                                              |
| One multi-tenant site                           | No package, and toolbelt's pull requests couldn't check their own site.                                                                                               |
| A docs engine that runs `app/` from the package | No extra routes, custom components need alias tricks, and running an `app/` folder from `node_modules` under pnpm and Turbopack is unsupported.                       |
| Parts only, every site writes its own glue      | About 300 lines of glue per site, and the glue drifts. The parts may still be exported later, under `./components`.                                                   |

## Consequences

- Kiln's readers see no change through the migration: the URLs, the Markdown, `llms.txt`, their saved theme, mode and stack choices, and the Worker all stay as they are, and `compare-export` plus the browser check prove it phase by phase.
- A second site needs about twenty small files, most of them re-exports, and gets the chrome, search, Markdown for agents, the checks and the deploy pattern from one dependency.
- kiln-docs' releases follow fumadocs: its minors are kiln-docs minors during `0.x`, and a wider fumadocs range needs a fresh-install run first.
- kiln-docs is React 19 only, unlike every other runtime package.
- **Rollback.** Each Kiln phase reverts cleanly, because no phase changes a URL or a stored key; revert in reverse phase order. A site's deploy rolls back with `wrangler rollback`, or a revert and a redeploy. There's no preview stage (`workers_dev` and `preview_urls` are off), so a bad deploy is fixed on the live site. A published npm version can't be taken back: it's fixed forward with a patch and the bad version is deprecated (`npm deprecate`), which is why sites pin exactly during `0.x`. Changing a storage key in any phase is ruled out, because a rollback would then reset readers' choices a second time.
- Toolbelt's helpers stay in toolbelt until a second site wants them, so kiln-docs starts small and grows by minors.
- The plans behind this record aren't in the repository. This record is what later phases follow.
