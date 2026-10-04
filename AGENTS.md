# Kiln

Kiln is a monorepo of published `@mitcsutt/kiln-*` packages: a themeable React design system (`kiln-ui`), a form library (`kiln-forms`), and shared ESLint, Prettier and TS configs. It also holds a Fumadocs docs site and a Storybook workbench.

## Current state

The repo is **plan only**. The code hasn't been ported or scaffolded yet. Your job is to bring the repo to the end state in `docs/target-state.md`.

- **`docs/target-state.md` is the spec.** It defines *done* as acceptance criteria. Order, approach and tooling details are yours to choose, within its criteria.
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
