# 0037. Kiln recommends a structure for React web apps

- **Status:** Accepted
- **Date:** 2026-10-09

## Context

Kiln's packages give an app its components, forms and lint config, but nothing about how the app's own files are laid out. The apps built on Kiln started from [bulletproof-react](https://github.com/alan2207/bulletproof-react) and then drifted, each in its own direction. Across those apps and one larger production codebase, the same problems kept coming back:

- **Barrel files everywhere.** Every component folder and every feature had an `index.ts`, most re-exporting a single name. They cluttered Ctrl+P and the editor tabs, and raised fair worries about tree-shaking and lazy loading.
- **Roles mixed in one folder.** A feature's `components/` held its page, the sections of that page, and building blocks those sections share, all as siblings. Only the names told them apart.
- **Feature isolation that didn't hold.** One app banned imports between features, then relaxed the ban because the list of exceptions grew faster than the isolation helped. The larger codebase had hundreds of imports between features, with many pairs of features importing each other in both directions.
- **One concept, several spellings.** Client state lived in `atoms/`, `store/` and `*.atom.ts`. Constants lived in `constants.ts`, `constants/constants.ts`, `config/` and `configs/`. Test helpers lived in `__tests__/`, `test/` and `__mocks__/`. Three import styles coexisted, with no recorded decision.
- **Subpath imports that half work.** Two apps mapped `"#*"` to an array of fallbacks starting with `"./src/*"`. Vite only uses the first entry of an `imports` array ([vitejs/vite#16153](https://github.com/vitejs/vite/issues/16153), closed as not planned). TypeScript 6 with `bundler` resolution doesn't resolve an extensionless `"./src/*"` target at all. The map worked only because Vite's own resolver filled the gap.

None of these were enforced by lint, and the conventions that existed were written per repo, so every new app started the argument again.

The decisions below were worked through as side-by-side comparisons of the same code laid out two ways, checked against the existing apps, and then reviewed twice by reviewers who were given the rules alone and the rules with this reasoning. The evidence for the tooling and resolution claims is in [the research note](../research/app-structure.md).

## Decision

Kiln publishes a recommended structure for **React web apps**: projects with routes, pages and features. It doesn't apply to component libraries or npm packages. Those are shaped by their public API, so they keep a barrel per entry point and an `exports` map, as Kiln's own packages do.

It ships as a new package, `@mitcsutt/kiln-structure`, and every part of it is optional: a docs page, agent skills generated from it, and an ESLint preset. ESLint is an optional peer dependency, so a project that only wants the guidance doesn't take on a linter. This is why it isn't a preset inside `@mitcsutt/kiln-eslint-config`, which assumes ESLint.

The core of it fits in one sentence: **a file lives with its closest common owner, the children of any owner are grouped by kind, and every module is a folder with a narrow `index.ts`.**

### Tools win

When a tool the project uses gives a file or folder name meaning, its documented convention wins. That covers entry points, generated files, file-route names, `__mocks__`, `__snapshots__`, `public/` and codegen output. Names that only look like tool conventions, such as `__fixtures__`, aren't invented. The preset knows the common tools' conventions and takes extra ignore globs.

The rules state this as a principle and don't list file names. Listing `main.tsx` or `routeTree.gen.ts` would make the rules too tight the first time a tool brings a pattern nobody planned for.

### Owners, not role folders

A **feature** is a domain (`src/features/contacts/`), and pages are how a domain shows up in routes. Inside a feature, usage decides where a file lives. It goes in the smallest owner that contains everything that uses it: one page, then the feature root. If two features use something and no domain clearly owns it, it moves up to `src/`. There's no depth cap, because a large feature can legitimately go four or five levels deep.

Between features, placement is a judgement call. A contacts widget shown on the dashboard can live in contacts, or in the dashboard built from contacts' public pieces, and both are legal. The guidance is to put a piece where its knowledge lives, and when unsure, to follow the precedent already in the repo. With no precedent, it goes in the feature that uses it, built from the other feature's public surface, which is the default an agent can always apply. Keeping this loose costs nothing, because the boundary rules below still hold whichever way it goes.

The alternatives weighed were fixed role folders (`sections/` beside `components/`) and a page that owns its sections with a depth cap. Role folders mix the sections of every page in a feature into one folder. A depth cap is an arbitrary number that someone will argue with. Applied to a real app, the owner rule also gave the tree the authors would rather open.

### Kinds: a fixed core, plus additions declared once per repo

Inside any owner, children go in kind folders. The core kinds are `components/`, `hooks/`, `stores/`, `utils/`, `constants/`, `types/` and `schemas/`. `pages/` is allowed only at a feature root, and `data/` only at a feature root or in `src/`. Core names are fixed, so every app reads the same way and the agent skills can name them.

A repo can add kinds, and groups inside a kind such as `components/sections/`, declared once for the whole repo. A group holds modules only and never nests. Declaring them means one feature can't say `sections` while another says `segments`. Additions are where repos differ; renaming the core is not.

Groups answer a problem the owner rule creates. A building block shared by three sections sits beside those sections and looks like one of them. A naming suffix (`*Section`) was considered and rejected. A group folder says "these are the page's sections" without renaming anything. It sits inside `components/` because a section is a component.

**Stores** hold client state, whatever the mechanism: Zustand, Jotai, or a React context with its provider and hook. Swapping a context for Jotai then doesn't move files or rewrite imports, and it keeps one home for state, which is the drift the larger codebase had. A context store's main file is `.tsx` because it holds a provider, and it's named after the state (`themePreference/themePreference.tsx`). Exporting a provider and a hook from one file makes Fast Refresh reload the page instead of patching it, so the Fast Refresh rule is relaxed for `stores/` only.

**Test support** (fixtures, mock handlers) lives in a test-support kind at a feature root, or in `src/` for shared data. Its name is the one core kind a repo may choose (`testing`, `tests`, `specs`), declared once, because some names clash with folders that end-to-end tools already own. It's never public: only tests, stories and setup files import it. Setup files are the ones a tool's config loads, such as Vitest's `setupFiles` and Storybook's preview, and they sit in a root test folder outside `src/` with the custom render and the mock server that combines every handler. Setup may import anything, because its job is to assemble the app. No well-known structure keeps fixtures inside features, so this is Kiln's own convention. It follows the owner rule and MSW's advice to split handlers by domain, and a feature takes its test data with it when it's deleted.

**Assets** the bundler processes go in a central `src/assets/`, the common practice, and are exempt from the owner rule. Files served as-is go in `public/`.

`src/config/` holds values read from the environment at runtime, such as API URLs and feature switches. `constants/` holds values fixed in the code. A value that changes between deployments is config.

### Every module is a folder with a narrow index.ts

A component, hook, store, util, type, schema or data module is a folder named after its subject. The folder holds:

- `index.ts`
- a main file with the same name as the folder
- its tool-suffixed siblings (`.test`, `.stories`, `.module.css`, `.mock`)
- kind folders for anything only it uses

`index.ts` holds only named re-exports of files in its own folder: no `export *`, no logic, and no re-exports of child modules. Kind folders and features have no `index.ts`.

This reverses the starting position, which was against `index.ts`. Three things changed it:

- **Folder size.** A folder per module keeps a component's test, story and private helpers together. Without folders, a kind folder with ten hooks, their tests and their stories reaches thirty loose files, and a hook that grows its own helpers has nowhere to put them.
- **Import length.** `index.ts` keeps imports to `#…/ContactForm`, not `#…/ContactForm/ContactForm`.
- **Import resolution.** A single import target with one extension needs a file with a fixed name and extension in every folder. Mixed `.ts` and `.tsx` files can't share one target, but `index.ts` can.

The worries about barrels hold for wide ones: aggregator folders, `export *` chains and feature-level barrels. A narrow `index.ts` that names a few files from its own folder doesn't bring those problems. Ctrl+P still finds `ContactForm`, because nobody searches for `index.ts`.

A **data module** is an ordinary module, one per resource. `contacts/contacts.ts` holds its query keys, query options, mutations and the hooks that wrap them. Splitting it by role was considered three ways, and each broke another rule:

- role-named files (`contactKeys.ts`, `contactQueries.ts`) would make data the one place a module has several main files;
- `contacts/keys.ts` gives every resource a `keys.ts`, so names no longer stand alone;
- `keys/contact.ts` spreads one resource across three folders.

Mappers between the API's shapes and the app's types live in the same module. Keeping keys beside the queries and mutations that use them is what the cache needs. A module that grows too big splits by sub-resource (`contactImport/` beside `contacts/`), and its keys build on the parent's.

`data/` exists only in `src/` and at a feature root, never deeper, because queries nested in pages are hard to find and easy to duplicate, and duplicated query keys corrupt the cache. It isn't called `queries/`, because mutations live there too, or `api/`, because in Next.js that means server routes.

### Imports

```json
"imports": {
  "#assets/*": "./src/assets/*",
  "#routeTree": "./src/routeTree.gen.ts",
  "#*": "./src/*/index.ts"
}
```

A `#` import lands on an `index.ts`, or on a file the map names explicitly: assets, generated files and anything else that isn't a module. The more specific key wins in every tool. Global CSS is imported once, from the entry point.

Relative imports reach a sibling in the same folder (`./ContactForm` from `index.ts`, a test or a story) or go one level down to a child module (`./components/Row`), which lands on that child's `index.ts`. They never reach a file inside a child, and `../` is banned. The first design required `#` everywhere. Reviewers showed that gave imports of over a hundred characters for a module's own children, and that every move then rewrote the whole moved subtree. Downward relative imports fix both. Banning `../` means anything outside your own folder is still reached by its `#` path.

TypeScript `paths` were the other way to get short imports. Subpath imports were chosen because they're the platform standard that Node, TypeScript and bundlers all read from `package.json`, while `paths` is a TypeScript setting that each bundler and test runner has to be taught again through plugins.

This targets apps bundled by Vite. TypeScript, Vite and Vitest all resolve the map, but plain Node can't run the extensionless re-exports.

Everything is a named export, except where a tool requires a default. Named exports keep one name for a thing everywhere, so renames and search are reliable.

### Feature boundaries and direction

A feature's public surface is its root `components/`, `hooks/`, `stores/`, `data/`, `types/`, `constants/` and `schemas/`. Types and constants are public on purpose: if another feature can't import a type, it copies it. Routes and `src/app/` import a feature's `pages/` plus its public surface: loaders need `data/`, search params need `schemas/`, and error screens need `components/`.

Features may import each other in one direction only, and the direction is **declared** in the preset config:

```js
features: { dashboard: ['contacts', 'campaigns'], campaigns: ['contacts'], contacts: [] }
```

Every feature appears in the graph, even with no dependencies, and an undeclared feature is an error. Edges aren't transitive: each feature lists only the features it imports directly. An import against the declared direction is a lint error in the editor, and a cycle in the declaration fails when the config loads. A total ban was tried and abandoned in practice, because a dashboard built from other domains' widgets needs to cross features. A file-level cycle check (`import-x/no-cycle`) doesn't catch two features that depend on each other through different files, which is exactly how the two-way pairs formed. No tool tested detects feature-level cycles on its own, apart from Nx, which needs every feature to be a separate project. A declared graph is one line per dependency, and it doubles as a map of how the domains depend on each other.

`src/app/` is the composition root: the shell, providers and router setup. It may import features, through the same surface routes use. In Next.js the App Router owns `src/app/`, so the shell goes in `app/_shell/`, a private folder the App Router ignores. Other shared code in `src/` never imports a feature, `app/` or a route.

### Names

- A second dot in a filename is reserved for tool conventions. A file is `contacts.ts`, not `contacts.queries.ts`.
- A filename should say what it is without its folder, so Ctrl+P works.
- When a page and a type share a name, rename one. That case is rare and the type checker catches misuse, so it isn't worth a rule.

### Enforcement

The preset is configuration over existing plugins, with no custom rules:

- **`eslint-plugin-boundaries`:** owners, feature public surfaces, rules generated from the declared feature graph, and shared code not importing features.
- **`eslint-plugin-project-structure`:** folder shape, kinds, groups, module folders and the dot-suffix allowlist.
- **Core ESLint:** `no-restricted-syntax` for what `index.ts` may contain, and `no-restricted-imports` for `../`.

- **`eslint-plugin-react-refresh`:** `only-export-components`, relaxed for `stores/`.

"Tools win" is a principle in the docs and a closed list in the preset: the preset ships the known conventions for each supported tool (Vite, TanStack Router, Next.js, Vitest, Storybook, MSW, Playwright) and takes extra globs for anything else. There are two lists, not one. Naming exemptions (route file names, generated files, tool folders) relax the folder and naming checks. Boundary exemptions cover only generated files. Routes and the entry point stay inside the import rules, because a shared list let a route import a feature's private component with no error. Two things are left to review:

- placement between features;
- a module placed higher than it needs to be. Checking this needs the whole import graph, which would slow lint and fire on code that works. It's recorded in [the Maybe list](../maybe.md) to revisit.

### Outputs

- **A structure page** that states the rules, written to be followed.
- **A reasoning page** that explains them, drawn from this record.
- **Agent skills generated from the structure page only.** An agent gets instructions, not the argument behind them. The source has variant blocks for router and data stack, so a project loads a small core skill plus add-ons for its own stack. The line budgets are tested.

## Consequences

- An app following this has many folders and many small `index.ts` files. A 20-hook feature has 20 hook folders, and a large app has more `index.ts` files than before, which goes against the complaint this started from. It was accepted because each one is a module's single entrance, not a barrel, and it buys one import target and module folders that move as a unit.
- A new dependency between features is a config edit. That's the price of seeing the wrong direction in the editor, not at review.
- The preset depends on two third-party plugins. `eslint-plugin-project-structure` has a single maintainer, so it's pinned and its config sits in its own file, ready to swap.
- Kiln's existing apps don't follow this yet. Migrating them, starting with the portfolio site, is separate work in their own repositories.
- The variant blocks change how skills are generated from docs pages, and get their own record amending [0020](0020-agent-skills.md).
