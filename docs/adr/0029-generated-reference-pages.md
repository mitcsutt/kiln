# 0029. Reference pages are generated from TSDoc and stories

- **Status:** Accepted (amends [0019](0019-docs-site.md))
- **Date:** 2026-10-06

## Context

[0019](0019-docs-site.md) made the props tables and token tables come from source, but every page was still an MDX file written by hand. With docs examples moved into stories ([0028](0028-docs-stories.md)), what was left on the 156 component, field, layout and hook pages was a title, a description, a lead, a few sections, an "In a schema" JSON block on 46 forms pages, a field table on 28, and boilerplate (an API heading on every page, a token sentence on 64, a bound-field sentence on 28). Measured against the source:

- every page title already equalled its stories file's title leaf, and every page path its title's path;
- the `exports` frontmatter matched each component folder's `index.ts`;
- 147 of the API tables followed `<Export>Props`, and every token table followed `tokens.json`;
- the field table's kind, shorthand and export followed the default kit;
- the description and lead existed twice: on the page, and as a TSDoc summary that was usually a paraphrase of it (109 of 168), sometimes with design-document references (`§7.2`) that consumers already saw in their editors.

Fumadocs can serve pages with no file, but each must then bring its own body renderer, table of contents, search data and LLM text, and this app's Markdown route and skills builder read pages from disk.

## Decision

**Each reference page is generated from the code it documents.** `apps/docs/scripts/generate-pages.ts` writes one MDX page per stories file beside an export whose title sits on a reference group (`UI/Actions` … `UI/Typography`, `Forms/Fields`, `Forms/Layouts`, `Forms/Hooks`), into `content/docs` before Fumadocs compiles it, and the pages are gitignored. Search, the table of contents, `/docs/*.md`, `llms.txt` and the agent skills read them like any page. A hand-written page at the same path wins, as the escape hatch.

**The owner's TSDoc is the page's prose.**

- The summary is the page's description: the page header, search, `llms.txt`, editor hovers and Storybook's Docs page.
- `@remarks` is the lead, in Markdown. Its `##` sections follow the examples.
- An `@example` with a title is a section of that name: `@example In a schema` with a `json` block.
- A bound field's `@value` and `@empty` fill its field table, beside the kind, shorthand and export the default kit gives.
- `{@link X | text}` links to the page that documents `X`.
- `@privateRemarks` is for maintainers: notes and design-document references that the docs never show.

**Everything else is derived:** the title and path from the stories title, `exports` from the component folder's `index.ts` (or the hook's own file), the examples from the docs stories, the signature of each function, the props of each export and its compound parts, the object types those props and functions use, the bound-field API sentence, and the component tokens. `generate-api.ts` now also reads destructured prop defaults, as react-docgen does for Storybook, so a default written once in code fills both tables.

**Storybook shows the same text.** The preview's `extractComponentDescription` shows the summary and `@remarks` on each Docs page, without the other tags.

**Guides stay MDX:** getting started, schema, foundations, patterns, themes, tooling and the index pages teach a task across exports. So do the custom-layouts and stack-and-inline pages under `Forms/Layouts`.

## Consequences

- A component's docs change with its code. A TSDoc edit is a published change: the `.d.ts` carries it, so it needs a changeset.
- `src/test/reference.test.ts` fails when a page owner has no summary, when TSDoc a page shows cites the design document (`§`), when a bound field has no `@value` or `@empty`, or when an "In a schema" example doesn't parse with `parseFormSchema`. None of the JSON was checked before.
- The generator fails on a page owner with no summary, or with no docs story.
- Sidebar order stays in `meta.json`, which is editorial.
- Page structure is one template per kind. A few pages moved a paragraph above their first example, and API sections list a component's parts and option types that the hand-written pages left out.
- Comment text isn't wrapped by Prettier. The generator joins wrapped lines back into paragraphs, so pages read as before.
