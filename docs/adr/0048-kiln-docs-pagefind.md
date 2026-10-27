# 0048. kiln-docs searches with Pagefind by default

- **Status:** Accepted (amends [0045](0045-kiln-docs.md), [0046](0046-kiln-docs-frozen-surface.md) and [0047](0047-kiln-docs-smoke-and-release.md))
- **Date:** 2026-10-27

## Context

[0045](0045-kiln-docs.md) gave `@mitcsutt/kiln-docs` a seam for the search provider and kept the static Orama index behind it, saying the provider is chosen before 0.1.0 is published, because switching afterwards would change every site's search route. [0046](0046-kiln-docs-frozen-surface.md) froze `search.provider`, its default `'orama-static'`, and `routes.search.GET()` in `app/api/search/route.ts`. [0047](0047-kiln-docs-smoke-and-release.md) measured Pagefind against the Orama index on Kiln's 257 pages and kept Orama for the time being.

The measurement favoured Pagefind. With the same 20 Kiln queries it ranked the expected page first 14 times to Orama's 9 (both found 17 of the 20 in the first five results), and a reader's first search downloaded about 144 KB gzipped instead of the whole 718 KB index. The Orama index is fetched whole and grows with the site; Pagefind fetches only the chunks a query touches. The costs are about a second of build time after `next build`, a new dependency with a platform binary, and no index under `next dev`, since Pagefind indexes built HTML. The decision was to switch before 0.1.0, so no published site has to upgrade.

## Decision

### The provider

`SearchProvider` is `'pagefind' | 'orama-static'`, and `DEFAULT_SEARCH_PROVIDER` is `'pagefind'`. A site that wants the Orama index sets `search: { provider: 'orama-static' }`, and gets what 0045 described.

### The index

`kiln-docs postbuild` indexes the export when the provider is Pagefind, through Pagefind's Node API, before its checks. It indexes the docs pages, `out/docs.html` and `out/docs/**/*.html`, and only their `<article>` (`rootSelector`), which holds the page's title, its content and its pager: the header, sidebar and footer are the same on every page, and the landing page and 404 page aren't docs. It writes the index to `out/pagefind/`, removes Pagefind's own prebuilt search UIs from it, since the header doesn't use them, and deletes `out/api/search`. An export with no docs pages fails.

The chrome marks up the article for it. The breadcrumb is a result's `crumbs` metadata (`data-pagefind-meta`), shown under the title as the Orama results show theirs, and isn't indexed as text, so excerpts don't start with it. The "View as Markdown" link and the pager are on every page, so they aren't indexed (`data-pagefind-ignore`).

### The header

The header's search is the same dialog, with the same keyboard behaviour: <kbd>⌘K</kbd> or <kbd>Ctrl K</kbd> opens and closes it, and <kbd>Enter</kbd> opens the first result. Its client is a fumadocs-core `SearchClient`, as the Orama one is. On the first search it imports `/pagefind/pagefind.js` from the export, with the import marked for the site's bundler to leave alone, since the file isn't part of the bundle. It loads the data of the first ten pages, and lists each page with its breadcrumb, then up to three of its sections that matched, each linking to its heading, with the matches marked. Pagefind's excerpts escape the page's text as HTML, so the client reads the entities back before the header renders them as text.

### The search route under `next dev`

The route file, `app/api/search/route.ts`, its stamped template, `routes.search` and `GET(): Promise<Response>` don't change, so 0046's table stands and no site rewrites a route file. What the route serves depends on the provider:

| Provider       | `next dev`                                 | `next build`                                                   |
| -------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `pagefind`     | the Orama index, which the header searches | a 404 with a line of text, which `kiln-docs postbuild` deletes |
| `orama-static` | the Orama index, which the header searches | the Orama index, exported once                                 |

So `next dev` has search under Pagefind too, ranked by Orama: results there can differ from the built site's. The client chooses by `process.env.NODE_ENV`, which Next.js sets to `development` under `next dev`, and the route reads the same.

### The link check

`kiln-docs check-links` starts from the provider's index as well as the pages: `/pagefind/pagefind.js` and `/pagefind/pagefind-entry.json`, or `/api/search`.

### The dependency

`pagefind` `~1.5.2` is a runtime dependency of kiln-docs, which 0045 requires a record for. It installs its binary as a platform package among its optional dependencies, with no install script, so a site approves no new build script. The range is one minor, because the ranking above was measured with 1.5. A site on a platform Pagefind has no binary for sets `orama-static`.

### Proof

The smoke test ([0047](0047-kiln-docs-smoke-and-release.md)) searches each variant's build from the header in Chromium, and fails unless the first result for "helper" is `/docs/plugins/git` and the search loaded the provider's index. **fixed** and **no-shiki** run on Pagefind, and **fixed** also runs its search under `next dev`, where it reads `/api/search`. **picker** opts into `orama-static`, so the opt-in is installed and searched fresh too. The `docs-smoke` CI job installs Chromium for it. Kiln's browser check fails unless "FormSteps" finds its page first through Pagefind. `compare-export` compares the Orama index's documents when both exports have one, and the Pagefind index's page counts when both have that.

Re-measured on Kiln's export with this record's indexing (the article, the breadcrumb as metadata, the pager and Markdown link left out), through Pagefind's JS API in Chromium:

| Query set (20) | Orama static (0047) | Pagefind, as shipped |
| -------------- | ------------------- | -------------------- |
| hit@1          | 9                   | 14                   |
| hit@5          | 17                  | 17                   |
| MRR@20         | 0.62                | 0.76                 |

Neither finds `buton` (a typo for "button"), and Pagefind doesn't find "custom theme" in its first 20 results, where Orama ranks it 11th. The header's first search for "button" downloads 16 files, 209 KB raw and 147 KB gzipped: Pagefind's script, worker and 72 KB WebAssembly, one index chunk and ten result fragments. The Orama index it replaces is one 3.6 MB file, 751 KB gzipped the same way, fetched whole. The Pagefind index is 1.2 MB in 280 files, and writing it takes 0.6 to 1.3 s (three runs).

## Consequences

- A reader's first search downloads about a fifth as much on Kiln's site, and what it downloads grows with the matches, not with the site.
- Kiln's site and every new site search with Pagefind, and rank the expected page first more often on Kiln's queries. 0.1.0 ships with it, so its changeset needs no "Upgrade:" block for the switch.
- A build takes about a second longer, in `kiln-docs postbuild`. A site that runs `next build` without `postbuild` has no search, which the link check and the smoke test catch.
- Search under `next dev` is Orama's, so it can rank differently from the built site's.
- kiln-docs has a fourth runtime dependency, with a platform binary.
- `/pagefind/` is part of what a site deploys, beside `/docs`: a site's `_headers` or rules that serve the export must leave it alone.
