# Contributing to Kiln

Thanks for helping out. This guide covers how to set up the repo, the commands you'll use, and the conventions every change follows.

## Setup

You need the Node.js version in [`.nvmrc`](.nvmrc) and pnpm through [Corepack](https://nodejs.org/api/corepack.html). The pnpm version is pinned in the root `package.json`.

```sh
nvm use            # or your version manager's equivalent
corepack enable
pnpm install
```

`pnpm install` also installs the Git hooks (see [Conventions](#conventions)).

## Layout

```
apps/
  docs/              the Fumadocs docs site (private, never published)
  storybook/         the Storybook workbench (private, never published)
packages/
  ui/                @mitcsutt/kiln-ui (skills/: agent skills, built from the docs)
  forms/             @mitcsutt/kiln-forms (skills/: agent skills, built from the docs)
  eslint-config/     @mitcsutt/kiln-eslint-config
  prettier-config/   @mitcsutt/kiln-prettier-config
  tsconfig/          @mitcsutt/kiln-tsconfig
  testing-react18/   private test fixture for the React 18 test pass (never published)
docs/
  adr/               architecture decision records
  tree.json          the information architecture the docs and Storybook share
  releasing.md       how releases work, and what the first publish needs
  target-state.md    what the repo looks like when the first body of work is done
.changeset/          pending changesets and the Changesets config
.claude/skills/      project skills for adding a component, a theme preset or a forms field
DESIGN.md            the design system's principles, anti-slop rules and token contract
vite.library.ts      the library build every runtime package shares
size-report.ts       size budgets and tree-shaking checks for built packages
```

Directories use the short name (`packages/tsconfig`), and the package name carries the brand (`@mitcsutt/kiln-tsconfig`).

## Commands

Run these from the repo root. Turborepo runs each one across the workspace and caches the results.

| Command                | What it does                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `pnpm lint`            | ESLint in every package and at the root, plus `prettier --check`      |
| `pnpm typecheck`       | `tsc --noEmit` in every package and at the root                       |
| `pnpm test`            | Vitest in every package                                               |
| `pnpm build`           | Builds every package that has a build step                            |
| `pnpm build:watch`     | Rebuilds `kiln-ui` and `kiln-forms` on every change, for a linked app |
| `pnpm test:react18`    | The runtime packages' test suites again, on React 18.3                |
| `pnpm test:storybook`  | Every story as a browser test: render, `play` function and axe        |
| `pnpm check:links`     | Builds the docs site, serves it and fails on any broken internal link |
| `pnpm check:package`   | `publint` and `@arethetypeswrong/cli` on each packed package          |
| `pnpm check:skills`    | `intent validate` on each package's agent skills, examples included   |
| `pnpm size`            | Size report against each package's budgets, with tree-shaking checks  |
| `pnpm format`          | Formats the whole repo with Prettier                                  |
| `pnpm generate:skills` | Rebuilds the agent skills in `packages/*/skills` from the docs pages  |

To work on one package, filter to it, for example `pnpm turbo run test --filter=@mitcsutt/kiln-eslint-config`.

To run the docs site, run `pnpm --filter @mitcsutt/kiln-docs dev` and open http://localhost:3000. Pages are MDX in `apps/docs/content/docs`, and each live example is a file in `apps/docs/examples` that the page names with `<Example name="…" />`; API tables come from the package types. [`apps/docs/README.md`](apps/docs/README.md) has the details.

The agent skills that `kiln-ui` and `kiln-forms` ship are built from docs pages, which `apps/docs/src/skills/manifest.ts` lists ([ADR 0011](docs/adr/0011-ai-tooling.md)). After you change one of those pages, run `pnpm generate:skills` and commit the result: the docs tests fail while a skill differs from its pages. Never edit a file in `packages/*/skills` by hand.

To open the Storybook workbench, run `pnpm --filter @mitcsutt/kiln-storybook dev`. The story tests need Chromium from Playwright the first time: `pnpm --filter @mitcsutt/kiln-storybook exec playwright install chromium`. They start in Paper, light; set `STORYBOOK_THEME` and `STORYBOOK_MODE` to run them in another theme or mode, as CI does for every one.

CI runs all of these except `format` and `generate:skills` on every pull request and on `main`, plus a changeset check on pull requests, and they must all pass. On a pull request it also comments the size report, compared with the base branch.

## Developing against a local Kiln

When an app that uses Kiln turns up a problem, fix it in Kiln and try the fix in the app before releasing it. Link the app to your Kiln checkout and keep it linked until the app work is done, so every Kiln change it needs ships in one pull request and one release. The linked app uses the built packages, the same JavaScript, declarations and CSS that npm would give it ([ADR 0022](docs/adr/0022-linked-consumers.md)).

1. In Kiln, install and build, then leave the watch build running so every change is rebuilt. The examples below assume the checkout sits next to the app, in `../kiln`; adjust the paths to match yours.

   ```sh
   pnpm install
   pnpm build:watch
   ```

2. In the app, point the Kiln dependencies at the checkout, and add the packages Kiln depends on, at the versions in Kiln's `pnpm-workspace.yaml` catalog. A linked package doesn't install its dependencies into the app, and the app's own copies are what keep it to one React.

   ```json
   {
     "dependencies": {
       "@mitcsutt/kiln-ui": "link:../kiln/packages/ui",
       "@mitcsutt/kiln-forms": "link:../kiln/packages/forms",
       "radix-ui": "^1.6.7",
       "@tanstack/react-form": "^1.33.5"
     }
   }
   ```

3. Tell the app's bundler to use the built files (the `kiln-dist` condition), to dedupe React and Kiln's dependencies, and to serve files from the checkout. For Vite (and Storybook and TanStack Start, which use its config):

   ```ts
   import {
     defaultClientConditions,
     defaultServerConditions,
     defineConfig,
     searchForWorkspaceRoot,
   } from 'vite'

   export default defineConfig({
     resolve: {
       conditions: ['kiln-dist', ...defaultClientConditions],
       dedupe: ['react', 'react-dom', 'radix-ui', '@tanstack/react-form'],
     },
     ssr: { resolve: { conditions: ['kiln-dist', ...defaultServerConditions] } },
     server: {
       fs: { allow: [searchForWorkspaceRoot(process.cwd()), '../kiln/packages'] },
     },
   })
   ```

   Vitest uses these settings only when it reads `vite.config.*`. An app with its own `vitest.config.*` needs the same `resolve` and `ssr` settings there, or a `mergeConfig` with the Vite config.

4. Tell TypeScript to use the built declarations, in the app's `tsconfig.json`. Without this it type-checks Kiln's source under the app's settings.

   ```json
   { "compilerOptions": { "customConditions": ["kiln-dist"] } }
   ```

Without the dedupe the browser may work while server rendering fails with "Invalid hook call", because Kiln's dependencies load React from Kiln's `node_modules`. Types have the same split: a linked `dist/*.d.ts` reads React's types from Kiln's `node_modules`, so keep the app's `@types/react` and `@types/react-dom` at the versions in Kiln's catalog while it's linked, or JSX types come from two copies.

Code that runs in Node outside the bundler, such as a Vite config or a script, doesn't get the `kiln-dist` condition, so importing a linked package's root entry resolves to Kiln's source, which Node can't load (`ERR_UNSUPPORTED_DIR_IMPORT`). A published install is fine, because its `exports` point at `dist`. The supported way is to import only what has a Node entry: `@mitcsutt/kiln-ui/theme-script` (`themeScript` and `DEFAULT_STORAGE_KEY`), whose `node` condition points at the built file, linked or not ([ADR 0023](docs/adr/0023-theme-script-entry.md)). If Node-side tooling needs something else from Kiln, give it the same kind of entry rather than working around it in the app.

The config packages (`kiln-eslint-config`, `kiln-tsconfig` and `kiln-prettier-config`) link with a plain `link:` and need none of the above: they have no build, and their own dependencies, such as the ESLint plugins, resolve from Kiln's `node_modules`.

When you add a new `exports` subpath to a package, give it both conditions: `default` for the source and `kiln-dist` for the file `publishConfig.exports` names, plus `node` with the same file if plain Node should load it. The build fails if `kiln-dist` or `node` differs from `publishConfig.exports`.

### Make the link reversible

Steps 2 to 4 edit files the app commits, so it's easy to commit the linked state by mistake, and undoing it is a manual checklist. An app that links often can keep every committed file in its published state and switch linking on with one gitignored file instead:

- **A switch file.** A script (`pnpm kiln:link <path>`) writes a gitignored file, say `.kiln-link/link.json`, naming the Kiln checkout, each linked package's directory, and the runtime dependencies each one needs from the app (read from Kiln's catalog). `pnpm kiln:unlink` deletes it. Every hook below does nothing while the file is missing.
- **A pnpm hook for the dependencies.** A `readPackage` hook in `.pnpmfile.cjs` rewrites the Kiln dependencies to `link:` and adds Kiln's runtime dependencies, so `package.json` never changes:

  ```js title=".pnpmfile.cjs"
  const fs = require('node:fs')
  const path = require('node:path')

  let link = null
  try {
    link = JSON.parse(fs.readFileSync(path.join(__dirname, '.kiln-link/link.json'), 'utf8'))
  } catch {}

  function readPackage(pkg) {
    if (!link) return pkg
    for (const deps of [pkg.dependencies, pkg.devDependencies]) {
      for (const name of Object.keys(deps ?? {})) {
        const linked = link.packages[name]
        if (!linked) continue
        deps[name] = `link:${linked.dir}`
        for (const [dep, range] of Object.entries(linked.dependencies)) deps[dep] ??= range
      }
    }
    return pkg
  }

  module.exports = { hooks: { readPackage } }
  ```

- **A Vite helper for the bundler.** A function that returns step 3's settings while linked and `{}` otherwise, merged into each Vite and Vitest config with `mergeConfig(config, kilnLink())`.
- **The TypeScript condition, always on.** `customConditions: ["kiln-dist"]` can stay committed, because published packages don't have the condition.
- **The lockfile, saved and restored.** Linking rewrites `pnpm-lock.yaml`, so `kiln:link` copies the unlinked lockfile into `.kiln-link/` and `kiln:unlink` puts it back before reinstalling. A lint step that fails while the lockfile contains `link:` catches a linked lockfile on its way into a commit.

When the app work is done, open the Kiln pull request with a changeset for each change. Once it's released, unlink (or undo steps 2 to 4) and update the app to the published versions.

## Conventions

- **Conventional Commits.** Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(eslint-config): add the node preset`. A `commit-msg` hook runs commitlint to check this.
- **Formatted and linted on commit.** A `pre-commit` hook (Lefthook) runs Prettier and ESLint on staged files and fixes what it can.
- **One idea per pull request.** Keep unrelated changes in separate pull requests.
- **No warnings.** Every ESLint rule is either an error or off.
- **Design standards are binding.** [`DESIGN.md`](DESIGN.md) and [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md) are binding for UI work, and [`packages/forms/AGENTS.md`](packages/forms/AGENTS.md) for forms work. Change a rule only together with the lint rule or test that enforces it.
- **Decisions are recorded.** Significant decisions live in [`docs/adr/`](docs/adr/). To change one, add a new record that supersedes it rather than editing the old one.
- **Written as if public.** No secrets, internal URLs or private project details in code, docs or commit messages.

## Changesets

Every pull request that changes a published package needs a changeset describing the change, so the package gets the right version bump and changelog entry ([ADR 0008](docs/adr/0008-versioning-and-release.md)). Packages version independently.

To add one, run this from the repo root and commit the file it creates in `.changeset/`:

```sh
pnpm changeset
```

It asks which packages changed, the bump for each (`patch`, `minor` or `major`), and a summary. The summary becomes the changelog entry, so write it for the people who use the package. To skip the prompts, pass everything as flags:

```sh
pnpm changeset --minor @mitcsutt/kiln-eslint-config -m "Add the node preset"
```

The `Changeset` CI job fails when a pull request changes a published package without adding a changeset. Changes that only touch tests (`test/`, `*.test.*`), stories (`*.stories.*`) or docs examples (`*.examples.*`) don't count. If a change needs no release, such as a README typo, add an empty changeset instead: `pnpm changeset --empty`. `pnpm changeset status --since=origin/main` runs the same check locally once your changeset is committed.

While packages are on `0.x`, a breaking change is a `minor` bump. Rule changes in the config packages are semver changes: a new error-level ESLint rule is a minor or major bump, never a patch.

You don't bump versions or edit changelogs by hand. [`docs/releasing.md`](docs/releasing.md) covers how changesets become releases.

## Reporting bugs and security issues

Open an [issue](https://github.com/mitcsutt/kiln/issues/new/choose) for bugs and feature requests. Report security problems privately, as described in [SECURITY.md](SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
