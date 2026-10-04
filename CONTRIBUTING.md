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
packages/
  ui/                @mitcsutt/kiln-ui
  eslint-config/     @mitcsutt/kiln-eslint-config
  prettier-config/   @mitcsutt/kiln-prettier-config
  tsconfig/          @mitcsutt/kiln-tsconfig
  testing-react18/   private test fixture for the React 18 test pass (never published)
docs/
  adr/               architecture decision records
  target-state.md    what the repo looks like when the first body of work is done
DESIGN.md            the design system's principles, anti-slop rules and token contract
vite.library.ts      the library build every runtime package shares
size-report.ts       size budgets and tree-shaking checks for built packages
```

Directories use the short name (`packages/tsconfig`), and the package name carries the brand (`@mitcsutt/kiln-tsconfig`).

## Commands

Run these from the repo root. Turborepo runs each one across the workspace and caches the results.

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `pnpm lint`          | ESLint in every package and at the root, plus `prettier --check`     |
| `pnpm typecheck`     | `tsc --noEmit` in every package and at the root                      |
| `pnpm test`          | Vitest in every package                                              |
| `pnpm build`         | Builds every package that has a build step                           |
| `pnpm test:react18`  | The runtime packages' test suites again, on React 18.3               |
| `pnpm check:package` | `publint` and `@arethetypeswrong/cli` on each packed package         |
| `pnpm size`          | Size report against each package's budgets, with tree-shaking checks |
| `pnpm format`        | Formats the whole repo with Prettier                                 |

To work on one package, filter to it, for example `pnpm turbo run test --filter=@mitcsutt/kiln-eslint-config`.

CI runs all of these except `format` on every pull request and on `main`, and they must all pass. On a pull request it also comments the size report, compared with the base branch.

## Conventions

- **Conventional Commits.** Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(eslint-config): add the node preset`. A `commit-msg` hook runs commitlint to check this.
- **Formatted and linted on commit.** A `pre-commit` hook (Lefthook) runs Prettier and ESLint on staged files and fixes what it can.
- **One idea per pull request.** Keep unrelated changes in separate pull requests.
- **No warnings.** Every ESLint rule is either an error or off.
- **Design standards are binding.** [`DESIGN.md`](DESIGN.md) and [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md) are binding for UI work. Change a rule only together with the lint rule or test that enforces it.
- **Decisions are recorded.** Significant decisions live in [`docs/adr/`](docs/adr/). To change one, add a new record that supersedes it rather than editing the old one.
- **Written as if public.** No secrets, internal URLs or private project details in code, docs or commit messages.

## Changesets

Every pull request that changes a published package needs a changeset describing the change, so the package gets the right version bump and changelog entry ([ADR 0008](docs/adr/0008-versioning-and-release.md)). Packages version independently.

Rule changes in the config packages are semver changes: a new error-level ESLint rule is a minor or major bump, never a patch.

## Reporting bugs and security issues

Open an [issue](https://github.com/mitcsutt/kiln/issues/new/choose) for bugs and feature requests. Report security problems privately, as described in [SECURITY.md](SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
