# Target state

This document defines what this repository looks like when the first body of work is **done**. It describes outcomes and acceptance criteria. It doesn't set an order of work or prescribe how to build anything: the implementer chooses the approach, as long as the end state meets every criterion below and doesn't contradict an ADR.

Decisions and their reasoning live in [`adr/`](adr/). When this document and an ADR disagree, the ADR wins, and this document gets fixed.

**Done means release-ready, not released.** Every package builds, CI is green, and the release pipeline is configured, so publishing `0.1.0` and deploying the sites are each one action away. Neither of those actions is part of this work. See [Out of scope](#out-of-scope).

---

## 1. Source material

The UI and forms code comes from the `mitchell-sutton` monorepo, pinned at **`origin/main` @ `0fc4294`**. It is a plain copy with no git history ([ADR 0002](adr/0002-port-by-copy.md)).

| Source path @ `0fc4294`                                | Becomes                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `packages/ui` (`@repo/ui`, "Press")                    | `packages/ui` (`@mitcsutt/kiln-ui`)                                                                        |
| `packages/forms` (`@repo/forms`)                       | `packages/forms` (`@mitcsutt/kiln-forms`)                                                                  |
| `packages/testing-react18`                             | Whatever the React 18 test pass needs ([ADR 0004](adr/0004-react-18-and-19.md))                            |
| `packages/eslint-config`, `packages/typescript-config` | Inputs to the new config packages, not copied as they are ([ADR 0007](adr/0007-shared-config-packages.md)) |

Read these source documents before porting. They describe how the code works and why:

- `DESIGN.md`: principles, anti-slop rules, token contract, themes, component catalogue
- `packages/ui/CLAUDE.md`: component authoring rules
- `packages/forms/CLAUDE.md`: forms architecture, adding fields and layouts, view mode, schema registries
- `docs/decisions/009-unified-design-system.md`, `docs/decisions/010-forms-architecture.md`
- `docs/superpowers/specs/2026-09-28-forms-design.md`: forms spec, including the appendix "Decisions during build"

Nothing app-specific comes across: no budget, portfolio or sweepstake code, copy or patterns.

---

## 2. Repository shape

Here is the shape of the end state. Top-level names are fixed. Anything below them is the implementer's call unless an ADR says otherwise.

```
kiln/
  apps/
    docs/              Fumadocs (Next.js) public docs site
    storybook/         Storybook developer workbench
  packages/
    ui/                @mitcsutt/kiln-ui
    forms/             @mitcsutt/kiln-forms
    eslint-config/     @mitcsutt/kiln-eslint-config
    prettier-config/   @mitcsutt/kiln-prettier-config
    tsconfig/          @mitcsutt/kiln-tsconfig
  docs/
    adr/               decision records
    target-state.md    this file
  .changeset/  .github/  AGENTS.md  CLAUDE.md  DESIGN.md  README.md  LICENSE
  CONTRIBUTING.md  SECURITY.md  CODE_OF_CONDUCT.md
```

Package directories are short (`packages/ui`), and package names carry the brand (`@mitcsutt/kiln-ui`). Packages added later follow the same pattern: `packages/<name>` publishes as `@mitcsutt/kiln-<name>`.

---

## 3. Packages

### `@mitcsutt/kiln-ui`

- Every component in the source catalogue is ported, along with its CSS Module, tests and stories.
- **Renames** ([ADR 0002](adr/0002-port-by-copy.md)):
  - "Press" becomes "Kiln" everywhere: generated class names (`kiln-<file>__<local>`), cascade layers (`kiln.reset`, `kiln.tokens`, `kiln.themes`), any `--press-*` custom properties, comments, docs and branding. `rg -i press` over the package finds nothing related to the old name.
  - The component group `components/forms/` becomes `components/inputs/`.
- **Themes** ([ADR 0003](adr/0003-theming-model.md)):
  - `paper` is the new neutral default. It's applied when no theme is set.
  - `monograph` is ported from source `studio`, `ledger` from source `ledger`, and `fiesta` from source `fiesta`. `monograph` and `fiesta` are kept unchanged for compatibility.
  - `flightdeck` and `riso` are added presets, and `paper` and `ledger` are reworked, per [ADR 0030](adr/0030-theme-family-without-ai-tells.md), to avoid the second-order AI tells. Six themes ship in all.
  - Each preset is an opt-in stylesheet import (for example `@mitcsutt/kiln-ui/themes/fiesta.css`). The default stylesheet contains no preset.
  - The theme registry, `ThemeProvider`, `ThemeScope`, `useTheme` and `themeScript` know about `paper` and the presets. They also accept a consumer-defined theme name without a type error or runtime failure.
  - The token contract is documented well enough for a consumer to write a complete theme from scratch without reading Kiln's source.
- **Fonts:** self-hosted fonts ship with their licence files. Every font a theme references is either bundled or documented as something the consumer supplies.
- **Runtime dependencies:** still only `radix-ui`. React and React DOM are peer dependencies.

### `@mitcsutt/kiln-forms`

- The whole package is ported, including both authoring modes, every field, layout and hook, view mode, `schema/core` and `schema/render`, and its test harness (`runFieldConformance`, renderForm, axe and perf helpers).
- `@mitcsutt/kiln-ui` is a peer dependency, so nothing ever ships a second copy of the UI.
- Two entry points: `.` and the React-free `./schema`. Importing `@mitcsutt/kiln-forms/schema` in plain Node, with no React installed, works and is covered by a test.
- **Name collisions:** some exports in the source share names with `ui` (`AmountField`, `NumberField`, `PasswordField`, `SwitchField`, `ComboboxField`, `TagsField`, `FileField`, `FieldLayout`). By the end state these are resolved so a consumer who imports both packages can't auto-import the wrong one. The resolution is recorded in an ADR.
- No CSS in the package. It renders only through `kiln-ui`.

### `@mitcsutt/kiln-eslint-config`

A flat config with composable exports, at least `base`, `react` and `storybook` (plus `node` if Kiln itself needs it). It covers the baseline in [ADR 0007](adr/0007-shared-config-packages.md), and Kiln's own workspace lints with it.

### `@mitcsutt/kiln-prettier-config`

Implements the style in [ADR 0007](adr/0007-shared-config-packages.md). Every package and app in Kiln formats with it, and `prettier --check .` passes at the root.

### `@mitcsutt/kiln-tsconfig`

Presets for at least `base`, `react`, `library` and `app`. Every package and app in Kiln extends one of them.

### Every published package

- Has a `README.md` with its install line, a minimal usage example, and a link to the docs site.
- Declares `license`, `repository` (with `directory`), `homepage`, `bugs`, `keywords`, `engines`, `files` and `publishConfig.access: public`.
- Starts at version `0.1.0`, unpublished.

---

## 4. Build and bundling ([ADR 0005](adr/0005-library-build.md))

- `ui` and `forms` build with the same Vite library-mode setup: ESM only, `preserveModules`, `.d.ts` output, and source maps.
- **For consumers:**
  - Importing a single component pulls in only that component's JS and its dependencies. A bundler test or size report proves this.
  - `sideEffects` is accurate.
  - The `exports` map is correct for types and runtime under `moduleResolution` `bundler` and `node16`.
  - `publint` and `@arethetypeswrong/cli` pass with no errors.
- **CSS:**
  - The base stylesheet and each theme preset are separate files.
  - Global tokens and resets live in named cascade layers. Component CSS is unlayered, as the source does it.
- **Size:** a size report exists, and CI posts the change on each PR. Budgets are set for the base stylesheet, a single typical component (for example `Button`), and `forms` core.
- **For development:** inside the workspace, apps and packages use package source directly (no prebuild needed for `dev`, tests or typecheck). `dist/` is used only at publish. Turborepo caching works for `build`, `test`, `lint` and `typecheck`, and a no-op second run hits the cache for everything.

---

## 5. Quality gates

These run in GitHub Actions on every PR and on `main`, and are all green:

- [ ] `lint`: ESLint (the Kiln config, type-aware) and `prettier --check`
- [ ] `typecheck`: every package and app
- [ ] `test`: Vitest, run once on React 19 and once on React 18
- [ ] `build`: every package and both apps
- [ ] `publint` and `attw` on every publishable package
- [ ] Size report against the budgets
- [ ] Storybook builds, and its interaction and a11y tests pass
- [ ] Docs site builds, with no broken internal links
- [ ] The convention tests carried over from source (the CSS rules, the responsive-prop registry, and keeping `schema/core` free of React) still pass

Local hooks: Lefthook runs format and lint on staged files, and commitlint enforces Conventional Commits.

---

## 6. Releasing ([ADR 0008](adr/0008-versioning-and-release.md))

- Changesets is configured with independent versions. Every PR that changes a published package needs a changeset, and CI enforces this.
- A release workflow exists. When it runs, it opens a "Version packages" PR and, once that PR is merged, publishes to npm with provenance. The workflow is written and checked as far as it can be without credentials (for example `changeset version` and `pnpm publish --dry-run` succeed), but it hasn't published anything.
- The workflow's prerequisites are documented, such as owning the npm scope and the npm token or trusted publishing setup.

---

## 7. Documentation

### Information architecture ([ADR 0010](adr/0010-information-architecture.md))

The docs site sidebar and the Storybook tree have the **same** nested structure:

```
UI/
  Foundations/   Tokens, Colour, Type, Spacing, Motion, Theming
  Actions/  Inputs/  Layout/  Display/  Navigation/  Feedback/  Overlays/  Typography/
  Themes/        Paper, Monograph, Ledger, Fiesta, Flightdeck, Riso
  Patterns/      generic compositions (e.g. dashboard, settings, checkout)
Forms/
  Getting started/  Fields/  Layouts/  Hooks/  Schema/
Tooling/
  ESLint config, Prettier config, TSConfig
```

`UI/Inputs` holds the unbound controls and `*Field` wrappers from `kiln-ui`. At the top level, `Forms` always means the `kiln-forms` library.

### Docs site, `apps/docs` ([ADR 0009](adr/0009-docs-and-storybook.md))

- Built with Fumadocs on Next.js, with the Kiln brand and visual identity (it's built with `kiln-ui`).
- Every component and every forms field, layout and hook has a page with:
  - a live, interactive preview rendered from the real package
  - a props/API table generated from the source types
  - copyable usage code
- **Theming:**
  - A theme switcher previews every page in all six themes (`paper`, `monograph`, `ledger`, `fiesta`, `flightdeck` and `riso`), in light and dark modes.
  - The "Theming" guide teaches someone to write a custom theme against the token contract.
- Getting-started guides exist for `ui`, `forms` (component mode and schema mode), and each config package.
- Has full-text search.
- **For agents:**
  - Serves `llms.txt` and `llms-full.txt`.
  - Every page is available as raw markdown.
- **Room for a form builder:** the site's architecture can host a future interactive form/schema builder as an ordinary route that uses `kiln-forms` and `kiln-forms/schema`. Nothing about the builder is built.
- Builds as a deployable artefact, without being deployed. The intended home is `kiln.mitchellsutton.com` on Vercel.

### Storybook, `apps/storybook`

- A developer workbench, not the public docs. Long-form prose lives on the docs site.
- Stories stay co-located with source (`<Name>.stories.tsx`), with titles nested by the tree above (for example `UI/Actions/Button`, `Forms/Fields/TextField`).
- Each component has a `Playground` story plus stories for real states.
- Theme and mode toolbar, including "All themes side by side".
- Interaction tests run through the Vitest addon, and the a11y addon reports no violations on any story.
- Patterns from the source that mirrored specific apps (Budget, PortfolioHome, Sweepstake) are replaced by generic patterns.
- Builds as a static artefact that can be served at `kiln.mitchellsutton.com/storybook`. It isn't deployed.

---

## 8. AI tooling ([ADR 0011](adr/0011-ai-tooling.md))

- **For consumers:** each of `kiln-ui` and `kiln-forms` ships skills in the layout TanStack Intent expects. A consumer project that runs `npx @tanstack/intent install` picks them up. The skills cover:
  - `ui`: installing and theming, composing layout with typed props, writing a custom theme, and the anti-slop rules
  - `forms`: component mode, schema mode, adding a custom field, validation, and view mode
- Skill content is generated from, or checked against, the same source as the docs site, so the two can't drift. CI fails if they do.
- **For contributors:** the repo has an `AGENTS.md` (with `CLAUDE.md` as a symlink) and project skills for adding a component, a theme preset, and a forms field.

---

## 9. Standards carried over ([ADR 0012](adr/0012-design-standards.md))

- `DESIGN.md` is ported to the repo root, renamed for Kiln and the new theme names, and states its principles, anti-slop rules and token contract as binding.
- The component authoring rules (source `packages/ui/CLAUDE.md`) and the forms rules (source `packages/forms/CLAUDE.md`) are ported as binding standards for their packages, updated for the new names.
- Wherever the source lints or tests a rule, the rule is enforced the same way in Kiln.

---

## 10. Ready to go public

The repo is private, but it's written as if it were already public:

- [ ] `README.md`: what Kiln is, a package table with npm and CI badges, a quick start, and links to the docs and Storybook
- [ ] `CONTRIBUTING.md`: setup, commands, conventions, and the changeset rule
- [ ] `SECURITY.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant), `LICENSE` (MIT)
- [ ] Issue and PR templates
- [ ] Nothing private or app-specific: no secrets, no internal URLs, no references to the source apps' business logic

---

## Out of scope

Each of these is a separate, later piece of work:

- Publishing any package to npm. Claiming the `@mitcsutt` scope is a prerequisite for it.
- Deploying the docs site or Storybook, and setting up the `kiln.mitchellsutton.com` domain.
- Migrating any consumer (`mitchell-sutton`, `world-cup-draw`) to Kiln.
- Building the form/schema builder.
- A shared Vitest preset, a Kiln CLI, or an MCP server.
- Making the repository public.
