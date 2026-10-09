# @mitcsutt/kiln-structure

Kiln's recommended structure for React web apps, and an [ESLint](https://eslint.org/) preset that enforces it. The core of it: a file lives with its closest common owner, the children of any owner are grouped by kind, and every module is a folder with a narrow `index.ts`. [ADR 0037](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0037-app-structure.md) has the rules and the reasoning.

It's for apps with routes, pages and features, bundled by Vite or Next.js. Libraries keep a barrel per entry point instead.

## Install

```sh
pnpm add -D @mitcsutt/kiln-structure eslint typescript
```

ESLint and TypeScript are optional peer dependencies: you need them only for the preset. It targets ESLint 10.

## Usage

```js
// eslint.config.js
import kilnStructure from '@mitcsutt/kiln-structure/eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  // ...your other configs
  kilnStructure({
    features: { dashboard: ['contacts', 'campaigns'], campaigns: ['contacts'], contacts: [] },
    groups: { components: ['sections'] },
    rootDir: import.meta.dirname,
  }),
)
```

The app maps `#` imports to module folders in `package.json`:

```json
"imports": {
  "#assets/*": "./src/assets/*",
  "#routeTree": "./src/routeTree.gen.ts",
  "#*": "./src/*/index.ts"
}
```

Add `projectStructure.cache.json` to `.gitignore`: `eslint-plugin-project-structure` writes it next to your config.

## Options

| Option               | Default         | What it does                                                                                                                                                                                           |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `features`           | required        | Every folder in `src/features/`, and the features each one imports directly. A cycle, or an edge to an undeclared feature, throws when the config loads. An undeclared feature folder is a lint error. |
| `kinds`              | `[]`            | Kinds to add to the core ones (`components`, `hooks`, `stores`, `utils`, `constants`, `types`, `schemas`). The core kinds can't be renamed.                                                            |
| `groups`             | `{}`            | Groups inside a kind, such as `{ components: ['sections'] }`. A group holds modules only.                                                                                                              |
| `testKind`           | `'testing'`     | The test-support kind's folder name.                                                                                                                                                                   |
| `router`             | `'tanstack'`    | `'tanstack'`: TanStack Router's `src/routes/`. `'next'`: the App Router's `src/app/`, with the shell in `src/app/_shell/`.                                                                             |
| `ignores.naming`     | `[]`            | Globs, relative to `srcDir`, that the folder and naming checks skip. Their imports are still checked.                                                                                                  |
| `ignores.boundaries` | `[]`            | Globs that the import rules skip. Keep this to generated code.                                                                                                                                         |
| `srcDir`             | `'src'`         | The source folder, relative to the ESLint config. The preset applies to it only.                                                                                                                       |
| `rootDir`            | `process.cwd()` | The project root. Pass `import.meta.dirname` if ESLint may run from another folder, such as an editor in a monorepo.                                                                                   |

The preset already exempts what tools own: generated files (`*.gen.*`, `__generated__/`), `__mocks__/`, `__snapshots__/`, `*.d.ts`, `public/`, global stylesheets and the router's root files, and the route files themselves. Only generated files skip the import rules: routes and the entry point stay inside them.

## What it enforces

| Rule                                                                                                                                                                                                             | How                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Owners: a file imports its own module, its children, its siblings and its ancestors' siblings                                                                                                                    | `boundaries/dependencies`                                        |
| Features import each other's public surface (`components hooks stores data types constants schemas`), in the declared direction                                                                                  | `boundaries/dependencies`                                        |
| Routes and `app/` import a feature's `pages/` plus its public surface                                                                                                                                            | `boundaries/dependencies`                                        |
| Shared code in `src/` never imports a feature, `app/` or a route                                                                                                                                                 | `boundaries/dependencies`                                        |
| The test-support kind is imported only by tests and stories (and setup files, which sit outside `src/`)                                                                                                          | `boundaries/dependencies`                                        |
| `index.ts` re-exports files that exist, so a module has its main file                                                                                                                                            | `boundaries/no-unknown-dependencies`                             |
| Folder shape: kinds, groups, module folders, `pages/` only at a feature root, `data/` and the test kind only there or in `src/`, the second-dot allowlist (`.test`, `.spec`, `.stories`, `.mock`, `.module.css`) | `project-structure/folder-structure`                             |
| No `../`; `./` reaches a sibling or one child module (`./<kind>/<Module>`, `./<kind>/<group>/<Module>`)                                                                                                          | `kiln-structure/relative-imports` (core `no-restricted-imports`) |
| `index.ts` holds only named re-exports from `./X` siblings                                                                                                                                                       | `kiln-structure/index-file` (core `no-restricted-syntax`)        |
| Named exports only, except stories, config files and Next.js route files                                                                                                                                         | `kiln-structure/named-exports` (core `no-restricted-syntax`)     |
| Fast Refresh boundaries, relaxed in `stores/`                                                                                                                                                                    | `react-refresh/only-export-components`                           |

The two core rules are registered again under `kiln-structure/`, unchanged, so their options never clash with your own `no-restricted-syntax` or `no-restricted-imports`.

## Known gaps

- **The main file is required indirectly.** `eslint-plugin-project-structure` can't require "`Name.ts` or `Name.tsx`", so the preset requires `index.ts`, allows only the main file as a sibling without a second dot, and reports an `index.ts` re-export that doesn't resolve. The error comes from `boundaries/no-unknown-dependencies`, not the folder rule.
- **Folder errors are reported once.** The folder rule reports each problem on the first file it meets, and doesn't see empty folders.
- **Module folders may be PascalCase or camelCase in any kind.** Casing per kind isn't checked, and all-caps names like `API` don't match their main file.
- **`import('../x')`** isn't caught by the relative-import rule, though the boundary rules still check it.
- **A deep `#` import** (`#components/Button/Button`) isn't a lint error. It doesn't resolve, so TypeScript and the bundler fail on it.
- **Route folders are free-form.** Names under `src/routes/`, and everything in the Next.js `src/app/` except `_shell/`, belong to the router.
- **Left to review, as the ADR says:** placement between features, and a module placed higher than it needs to be.

## Docs

Full documentation lives on the [Kiln docs site](https://kiln.mitchellsutton.com).

## Licence

[MIT](LICENSE)
