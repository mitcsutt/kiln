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
  eslint-config/     @mitcsutt/kiln-eslint-config
  prettier-config/   @mitcsutt/kiln-prettier-config
  tsconfig/          @mitcsutt/kiln-tsconfig
docs/
  adr/               architecture decision records
  target-state.md    what the repo looks like when the first body of work is done
```

Directories use the short name (`packages/tsconfig`), and the package name carries the brand (`@mitcsutt/kiln-tsconfig`).

## Commands

Run these from the repo root. Turborepo runs each one across the workspace and caches the results.

| Command          | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm lint`      | ESLint in every package and at the root, plus `prettier --check` |
| `pnpm typecheck` | `tsc --noEmit` in every package and at the root                  |
| `pnpm test`      | Vitest in every package                                          |
| `pnpm build`     | Builds every package that has a build step                       |
| `pnpm format`    | Formats the whole repo with Prettier                             |

To work on one package, filter to it, for example `pnpm turbo run test --filter=@mitcsutt/kiln-eslint-config`.

CI runs `lint`, `typecheck`, `test` and `build` on every pull request and on `main`. All of them must pass.

## Conventions

- **Conventional Commits.** Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(eslint-config): add the node preset`. A `commit-msg` hook runs commitlint to check this.
- **Formatted and linted on commit.** A `pre-commit` hook (Lefthook) runs Prettier and ESLint on staged files and fixes what it can.
- **One idea per pull request.** Keep unrelated changes in separate pull requests.
- **No warnings.** Every ESLint rule is either an error or off.
- **Decisions are recorded.** Significant decisions live in [`docs/adr/`](docs/adr/). To change one, add a new record that supersedes it rather than editing the old one.
- **Written as if public.** No secrets, internal URLs or private project details in code, docs or commit messages.

## Changesets

Every pull request that changes a published package needs a changeset describing the change, so the package gets the right version bump and changelog entry ([ADR 0008](docs/adr/0008-versioning-and-release.md)). Packages version independently.

Rule changes in the config packages are semver changes: a new error-level ESLint rule is a minor or major bump, never a patch.

## Reporting bugs and security issues

Open an [issue](https://github.com/mitcsutt/kiln/issues/new/choose) for bugs and feature requests. Report security problems privately, as described in [SECURITY.md](SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
