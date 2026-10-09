# 0020. How the agent skills are built

- **Status:** Accepted, amended by [0038](0038-variant-blocks.md)
- **Date:** 2026-10-05

## Context

[0011](0011-ai-tooling.md) has `kiln-ui` and `kiln-forms` ship skills in the layout TanStack Intent discovers, generated from or checked against the docs content, with CI failing on drift. It also asks for contributor skills for adding a component, a theme preset and a forms field. [0019](0019-docs-site.md) already turns every docs page into Markdown for `/docs/<page>.md` and `llms-full.txt`. Building the skills raised these questions:

- where a skill's text comes from, and how CI notices drift
- where the anti-slop rules come from, since they're in DESIGN.md and not on the docs site
- how a skill's links work once it's installed in another project
- whether CI should run `intent validate`

## Decision

**Skills are docs pages, assembled**

- Intent (0.5) treats a package as intent-enabled when it has a `skills/` directory and a `repository` field. Each skill is `skills/<name>/SKILL.md`, plus `references/<page>.md` for detail an agent reads only when it needs it. Both packages list `skills` in `files` and carry the `tanstack-intent` keyword.
- `apps/docs/src/skills/manifest.ts` defines each skill: its name, its "Use when…" description, and the docs pages that become SKILL.md and its references. Every other line comes from the pages, through the same Markdown conversion the `.md` routes use, so examples become their source and API tables become Markdown tables. The only prose written for the skills is each one's description and purpose.
- `kiln-ui` ships `setup-and-theming`, `layout-composition`, `custom-theme` and `design-rules`. `kiln-forms` ships `component-mode`, `schema-mode`, `custom-fields`, `validation` and `view-mode`.
- Links to a page the skill ships become relative links to its file, and links to any other page point at the docs site. `intent load` rewrites the relative ones for the consumer's project.
- Skills carry no `metadata.library_version`. Changesets bumps versions in the "Version packages" pull request without regenerating anything, so a version in the skill would drift on every release. The skill always ships inside the version it describes, which is the version guarantee that matters.

**Drift fails the docs tests**

- `apps/docs/src/skills/skills.test.ts` compares each generated file with the committed one using Vitest's `toMatchFileSnapshot`, so `pnpm generate:skills` (the same test with `--update`) is how they're rewritten. It also fails on a file in `packages/*/skills` that nothing generates. Since it runs in the docs package's `test` task, the existing `Test` CI job enforces it. Turborepo's `transit` dependency on both packages puts their files in the task's hash.
- The same test checks the structural rules `intent validate` applies: the name matches the directory, the description is under 1024 characters, metadata values are strings, and SKILL.md stays under 500 lines.
- The skills are excluded from Prettier, so the test can compare them byte for byte.

**The design rules become a docs page**

- `scripts/generate-design-rules.ts` writes UI › Foundations › Design rules from DESIGN.md §1 and §2 on every docs build. The page is gitignored. The `design-rules` skill is built from that page like any other, so DESIGN.md is the one source for the site, the skill and the binding standard.

**`intent validate` is a CI gate**

- `kiln-ui` and `kiln-forms` install `@tanstack/intent` as a devDependency, and `pnpm check:skills` runs `intent validate` in each. It's a Turborepo task that depends on `transit`, so a change to either package invalidates both, and CI runs it as the `Agent skills` job. Besides its structural checks, it typechecks every TypeScript code block in each SKILL.md against the package.
- With TypeScript 6, a CSS side-effect import (`import '@mitcsutt/kiln-ui/styles.css'`) is an error (TS2882) unless an ambient declaration covers it, because `noUncheckedSideEffectImports` is on by default. kiln-ui declares its own stylesheets, `@mitcsutt/kiln-ui/styles.css` and `@mitcsutt/kiln-ui/themes/*.css`, in `src/stylesheets.d.ts`. `index.ts` references that file with `preserve="true"` so `tsc` keeps the reference, and the library build copies it next to the declarations. Any project that imports kiln-ui can then import its stylesheets, with or without a bundler's types, and so can Intent's checker, which sees only the package's own types.
- It isn't a `*.css` wildcard. TypeScript chooses between wildcard modules by prefix length alone, so `*.css` ties with the `*.module.css` that Vite and Next.js declare, and whichever loads first wins. Storybook's typecheck lost every CSS Module class name when kiln-ui declared `*.css`, and a consumer's own CSS Modules would break the same way. So examples don't import the reader's own stylesheet in compiled code: the Theming guide's snippet shows `import './harbour.css'` as a comment after Kiln's stylesheet, and the live example relies on the docs layout loading it.
- Examples follow Intent's rules: a block may use names it doesn't declare (`form`, `save`), but it must parse and type-check. Sibling JSX goes in a fragment, a hook is called inside a component, and API signatures are generated as `declare function` declarations, not `name(args) => result`.
- `apps/docs/src/test/code-blocks.test.ts` applies the same rules to every code block on every docs page, read from the Markdown the `.md` routes and the skills serve. A docs edit fails the docs tests before the skills are regenerated, and pages that no skill ships meet the same standard. It loads Node's types, which Intent doesn't, because the tooling pages show Node config files.
- `toMarkdown` leaves fenced code as written. It used to strip MDX comments and self-closing component tags after inlining example sources, so the Markdown routes, `llms-full.txt` and the skills showed examples with elements missing.

**Contributor skills**

- `.claude/skills/` holds `add-component`, `add-theme-preset` and `add-forms-field`. They're procedures that list every file a change touches across the package, Storybook, the docs and CI, and point to DESIGN.md and the package AGENTS.md files for the rules instead of restating them.

## Consequences

- A docs change that affects a skill fails CI until `pnpm generate:skills` runs, which is the drift check 0011 asks for.
- A skill can't say anything the docs don't. If an agent needs a common mistake spelled out, it goes on the docs page first, where people see it too.
- Adding a page to a skill, or a new skill, is a manifest entry. A page that grows a skill past 500 lines fails the test, and the fix is to move a page into `references`.
- A docs example that stops compiling fails the docs tests, and the `Agent skills` job too if a skill ships it.
