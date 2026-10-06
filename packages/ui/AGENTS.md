# packages/ui: `@mitcsutt/kiln-ui`

The themeable component system. **Read the root [`DESIGN.md`](../../DESIGN.md) first**: it defines the principles, the anti-slop rules, the token contract and the themes. This file is how to _build_ in here. Both are binding standards ([ADR 0012](../../docs/adr/0012-design-standards.md)); change a rule only together with the lint rule or test that enforces it.

## Layout

```
src/
  index.ts                 public barrel: the entry consumers use (plus theme/script.ts as ./theme-script)
  styles/index.css         base stylesheet: layer order + fonts + tokens + reset + Paper
  tokens/                  foundation.css (derived scales) · base.css (reset) · fonts.css (Golos Text, Atkinson Hyperlegible Mono) · one fonts-<preset>.css per preset (monograph, fiesta, ledger, flightdeck, riso) · fonts-martian-mono.css (monograph and fiesta)
                           · responsive-props.css (non-inheriting responsive inputs)
  themes/                  paper.css (default, in the base) · monograph.css · ledger.css · fiesta.css · flightdeck.css · riso.css (opt-in presets); tells.test.ts enforces DESIGN.md's second-order tells (monograph and fiesta are exempt)
  theme/                   ThemeProvider, ThemeScope, useTheme, themeScript, THEMES
  icons/                   createIcon + the ~20 built-in glyphs
  utils/                   cx · responsive (Responsive<T>, responsiveVars) · tokens (Space, Tone…) · heading
  assets/fonts/            self-hosted variable fonts + their OFL licences
  components/<group>/<Name>/
    <Name>.tsx             component (named export, forwardRef)
    <Name>.module.css      styles (CSS Module, UNLAYERED: see below)
    <Name>.test.tsx        behaviour tests (Vitest + Testing Library)
    <Name>.stories.tsx     Storybook stories (title 'UI/<Group>/<Name>')
    <Name>.examples.tsx    docs examples, one named export each (see "Examples" below)
    index.ts               re-exports component + types
  docs/                    foundation stories (tokens, type, space), pattern stories, and guide
                           examples with no single owner (<topic>.examples.tsx, named by path)
  test/                    Vitest setup and test helpers
```

Groups: `layout`, `typography`, `actions`, `inputs`, `display`, `navigation`, `feedback`, `overlays`. Reference implementations to copy: **`actions/Button`** (variants, tones, data-attributes, `asChild`, component tokens) and **`layout/Stack`** (responsive props).

## Rules for every component

**API**

- Named export, `forwardRef`, `displayName` implied by the named function. Must work on **React 18 and 19** ([ADR 0004](../../docs/adr/0004-react-18-and-19.md)): `forwardRef`, no `use()`, no ref-as-prop, no React 19-only APIs. The test suite runs on both.
- Extend the right native props (`HTMLAttributes<HTMLDivElement>`, `ButtonHTMLAttributes`…) and spread `...rest` onto the root. Always accept and merge `className` and `style` (`mergeStyles(vars, style)`).
- Visual choices are **typed props**, never style knobs: `variant`, `tone: Tone`, `size: Size`, `gap: Responsive<Space>`, `width: Width`. No `color="#…"`, no `px` numbers, no `sx`.
- Layout props that make sense per breakpoint are `Responsive<T>`; map them with `responsiveVars('<name>-<prop>', value, toCss)` and resolve in CSS exactly like Stack. **Register the 5 inputs** (`--<name>-<prop>-{base,sm,md,lg,xl}`) as non-inheriting in `src/tokens/responsive-props.css`, otherwise nested instances inherit the parent's value. `utils/responsive-registry.test.ts` fails if you forget.
- Structural components accept `VisibilityProps` (`hideBelow`/`hideAbove`) via `visibilityClass()` from `#utils/visibility`, never app-level media queries.
- Breakpoints are **viewport** media queries. Don't make components size containers (`container-type`): layout containment traps `position: fixed` descendants.
- Polymorphism: `asChild` (Radix `Slot`) for anything that may be a link or a router link; a narrow typed `as` union for structural elements (Stack, Section, Text, Heading). Heading elements come from `headingTag(level)` in `#utils/heading`.
- Compound components (`Card.Title`, `Table.Row`) only when a component has real slots. Attach subcomponents with `Object.assign(Root, { Title, Body })`.
- Controlled + uncontrolled for anything stateful (`value`/`defaultValue`/`onValueChange`, Radix naming). Keep the latest callback with `useLatest` from `#components/inputs/internal/useLatest`, never by writing a ref during render.
- Accessible by construction: correct roles, labels wired with `useId`, keyboard support (Radix primitives for anything with focus management: menus, dialogs, tabs, selects, popovers, tooltips, accordions, toggles, switches, checkboxes, radios, sliders).
- Import Radix from the unified package: `import { Dialog } from 'radix-ui'`.
- Internal imports use `#` subpaths: `#utils/cx`, `#components/feedback/Spinner`, `#icons`. Never `../../`. Never import from `src/index.ts` inside the package.
- Theme names are open: `ThemeName` is any string, and nothing at runtime checks it against `THEMES`.

**CSS**

- One `<Name>.module.css` per component, camelCase class names, **unlayered** (no `@layer` wrapper: a layered rule loses to any consumer reset like `button{color:inherit}`). The build names classes `kiln-<File>__<local>`.
- Style state and variants through **data attributes** set by the component (`data-variant`, `data-size`, `data-tone`, `data-state` from Radix), not extra classes. This is also the theming hook.
- Only tokens: `var(--space-*)`, `var(--color-*)`, `var(--tone-*)`, `var(--radius-*)`, `var(--text-*)`, `var(--font-*)`, `var(--dur-*)`, `var(--ease-*)`, `var(--shadow-*)`, `var(--border-width)`. **No hex/rgb/hsl/oklch literals, no raw ms, no raw px** except hairline geometry (1px/2px offsets inside a token-driven border) and icon/glyph sizes.
- Private variables are prefixed `--_` and defined on the element that uses them **or on its own component root** (a slot may read its root's `--_c`). Never read another component's `--_x`: they inherit, so a nested component would see its parent's. **Never read a private var with a fallback** (`var(--_gap, 0)`): give it a default on the element instead (`.list { --_gap: …; }`), so an ancestor's `--_gap` can't leak in. `utils/css-conventions.test.ts` enforces this, the no-`@layer` rule, and `[hidden]` winning on every layout root that sets `display`.
- Expose a few **component tokens** where a theme might plausibly diverge, always with a fallback: `border-radius: var(--card-radius, var(--radius-surface))`. List them in a comment at the top of the module.
- Typography roles: headings use `--heading-font/-weight/-tracking/-transform`; display sizes use `--display-*`; numbers use `--font-numeric` + `font-variant-numeric: tabular-nums lining-nums` + `font-stretch: var(--numeric-stretch)`; labels use `--label-*`.
- Mobile-first media queries at `40em / 48em / 64em / 80em`.
- Motion: transitions use `--dur-*`/`--ease-*` only; add a `prefers-reduced-motion` branch for any keyframe animation.
- Borders: `var(--border-width) solid var(--color-line)`. Soft shadows only on floating layers (`--shadow-float`, `--shadow-overlay`). Surfaces that may "stand" use `--shadow-surface` (none in Paper, Monograph, Ledger, Flightdeck and Riso; the print offset in Fiesta, a legacy preset. A new theme never sets a hard offset on a static surface, per DESIGN.md §2). Pressed controls travel `--active-shift` toward `--shadow-active`.
- Focus: `outline: 2px solid var(--color-focus); outline-offset: 2px` on `:focus-visible`.

**Themes**

- A theme sets every token in DESIGN.md §3.2 and nothing else. `themes/themes.test.ts` fails if one theme sets a token the others neither set nor reset (a leak into nested scopes), and `themes/contract.test.ts` fails if DESIGN.md's contract and `paper.css` drift apart.
- Paper lives in the base stylesheet; presets are separate files that declare the layer order and import their own fonts.

**Stories** (`<Name>.stories.tsx`)

- Story-level `globals` _lock_ the toolbar in Storybook 10. To show a component in a specific theme/mode, add explicit stories (e.g. "Table, night") rather than meta-level globals.
- `title: 'UI/<Group>/<Name>'` ([ADR 0010](../../docs/adr/0010-information-architecture.md)), `component`, `args`, a `Playground` story plus stories that show real use (hierarchy, tones, sizes, states, composition). `satisfies Meta<typeof X>`.
- Realistic, invented content (specific names, amounts, places), sentence case, no lorem ipsum, no emoji, nothing copied from a real product.
- Import siblings via `#components/...`; never inline-style the component under test (story-only layout wrappers should use `Stack`/`Inline`/`Grid` where they exist).
- Stories must look right in **every theme, light and dark**.
- Every story is also a browser test in `apps/storybook` (`pnpm test:storybook`, [ADR 0018](../../docs/adr/0018-storybook-workbench.md)): it must render, its `play` function must pass, and axe must find no violations, in every theme and mode. An interactive component should have a story whose `play` function drives its main interaction. Turn off an axe rule only on the one story that needs it, with the reason beside it.

**Examples** (`<Name>.examples.tsx`, [ADR 0025](../../docs/adr/0025-colocated-examples.md))

- The code readers copy from the docs site. Each named export is one example (`Usage` for the default); a page renders it with `<Example of="<Name>" name="<Export>" />`, and shows only the slice of the file that export needs.
- Only imports and declarations at the top level, imports only from packages (`@mitcsutt/kiln-ui`, `react`, never `#…` or relative), and only examples exported. Shared helpers are plain unexported declarations. Lint enforces all three.
- Storybook runs each example as a story under `UI/<Group>/<Name>/Examples` ([ADR 0026](../../docs/adr/0026-docs-examples-in-storybook.md)), so the story rules above apply: invented content, right in every theme and mode, no axe violations.

**Tests** (`<Name>.test.tsx`): behaviour, not snapshots: roles/labels, keyboard, controlled/uncontrolled state, data attributes, ref forwarding, responsive var mapping. `vi`, `describe`, `it`, `expect` are globals. Use `must()` from `#test/must` for a node a test needs to exist, rather than a `!` assertion.

## Lint

The root `eslint.config.js` applies `base`, `react` and `storybook` from `@mitcsutt/kiln-eslint-config` here, type-aware, with no warnings. Three rules are scoped off or configured for this package, and why is recorded in [ADR 0015](../../docs/adr/0015-kiln-ui-port.md): compound components turn off `react-refresh/only-export-components`; tests may query the DOM directly (the data attributes and slots they assert on are the theming contract); and `<ul role="list">` and a focusable scrolling `<pre>` are allowed. Anything else that needs an exception gets an `eslint-disable-next-line` with a reason on the line above.

## Adding a component checklist

1. Folder + 6 files as above.
2. Export from `src/index.ts` in its group section (component + prop types).
3. `pnpm --filter @mitcsutt/kiln-ui typecheck && pnpm --filter @mitcsutt/kiln-ui test && pnpm --filter @mitcsutt/kiln-ui lint`.
4. Look at it in every theme × mode.
5. If it introduced a new idea (component token, pattern), note it in the root `DESIGN.md`.

## Commands

```bash
pnpm --filter @mitcsutt/kiln-ui test            # Vitest on React 19
pnpm --filter @mitcsutt/kiln-ui test:react18    # the same suite on React 18.3
pnpm --filter @mitcsutt/kiln-ui typecheck       # tsc --noEmit
pnpm --filter @mitcsutt/kiln-ui lint            # eslint
pnpm --filter @mitcsutt/kiln-ui build           # dist/ for publishing (not needed in the workspace)
pnpm --filter @mitcsutt/kiln-ui check:package   # publint + @arethetypeswrong/cli on the packed tarball
pnpm --filter @mitcsutt/kiln-ui size            # size report against size.config.json budgets
```

## Don'ts

- No Tailwind, no CSS-in-JS, no global class names, no `!important` (reduced-motion reset excepted).
- No `any`, no `@ts-ignore` (a narrowly scoped `@ts-expect-error` with a reason is allowed for polymorphic refs).
- Don't add theme-specific logic to components (`if (theme === 'riso')`). If a theme needs something different, add a component token.
- Don't add dependencies without an ADR. Runtime dependencies today: `radix-ui` only.
