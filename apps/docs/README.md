# Kiln docs

The public docs site for Kiln: Fumadocs on Next.js, built with `@mitcsutt/kiln-ui` itself ([ADR 0009](../../docs/adr/0009-docs-and-storybook.md), [ADR 0019](../../docs/adr/0019-docs-site.md)). It's a private app, never published to npm. The chrome, the theme picker, search, the Markdown routes, `kiln-docs postbuild` and the link check come from `@mitcsutt/kiln-docs` in [`packages/docs`](../../packages/docs), and this app holds what makes the site Kiln's ([ADR 0045](../../docs/adr/0045-kiln-docs.md)). `next build` exports it as a static site, and every push to `main` that changes it deploys it to `kiln.mitchellsutton.com` on Cloudflare Workers ([ADR 0034](../../docs/adr/0034-docs-on-cloudflare-workers.md)).

```sh
pnpm --filter @mitcsutt/kiln-docs-site dev      # http://localhost:3000
pnpm --filter @mitcsutt/kiln-docs-site build    # the static site, in out/
pnpm --filter @mitcsutt/kiln-docs-site exec wrangler dev   # serve out/ as the Worker does, on :8787
pnpm check:links                           # build, serve with Wrangler, and fail on any broken internal link (kiln-docs check-links)
```

## Where things live

```
content/docs/         MDX pages and meta.json files: the sidebar tree (docs/tree.json at the root)
site.config.ts        what makes the site Kiln's: name, URL, theme picker, header and footer links, llms.txt copy, variant axes
source.config.ts      kiln-docs' MDX preset, with the `exports` frontmatter field and `<Examples of>`
scripts/              generate-api.ts, generate-tokens.ts, generate-examples.ts, stories-examples.ts, extract-example.ts, generate-pages.ts, generate-design-rules.ts, compare-export.ts
src/app/              the landing page, and route files that re-export what createDocsSite() returns
src/lib/site.ts       createDocsSite(): Kiln's config, its pages, its MDX components and its Markdown transform (toMarkdown)
src/components/       the landing page, Kiln's MDX components, foundations specimens
src/skills/           the agent skills kiln-ui, kiln-forms, kiln-dnd and kiln-charts ship, built from these pages
src/styles/harbour.css  the custom theme the Theming guide builds
```

## Checking a refactor

A change that should leave the site as it is, such as moving the chrome into a package, is checked against an export of the branch it started from (ADR 0045). Build that branch, copy its `out/` somewhere, build the change, then run `node scripts/compare-export.ts <baseline-out>`. It fails unless `llms.txt`, `llms-full.txt`, `_headers` and every `.md` file match byte for byte, each page's HTML matches once CSS Module hashes are normalised (title, meta tags, ids, hrefs, classes, visible text, `data-theme`, `data-mode` and the head script), the search index holds the same documents, and each theme selector has the same CSS rules. `--report <dir>` also writes a diff of every page's full HTML, which never fails the check. Build both exports on the same day: live examples render dates.

## Writing a page

- A component, field, layout or hook page is generated, not written ([ADR 0029](../../docs/adr/0029-generated-reference-pages.md)). `scripts/generate-pages.ts` builds it from the export's TSDoc (the summary is its description, `@remarks` its lead and sections, `@example In a schema` a section, `@value` and `@empty` a bound field's table) and its docs stories, and adds the API and component tokens. The pages land in `content/docs` and are gitignored; a hand-written page at the same path wins, with a `!` line in `.gitignore`. `src/test/reference.test.ts` fails on a missing summary, a design-document reference (`§`) in what a page shows, a bound field without `@value` or `@empty`, or a schema example that doesn't parse.
- Every other page (guides, foundations, patterns, themes, tooling) is MDX with `title`, `description` and `exports` (the public exports it documents) in its frontmatter. `src/test/tree.test.ts` fails when a component, field, layout, hook or function has no page, when a Storybook title has no page, or when the sidebar groups differ from `docs/tree.json`.
- A live example is a story tagged `docs` in the stories file beside the code it documents ([ADR 0028](../../docs/adr/0028-docs-stories.md)): a JSDoc caption, a `render` that takes no args, imports from packages only, and no `style`. `kiln/docs-story` lints all four. `<Examples of="Button" />` shows every docs story of `Button.stories.tsx` in file order, the first after the lead and each later one under its name as a heading; `<Example of="Button" name="Hierarchy" />` shows one, and `Usage` when `name` is left out. A guide's stories file under `packages/<pkg>/src/docs/` or `src/stories/` is named by its title's page path: `<Example of="forms/getting-started/first-form" />` is the `Usage` story of the file titled `Forms/Getting started/First form`. `src/test/tree.test.ts` fails when a tag names a story that doesn't exist, or a docs story isn't shown on any page.
- The page renders the example and shows its code underneath. The code is the story's slice, read as if its `render` were a component: the component plus the top-level helpers and imports it uses. Each slice is written to `.generated/examples/`, typechecked on its own, and is what the live preview renders, so the preview is the code shown.
- `<ApiTable of="ButtonProps" />` renders props from the package types; `<ApiSignature of="useFormStatus" />` renders a function's signature; `<ComponentTokens of="Card" />` lists the tokens a component's CSS Module declares. All three are generated by the scripts, never written by hand.
- Every page is also served as Markdown at its URL plus `.md`, with examples as code and API tables as Markdown tables, and listed in `/llms.txt`.
- The agent skills in `packages/ui/skills`, `packages/forms/skills` and `packages/charts/skills` are that same Markdown ([ADR 0011](../../docs/adr/0011-ai-tooling.md)). `src/skills/manifest.ts` lists the pages each skill is built from. After changing one, run `pnpm generate:skills` from the root; `src/skills/skills.test.ts` fails while a skill differs from its pages.
- Every `ts`, `tsx` and `js` code block compiles against the packages, under the rules `intent validate` applies to the skills: `src/test/code-blocks.test.ts` fails otherwise, with live examples and API signatures included. A fragment may use names it doesn't declare (`form`, `save`), but it must parse and type-check: wrap sibling JSX in a fragment, and call hooks inside a component.
- UI › Foundations › Design rules is generated from DESIGN.md §1 and §2 by `scripts/generate-design-rules.ts`. Edit DESIGN.md, not the page.

Write as the rest of the repo does: [DESIGN.md](../../DESIGN.md)'s copy rules apply (sentence case, specific invented content, no lorem ipsum).
