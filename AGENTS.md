# Kiln

Kiln is a monorepo of published `@mitcsutt/kiln-*` packages: a themeable React design system (`kiln-ui`), a form library (`kiln-forms`), and shared ESLint, Prettier and TS configs. It also holds a Fumadocs docs site and a Storybook workbench.

## Orientation

- **Packages:** `@mitcsutt/kiln-ui` is in `packages/ui`: read `DESIGN.md` and `packages/ui/AGENTS.md` before touching it. `@mitcsutt/kiln-forms` is in `packages/forms`: read `packages/forms/AGENTS.md` before touching it. The config packages are in `packages/eslint-config`, `packages/prettier-config` and `packages/tsconfig`. Shared dependency versions live in the `pnpm-workspace.yaml` catalog.
- **Apps:** the Storybook workbench is in `apps/storybook` ([ADR 0018](docs/adr/0018-storybook-workbench.md)), and the Fumadocs docs site is in `apps/docs` ([ADR 0019](docs/adr/0019-docs-site.md)). Both follow the tree in `docs/tree.json`.
- **Docs:** docs examples are stories tagged `docs` in each export's `<Owner>.stories.tsx`, so Storybook runs every one, and the docs site shows them with their JSDoc captions and sliced code ([ADR 0028](docs/adr/0028-docs-stories.md)). Each component, field, layout and hook page is generated from its TSDoc and docs stories ([ADR 0029](docs/adr/0029-generated-reference-pages.md)); guides are MDX. The agent skills in `packages/*/skills` are generated from the docs pages: run `pnpm generate:skills` and never edit them by hand.
- **Project skills:** `.claude/skills/` has step-by-step procedures for adding a component, a theme preset and a forms field.
- **Commands** (from the root, Node from `.nvmrc`, pnpm through Corepack): `pnpm lint` (ESLint plus `prettier --check .`), `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:react18`, `pnpm test:storybook` (every story as a browser test, with interactions and axe; set `STORYBOOK_THEME`/`STORYBOOK_MODE` for another theme or mode), `pnpm check:links` (builds the docs site and checks every internal link), `pnpm check:package` (publint and attw), `pnpm check:skills`, `pnpm size` (budgets and tree-shaking checks), `pnpm format`. CI runs all but `format` on every PR (not on pushes to `main`), plus `pnpm changeset status` on PRs. Add a changeset with `pnpm changeset`.
- **Lint and format config:** one root `eslint.config.js` built from `@mitcsutt/kiln-eslint-config` serves every package; Prettier reads `@mitcsutt/kiln-prettier-config` from the root `package.json`. Every package `tsconfig.json` extends a `@mitcsutt/kiln-tsconfig` preset.

## Rules

- **`docs/adr/` holds the decisions.** Read the index before starting. If you need to depart from an ADR, add a new ADR that supersedes it, give the reasoning, and flag it in your PR. Never quietly diverge. A significant decision no ADR covers gets a new ADR too.
- **Evidence over assertion.** Claim something works only with the command and output that prove it (test counts, `publint`/`attw` output, build logs).
- **One idea per PR.** Use Conventional Commit titles, and add a changeset whenever a published package changes.
- **Write as if public.** No secrets, no internal URLs, and no private project details in code, docs or commit messages.
- **Standards are binding.** `DESIGN.md` and the per-package authoring guides are binding standards. Follow them, and change them only together with the lint rules or tests that enforce them.
- **Never publish or deploy.** Releases go through the release workflow ([`docs/releasing.md`](docs/releasing.md)). Publishing a new package for the first time is a separate, maintainer-triggered step, and the docs site deploys from `main` through its own workflow ([ADR 0034](docs/adr/0034-docs-on-cloudflare-workers.md)).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
