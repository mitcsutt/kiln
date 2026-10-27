# @mitcsutt/kiln-docs

## 0.1.0

### Minor Changes

- 737bdee: First release of `@mitcsutt/kiln-docs`, Kiln chrome for `fumadocs-core`: the foundation of a docs site built with `@mitcsutt/kiln-ui`, with each site owning its content. It ships the site config (`defineSite`), the Next.js config wrapper, the layouts and pages, a fixed theme or a theme picker, search with Pagefind (or the static Orama index, with `search.provider: 'orama-static'`), each page's Markdown with `llms.txt` and `llms-full.txt`, SEO basics, `writeGenerated()` for generated pages, and the `kiln-docs` bin with `postbuild`, which writes the Pagefind index, and `check-links`. The README lists the files a site writes.

  Upgrade: none, it's the first release. Install it with `pnpm add @mitcsutt/kiln-docs @mitcsutt/kiln-ui next react react-dom fumadocs-core@~16.15.18 fumadocs-mdx@15.4.6 zod` and `pnpm add -D typescript @types/react @types/react-dom @types/node @types/mdx wrangler`, and approve the `esbuild` and `workerd` build scripts in the site's `pnpm-workspace.yaml`.
