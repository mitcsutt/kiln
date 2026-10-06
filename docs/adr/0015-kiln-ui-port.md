# 0015. How `kiln-ui` was ported: theming, build and test details

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

[0002](0002-port-by-copy.md), [0003](0003-theming-model.md), [0004](0004-react-18-and-19.md) and [0005](0005-library-build.md) set the shape of the `ui` port. Doing it raised questions they leave open:

- how a consumer-defined theme name fits the theme types
- where the default theme and the fonts live
- what the build emits, and how CI proves it
- how the React 18 pass gets a consistent React 18
- how source written against a looser lint config meets Kiln's (0007, 0014)

## Decision

**Theming**

- `ThemeName` is `BuiltInThemeName | (string & Record<never, never>)`: built-in names autocomplete, and any other string type-checks. `ThemeProvider`, `ThemeScope`, `useTheme` and `themeScript` never check a name against `THEMES`. `themeScript` escapes `<`, so no theme name can close its `<script>`.
- `paper` is declared on `:where(:root)` as well as `[data-theme='paper']`. With no `data-theme` it's the theme; under a preset or a custom theme it supplies, at zero specificity, any token the other theme leaves out.
- Every Kiln stylesheet (base and preset) declares `@layer kiln.reset, kiln.tokens, kiln.themes;` first, so the order holds whichever file loads first.
- Renames beyond the class prefix and layers: `--press-shift` → `--active-shift`, `--shadow-press` → `--shadow-active` (the token names a state, not the old brand), `data-press-scope` → `data-kiln-scope`, `data-press-component` → `data-kiln-component`, and the stored colour-mode key → `kiln-color-mode`.
- DESIGN.md §3.2 and §3.3 are the written token contract. `themes/contract.test.ts` keeps them identical to what `paper.css` sets and to the optional-token reset list.

**Fonts**

- Every font is bundled, with its OFL licence in `dist/assets/fonts/licenses/`. The base stylesheet declares the three faces Paper, Monograph and Ledger use. Fiesta's two faces are declared in `themes/fiesta.css`, so they exist only for apps that import Fiesta. Browsers fetch a face only when it renders, so a declared but unused face costs nothing.

**Build**

- One Vite library setup, `vite.library.ts` at the repo root, shared like the root ESLint config. `forms` calls the same `defineLibraryConfig`.
- Component CSS stays in one `styles.css`, after the base stylesheet, as in the source. Per-component CSS files (allowed by 0005) aren't justified yet: the whole base stylesheet is 30 kB gzip, and per-component files would need every consumer's bundler to handle CSS imports from `node_modules`. The JS has no CSS imports, so `sideEffects: ["**/*.css"]` is accurate.
- Global stylesheets are bundled by hand (imports inlined, font URLs pointed at the copied assets, minified with Lightning CSS), because library mode would inline fonts as base64.
- Declarations come from `tsc`, then every specifier is rewritten to a relative `.js` path. That way the `#` subpath imports the source uses (and extensionless relative imports) resolve under `node16` as well as `bundler`.
- `publishConfig` swaps `exports` to `dist/` and empties `imports` at pack time. `check:package` packs with pnpm (npm would ignore `publishConfig`) and runs `publint --strict` and `attw --profile esm-only` on the tarball. The CSS subpaths are excluded from attw, because it can only check modules; publint checks that they exist.
- Size: `size-report.ts` at the root measures gzip sizes against budgets in each package's `size.config.json`. For single-component imports it bundles `import { X }` from `dist/` with Vite and fails if any bundled module is outside that component's own import graph. That's the tree-shaking proof. size-limit was considered, but it would need a second bundler to give the same proof. CI measures the base branch as well and comments the difference on the pull request.

**Tests**

- The React 18 pass resolves React from a private fixture package, `packages/testing-react18` (`@mitcsutt/kiln-testing-react18`, never published), as the source did: only a separate importer gets pnpm to resolve `react-dom@18`'s peer to React 18. `forms` reuses it. A test asserts each pass runs the React major it claims.
- jsdom stays on 26. From 27 it trims whitespace at element boundaries when computing accessible names ("GitHub(opens in new tab)"), which browsers don't do, and five source tests fail on it.

**Lint** (scoped to `packages/ui` in the root config, per 0014)

- `react-refresh/only-export-components` is off. Compound components (`Object.assign(Root, { Title })`) are the authoring standard, and Fast Refresh can't treat them as a boundary. A library module isn't an app's HMR boundary anyway.
- `testing-library/no-node-access` and `no-container` are off in tests. The data attributes, slots and class hooks those tests assert on are the theming contract, and most of them have no role to query by.
- `jsx-a11y/no-redundant-roles` allows `role="list"` on lists (Safari drops list semantics under `list-style: none`), and `jsx-a11y/no-noninteractive-tabindex` allows a focusable `<pre>` (a scrolling code block has to be reachable by keyboard).
- Every other finding was fixed in the code. The few remaining one-off exceptions carry an `eslint-disable-next-line` with the reason, for example the Combobox options, which an `aria-activedescendant` input drives.

**Content**

- Stories, tests and doc comments that described the source apps (their names, people, data and internals) were rewritten with invented, generic content. The photograph used by the Avatar, Card and Media stories was replaced with an illustrated SVG. The source's app-mirroring Patterns stories weren't ported.

## Consequences

- Consumers can name and ship their own theme without a type assertion, and a partial theme degrades to Paper instead of to unstyled.
- Renaming a token in §3.2 now fails a test until DESIGN.md changes with it, which makes the contract's semver surface visible in review.
- Per-component CSS remains open. If size reports show the base stylesheet is what consumers pay for, revisit it with measurements, as 0005 allows.
- Upgrading jsdom past 26 means updating those five tests (or jsdom fixing its accessible names).
