# 0034. The docs site is a static export on Cloudflare Workers

- **Status:** Accepted (supersedes the hosting line of [0009](0009-docs-and-storybook.md), amends [0019](0019-docs-site.md))
- **Date:** 2026-10-08

## Context

[0009](0009-docs-and-storybook.md) planned to host the docs site on Vercel at `kiln.mitchellsutton.com`, with deploying left as a separate step. Nothing had been deployed. Vercel turned out to be more platform than the site needs. The domain is already on Cloudflare, and the site was already almost static: [0019](0019-docs-site.md) exports the search index at build time and marks every route handler `force-static`. Only two rewrites needed a server: `/docs.md` and `/docs/<page>.md`, which pointed at the Markdown route handler.

Two ways to run the Next.js site on Cloudflare Workers were considered:

- **A static export served as static assets.** `next build` with `output: 'export'` writes every page, the Markdown, `llms.txt`, `llms-full.txt` and the search index to `out/`, and a Worker with no script serves them. Requests to static assets are free and unlimited.
- **OpenNext (`@opennextjs/cloudflare`).** It runs the Next.js server in a Worker, so rewrites and server rendering keep working. It adds an adapter, a server bundle under the Worker size limit, and Worker invocations that count against the free plan's daily request limit. None of the site's features needs a server, so all of that would buy nothing.

## Decision

- **Static export.** `next build` exports the site to `apps/docs/out` (`output: 'export'`). `next dev` isn't an export, and keeps the rewrites below, so local development is unchanged.
- **Markdown as files.** An export can't rewrite. The Markdown route handler moves to `/llms.mdx/<page>.md`, with the index at `/llms.mdx/index.md`. The `.md` keeps a page's file apart from the folder its child pages are written to. `scripts/markdown-files.ts` runs after `next build` and moves those files to `/docs/<page>.md` and `/docs.md`, the URLs readers and `llms.txt` use. `next dev` rewrites the same URLs to the route handler.
- **Links to files skip Next's router.** An MDX link to a file such as `/llms.txt` is a plain `<a>`. A static export has no page payload to prefetch for it, so `NextLink` would request one and get a 404.
- **Cloudflare Workers static assets.** `apps/docs/wrangler.jsonc` declares the Worker `kiln-docs` with `out/` as its assets, `auto-trailing-slash` HTML handling and the export's `404.html` as the not-found page. It declares no routes. The custom domain, the API token and the GitHub secrets are managed outside this repository. `workers_dev` and `preview_urls` are off, so a deploy needs no workers.dev subdomain, and the custom domain is the only public address. The first deploy creates the Worker with no route, and the domain is attached to it afterwards. `public/_headers` sets the Markdown content type for `llms.txt` and `llms-full.txt`, JSON for the search index, and long-lived caching for `/_next/static/`.
- **Deployed from `main`.** `.github/workflows/docs-deploy.yml` builds the site and runs `wrangler deploy` on every push to `main` that changes the docs app, kiln-ui, kiln-forms, the TypeScript presets, `DESIGN.md` or the workspace setup, and on demand. It runs on GitHub-hosted runners in one concurrency group that never cancels a deploy halfway. It isn't part of CI, so the "CI passed" gate doesn't wait for it.
- **Checked as deployed.** `scripts/check-links.ts` serves `out/` with `wrangler dev`, the deployed Worker's own config and headers, instead of `next start`, which doesn't serve an export.
- **Storybook stays undeployed.** It still builds for `/storybook` (0018). Deploying it is a later step.

## Consequences

- The site has no server code in production. A feature that needs one, such as server rendering per request, the form builder backed by an API, or a redirect that a `_redirects` rule can't express, needs a Worker script or OpenNext and a new ADR.
- A new route handler must stay `force-static` and give its output a file extension, or the export fails or serves it with the wrong type.
- The free plan allows 20,000 asset files per version and 25 MiB per file. At this ADR the export is about 1,500 files and 76 MiB, and the largest file, the search index, is 2.4 MiB.
- Next's per-segment prefetch files have `$` in their names. The Workers asset server answers a request for one with a 307 to the percent-encoded path, then 200. Client navigation works, at the cost of one extra round trip per prefetch.
- Merging to `main` deploys the docs. Publishing packages still goes through the release workflow ([`docs/releasing.md`](../releasing.md)).
