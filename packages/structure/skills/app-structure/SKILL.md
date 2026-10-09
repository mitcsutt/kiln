---
name: app-structure
description: "Use when creating, moving or reviewing files in a React web app (routes, pages, features), or setting up its imports and lint: where a file goes by its closest common owner, kind folders (components, hooks, stores, utils, constants, types, schemas, pages, data), module folders with a narrow index.ts, # subpath imports and the import map, feature boundaries and the declared feature graph, and the @mitcsutt/kiln-structure ESLint preset. Not for component libraries or npm packages."
metadata:
  purpose: Place every file of a React web app by Kiln's structure rules, and configure the ESLint preset that enforces them.
  type: core
  library: "@mitcsutt/kiln-structure"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/tooling/project-structure/index.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Lay out a React web app

Place every file of a React web app by Kiln's structure rules, and configure the ESLint preset that enforces them.

`@mitcsutt/kiln-structure` is Kiln's recommended layout for **React web apps**: projects with routes, pages and features. It isn't for component libraries or npm packages, which keep a barrel per entry point and an `exports` map.

**A file lives with its closest common owner, the children of any owner are grouped by kind, and every module is a folder with a narrow `index.ts`.** Every part is optional: these rules, the [agent skills](https://kiln.mitchellsutton.com/docs/tooling/ai) and the [ESLint preset](#eslint-preset). [Why it's shaped this way](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning) explains each decision.

## Rules

- **R0. Tools win.** Where a tool the project uses gives a file or folder name meaning (entry points, generated files, route files, `__mocks__`, `__snapshots__`, `public/`, codegen output), follow the tool. Don't invent tool-looking names such as `__fixtures__`. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#tools-win)
- **R1. Owners.** A feature is a domain: `src/features/<kebab-name>/`. Inside a feature, put a file in the smallest owner that contains everything that uses it: a module, a page, then the feature root. There's no depth limit. Code that two or more features use and no domain owns goes up to `src/`. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#owners-not-role-folders)
- **R1, between features.** Put a piece where its knowledge lives. When unsure, follow the precedent in the repo. With none, put it in the feature that uses it, built from the other feature's public surface.
- **R2. Kinds.** Inside any owner, children go in kind folders: `components/`, `hooks/`, `stores/`, `utils/`, `constants/`, `types/`, `schemas/`. No other folder names. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#groups-declared-once)
  - `pages/` only at a feature root. `data/` only at a feature root or in `src/`.
  - Kinds and groups the repo adds (`components/sections/`) are declared once for the whole repo. A group holds modules only and never nests.
  - `stores/` holds all client state: Zustand, Jotai, or a React context with its provider and hook. A context store's main file is `.tsx`, named after the state. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#stores-hold-contexts-too)
  - Test support (fixtures, mock handlers) goes in the test kind, `testing/` unless the repo declares another name, at a feature root or in `src/`. Only tests, stories and setup files import it. Setup files go in a root test folder outside `src/`. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#test-support-lives-with-its-feature)
- **R3. Every module is a folder,** named after its subject. It holds `index.ts`, a main file with the folder's name, that file's tool-suffixed siblings (`.test`, `.stories`, `.module.css`, `.mock`), and kind folders for anything only it uses. No loose files in kind folders. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#every-module-is-a-folder)
- **R4. `index.ts` only re-exports its own folder:** named re-exports such as `export { ContactForm } from './ContactForm'`. No `export *`, no logic, no re-exports of child modules. Kind folders and features have no `index.ts`. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#a-narrow-indexts-and-why-barrels-came-back)
- **R5. Imports.** Reach other folders with `#`. Use `./` only for a sibling in the same folder, or one level down to a child module (`./components/Row`). Never `../`. Every `#` import lands on an `index.ts` or on a file the import map names. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#downward-relative-imports)
- **R6. Named exports only,** except where a tool requires a default.
- **R7. Pages are a kind.** A page module lives in `pages/` at a feature root, with any name. If a page and a type share a name, rename one. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#pages-are-a-kind)
- **R8. Feature boundaries.** A feature's public surface is its root `components/`, `hooks/`, `stores/`, `data/`, `types/`, `constants/` and `schemas/`. Routes and the app shell import `pages/` plus that surface. Features import each other in one direction, declared in the preset's `features` graph. Other shared code in `src/` never imports a feature, the app shell or a route. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#one-way-features-declared)
- **R9. Data.** Server state lives in `data/` only. One module per resource: `contacts/contacts.ts` holds its keys, queries, mutations, the hooks that wrap them, and the mappers between API and app types. Split a module that grows by sub-resource (`contactImport/`), never by role. Clients go in `src/lib/`. [Why](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#data-one-module-per-resource)
- **R10. Routes are thin:** router config (loader, search schema, head), then render a page.
- **R11. Names.** A second dot in a filename is for tool conventions only (`contacts.ts`, not `contacts.queries.ts`). A filename says what it is without its folder.

The import map, in `package.json`:

```json title="package.json"
{
  "imports": {
    "#assets/*": "./src/assets/*",
    "#routeTree": "./src/routeTree.gen.ts",
    "#*": "./src/*/index.ts"
  }
}
```

It targets apps bundled by Vite or Next.js: plain Node can't run the extensionless re-exports. Import global CSS once, from the entry point.

## Top-level folders

| Folder                     | Holds                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/`                 | The composition root: the shell, providers and router setup. It may import features. Next.js: `src/app/_shell/` |
| `src/routes/`              | File routes, named as the router requires (TanStack Router)                                                     |
| `src/features/`            | One folder per domain                                                                                           |
| `src/lib/`                 | Configured third-party clients, one module each                                                                 |
| `src/config/`              | Values read from the environment at runtime: API URLs, feature switches                                         |
| `src/assets/`              | Images, icons and fonts the bundler processes, exempt from the owner rule. Files served as-is go in `public/`   |
| `src/<kind>/`              | Shared modules no feature owns, plus `src/data/` and the shared test kind                                       |
| `testing/`, outside `src/` | Test setup: the custom render, the mock server that combines every handler, the setup file                      |

A value that changes between deployments goes in `config/`. A value fixed in code goes in `constants/`. [Why assets are central](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#assets-stay-central)

## Example

```txt
src/
├─ app/components/AppShell/
├─ assets/logo.svg
├─ config/env/
├─ lib/queryClient/
├─ routes/contacts/$contactId.tsx
└─ features/contacts/
   ├─ components/ContactAvatar/        public
   ├─ data/contacts/                   public
   ├─ testing/contactFixtures/         tests only
   └─ pages/Contact/
      ├─ index.ts
      ├─ Contact.tsx
      ├─ Contact.test.tsx
      └─ components/
         ├─ ContactHeader/             this page only
         └─ sections/ContactOverview/  a declared group
testing/renderWithProviders/           test setup, outside src/
```

## Where does this file go?

Take the first answer that fits:

1. A tool gives it a name or a place: follow the tool.
2. An image, icon or font: `src/assets/`, or `public/` if it's served as-is.
3. A value from the environment: `src/config/`. A configured client: `src/lib/`.
4. A fixture or mock handler: the test kind at its feature's root, or in `src/` for shared data. Test setup: the root test folder.
5. A query, mutation or anything else about server state: the resource's module in `data/`, at the feature root or in `src/`.
6. A screen a route renders: `pages/` at the feature root.
7. Anything else: list everything that uses it, and put it in the smallest owner that contains them all. Then pick its kind folder and make it a module folder.
8. Another feature needs it: it must sit in the owning feature's public surface, and the dependency must be in the `features` graph.

## ESLint preset

```sh
pnpm add -D @mitcsutt/kiln-structure eslint typescript
```

ESLint 10 and TypeScript are optional peer dependencies, needed only for the preset. [Why a separate package](https://kiln.mitchellsutton.com/docs/tooling/project-structure/reasoning#a-separate-optional-package)

```js title="eslint.config.js"
import kilnStructure from '@mitcsutt/kiln-structure/eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  kilnStructure({
    features: { dashboard: ['contacts', 'campaigns'], campaigns: ['contacts'], contacts: [] },
    groups: { components: ['sections'] },
    rootDir: import.meta.dirname,
  }),
)
```

Add `projectStructure.cache.json` to `.gitignore`.

| Option               | Default         | What it does                                                                                                                                                              |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features`           | required        | Every folder in `src/features/`, with the features it imports directly. A cycle or an undeclared edge throws when the config loads. An undeclared folder is a lint error. |
| `kinds`              | `[]`            | Kinds added to the core ones, which can't be renamed                                                                                                                      |
| `groups`             | `{}`            | Groups inside a kind, such as `{ components: ['sections'] }`                                                                                                              |
| `testKind`           | `'testing'`     | The test kind's folder name                                                                                                                                               |
| `router`             | `'tanstack'`    | `'tanstack'` for `src/routes/`, `'next'` for the App Router's `src/app/` with the shell in `src/app/_shell/`                                                              |
| `ignores.naming`     | `[]`            | Globs, relative to `srcDir`, that the folder and naming checks skip. Their imports are still checked                                                                      |
| `ignores.boundaries` | `[]`            | Globs the import rules skip. Keep it to generated code                                                                                                                    |
| `srcDir`             | `'src'`         | The source folder, relative to the config. The preset applies to it only                                                                                                  |
| `rootDir`            | `process.cwd()` | The project root. Pass `import.meta.dirname` when ESLint may run from another folder                                                                                      |

The preset already exempts what tools own: generated files (`*.gen.*`, `__generated__/`), `__mocks__/`, `__snapshots__/`, `*.d.ts`, `public/`, global stylesheets, the router's root files and the route files. Only generated files skip the import rules.

It's configuration over `eslint-plugin-boundaries`, `eslint-plugin-project-structure`, `eslint-plugin-react-refresh` and two core rules, registered again as `kiln-structure/relative-imports`, `kiln-structure/index-file` and `kiln-structure/named-exports` so their options never clash with yours.

## Known gaps

- The main file is required through `index.ts`: a re-export that doesn't resolve is reported by `boundaries/no-unknown-dependencies`.
- The folder rule reports a problem once, on the first file it meets, and doesn't see empty folders.
- Module folder casing isn't checked per kind, and all-caps names like `API` don't match their main file.
- `import('../x')` isn't caught by the relative-import rule. A deep `#` import (`#components/Button/Button`) isn't a lint error, but it doesn't resolve.
- Route folders are free-form. Placement between features, and a module placed higher than it needs to be, are left to review.

Add-on skills, one per stack the project depends on: `app-structure-tanstack-router` (TanStack Router), `app-structure-nextjs` (Next.js), `app-structure-tanstack-query` (TanStack Query), `app-structure-graphql` (GraphQL), `app-structure-rest` (REST), `app-structure-websockets` (WebSockets).
