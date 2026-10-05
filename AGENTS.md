# Kiln

Kiln is a monorepo of published `@mitcsutt/kiln-*` packages: a themeable React design system (`kiln-ui`), a form library (`kiln-forms`), and shared ESLint, Prettier and TS configs. It also holds a Fumadocs docs site and a Storybook workbench.

## Current state

The workspace foundation is in place: a pnpm workspace (shared versions in the `pnpm-workspace.yaml` catalog), Turborepo, and the three config packages in `packages/eslint-config`, `packages/prettier-config` and `packages/tsconfig`. `@mitcsutt/kiln-ui` is ported to `packages/ui`: read `DESIGN.md` and `packages/ui/AGENTS.md` before touching it. `@mitcsutt/kiln-forms` is ported to `packages/forms`: read `packages/forms/AGENTS.md` before touching it. Changesets and the release workflow are configured (`docs/releasing.md`), with publishing switched off. The Storybook workbench is in `apps/storybook` ([ADR 0018](docs/adr/0018-storybook-workbench.md)), and the Fumadocs docs site is in `apps/docs` ([ADR 0019](docs/adr/0019-docs-site.md)); both follow the tree in `docs/tree.json`. Docs examples live beside the export they document as `<Owner>.examples.tsx`, and Storybook runs each as a story ([ADR 0025](docs/adr/0025-colocated-examples.md), [ADR 0026](docs/adr/0026-docs-examples-in-storybook.md)). Your job is to bring the repo to the end state in `docs/target-state.md`.

- **Commands** (from the root, Node from `.nvmrc`, pnpm through Corepack): `pnpm lint` (ESLint plus `prettier --check .`), `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:react18`, `pnpm test:storybook` (every story as a browser test, with interactions and axe; set `STORYBOOK_THEME`/`STORYBOOK_MODE` for another theme or mode), `pnpm check:links` (builds the docs site and checks every internal link), `pnpm check:package` (publint and attw), `pnpm size` (budgets and tree-shaking checks), `pnpm format`. CI runs all but `format` on every PR (not on pushes to `main`), plus `pnpm changeset status` on PRs. Add a changeset with `pnpm changeset`.
- **Lint and format config:** one root `eslint.config.js` built from `@mitcsutt/kiln-eslint-config` serves every package; Prettier reads `@mitcsutt/kiln-prettier-config` from the root `package.json`. Every package `tsconfig.json` extends a `@mitcsutt/kiln-tsconfig` preset.

- **`docs/target-state.md` is the spec.** It defines _done_ as acceptance criteria. Order, approach and tooling details are yours to choose, within its criteria.
- **`docs/adr/` holds the decisions.** Read the index before starting. If you need to depart from an ADR, add a new ADR that supersedes it, give the reasoning, and flag it in your PR. Never quietly diverge.
- **Decisions the target state leaves open** (for example how the forms/ui name collisions are resolved) get recorded as new ADRs too.
- **Done is release-ready, not released.** Never publish to npm and never deploy a site. Those are separate, human-triggered steps.

## Source material

The UI and forms code is ported from `github.com/mitcsutt/mitchell-sutton` at commit **`0fc4294`**. Read source files at that exact commit, either `git show 0fc4294:<path>` or a checkout of it, never a moving branch. `docs/target-state.md` §1 maps source paths to their destinations and lists the source docs to read before porting.

## Standing rules

- **Evidence over assertion.** Claim a criterion is met only with the command and output that prove it (test counts, `publint`/`attw` output, build logs).
- **One idea per PR.** Use Conventional Commit titles, and add a changeset whenever a published package changes.
- **Write as if public.** No secrets, no internal URLs, and no copy or logic from the source apps (budget, portfolio, sweepstake).
- **Standards are binding.** Once ported, `DESIGN.md` and the per-package authoring guides are binding standards. Follow them, and change them only together with the lint rules or tests that enforce them.

As the repo takes shape, replace the "Current state" section above with real commands, layout and conventions, so that this file always describes the repo as it is.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
