---
name: custom-theme
description: Use when writing a new theme for @mitcsutt/kiln-ui, changing a theme's colours, fonts, radii, density, shadows or motion, setting component tokens, or theming one part of a page with ThemeScope. Covers the token contract, the starter theme file, cascade layers, light and dark values, fonts and checking contrast.
metadata:
  purpose: Write a complete theme as one CSS file against the token contract and select it like a built-in, with no component changes.
  type: core
  library: "@mitcsutt/kiln-ui"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/theming.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/tokens.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/colour.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/type.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/motion.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Write a custom theme

Write a complete theme as one CSS file against the token contract and select it like a built-in, with no component changes.

A Kiln theme is one CSS file. It sets the tokens in the [contract](references/tokens.md#the-theme-contract), and nothing else: no component changes, no JavaScript, no build plugin. This guide writes one from scratch. It's called Harbour, it lives in these docs (not in kiln-ui), and you can see it working below.

```tsx
import { Box, Button, Heading, Inline, Stack, Text, ThemeScope } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ThemeScope theme="harbour">
      <Box padding={6}>
        <Stack gap={4}>
          <Heading level={3} size="2xl">
            High water 06:42
          </Heading>
          <Text tone="muted">Next sailing to Kelso Bay boards at berth 3.</Text>
          <Inline gap={3}>
            <Button>Book a seat</Button>
            <Button variant="outline" tone="neutral">
              Tide table
            </Button>
          </Inline>
        </Stack>
      </Box>
    </ThemeScope>
  )
}
```

## 1. Start from one idea

Strong themes take one idea from their subject and apply it everywhere, with everything else quiet. Paper is an office that prints for everyone, on grey stock; Riso is a two-drum risograph zine. Harbour is _the tide table posted at a ferry terminal_. That idea decides the rest:

- **Colour**: sea-grey enamel neutrals (hue 225), one signal-orange accent like a channel buoy, sea-glass green for "you".
- **Type**: heavy upright signage for headings, and every figure in a monospaced face, because tide times are read down a column.
- **Shape**: squared enamel corners, firm hairlines, flat surfaces.
- **Motion**: brisk, no bounce.

If a choice can't be justified by the idea, leave it at the default. Write the one-line reason for each choice next to its value, and if you can't, change the choice. Pick at most two families and one accent.

Generated UI also converges on a second set of looks: a cream canvas with a terracotta accent, near-black with one acid accent, a mint canvas with forest green, hard-offset shadows on every card, and a short list of "distinctive" fonts. Kiln's newer themes (Paper, Ledger, Flightdeck and Riso) avoid all of them. Monograph and Fiesta predate these rules and keep their original design for compatibility, so don't take them as a model. Kiln's [DESIGN.md](https://github.com/mitcsutt/kiln/blob/main/DESIGN.md) lists them in full.

## 2. Copy the starter file

This is every token in the contract, set to Paper's values, under your theme's name. It's generated from Paper when the docs are built, so it's always complete. Rename `harbour` and save it as your theme's stylesheet.

```css
/* harbour.css: a theme for Kiln. Every token in the contract, starting from Paper. */
@layer kiln.reset, kiln.tokens, kiln.themes;

@layer kiln.themes {
  [data-theme='harbour'] {
    /* Type roles */
    --font-display: 'Golos Text', ui-sans-serif, system-ui, sans-serif;
    --font-text: 'Golos Text', ui-sans-serif, system-ui, sans-serif;
    --font-prose: 'Golos Text', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'Atkinson Hyperlegible Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
    --font-numeric: 'Golos Text', ui-sans-serif, system-ui, sans-serif;
    --type-base: 1rem;
    --display-scale: 1;
    --type-ratio: 1.25;
    --display-weight: 740;
    --display-style: normal;
    --display-stretch: 100%;
    --display-transform: none;
    --display-tracking: -0.025em;
    --display-opsz: 72;
    --heading-font: var(--font-display);
    --heading-weight: 650;
    --heading-tracking: -0.015em;
    --heading-transform: none;
    --label-weight: 600;
    --label-tracking: 0;
    --label-transform: none;
    --numeric-stretch: 100%;
    --mono-stretch: 87.5%;
    --leading-tight: 1;
    --leading-snug: 1.2;
    --leading-body: 1.55;
    --prose-size: 1.0625rem;
    --prose-leading: 1.6;

    /* Structure & temperament */
    --density: 1;
    --motion-scale: 1;
    --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --ease-spring: var(--ease-out);
    --icon-stroke: 1.5;
    --border-width: 1px;
    --border-width-strong: 2px;
    --radius-action: 0.25rem;
    --radius-field: 0.25rem;
    --radius-surface: 0.375rem;
    --radius-media: 0.125rem;
    --radius-chip: 999px;
    --radius-avatar: 50%;

    /* Colour */
    --color-canvas: light-dark(oklch(0.953 0.005 255), oklch(0.215 0.006 255));
    --color-surface: light-dark(oklch(0.995 0.002 255), oklch(0.26 0.006 255));
    --color-surface-sunken: light-dark(oklch(0.932 0.005 255), oklch(0.175 0.006 255));
    --color-surface-raised: light-dark(oklch(0.998 0.001 255), oklch(0.3 0.006 255));
    --color-surface-inverse: light-dark(oklch(0.25 0.045 258), oklch(0.93 0.004 255));
    --color-ink: light-dark(oklch(0.25 0.045 258), oklch(0.935 0.005 255));
    --color-ink-muted: light-dark(oklch(0.43 0.03 258), oklch(0.78 0.01 255));
    --color-ink-subtle: light-dark(oklch(0.515 0.02 258), oklch(0.68 0.01 255));
    --color-ink-inverse: light-dark(oklch(0.975 0.003 255), oklch(0.2 0.009 255));
    --color-line: light-dark(oklch(0.9 0.007 255), oklch(0.33 0.008 255));
    --color-line-strong: light-dark(oklch(0.79 0.008 255), oklch(0.47 0.01 255));
    --color-accent: light-dark(oklch(0.4 0.11 258), oklch(0.7 0.11 255));
    --color-accent-hover: light-dark(oklch(0.35 0.11 258), oklch(0.75 0.11 255));
    --color-accent-ink: light-dark(oklch(0.985 0.003 255), oklch(0.18 0.03 255));
    --color-accent-text: light-dark(oklch(0.4 0.11 258), oklch(0.82 0.08 255));
    --color-accent-soft: light-dark(oklch(0.935 0.03 255), oklch(0.3 0.04 255));
    --color-highlight: light-dark(oklch(0.925 0.045 230), oklch(0.33 0.045 235));
    --color-highlight-ink: var(--color-ink);
    --color-focus: light-dark(oklch(0.52 0.17 258), oklch(0.78 0.115 252));
    --color-selection: light-dark(oklch(0.88 0.06 230), oklch(0.42 0.07 240));
    --color-scrim: light-dark(oklch(0.2 0.03 255 / 0.4), oklch(0.08 0.01 255 / 0.66));
    --tone-positive: light-dark(oklch(0.52 0.12 150), oklch(0.75 0.13 150));
    --tone-positive-soft: light-dark(oklch(0.95 0.035 150), oklch(0.3 0.05 150));
    --tone-positive-text: light-dark(oklch(0.495 0.12 150), oklch(0.75 0.13 150));
    --tone-positive-ink: light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 150));
    --tone-caution: light-dark(oklch(0.635 0.133 78), oklch(0.81 0.13 80));
    --tone-caution-soft: light-dark(oklch(0.955 0.039 78), oklch(0.31 0.05 80));
    --tone-caution-text: light-dark(oklch(0.5 0.1 78), oklch(0.81 0.13 80));
    --tone-caution-ink: light-dark(oklch(0.2 0.04 78), oklch(0.18 0.04 80));
    --tone-critical: light-dark(oklch(0.55 0.19 25), oklch(0.68 0.16 25));
    --tone-critical-soft: light-dark(oklch(0.95 0.025 25), oklch(0.3 0.06 25));
    --tone-critical-text: light-dark(oklch(0.535 0.19 25), oklch(0.725 0.16 25));
    --tone-critical-ink: light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 25));
    --tone-info: light-dark(oklch(0.53 0.1 240), oklch(0.74 0.09 240));
    --tone-info-soft: light-dark(oklch(0.95 0.025 240), oklch(0.3 0.045 240));
    --tone-info-text: light-dark(oklch(0.505 0.1 240), oklch(0.74 0.09 240));
    --tone-info-ink: light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 240));
    --color-cat-1: light-dark(oklch(0.82 0.07 160), oklch(0.72 0.08 160));
    --color-cat-2: light-dark(oklch(0.82 0.07 300), oklch(0.72 0.08 300));
    --color-cat-3: light-dark(oklch(0.82 0.07 80), oklch(0.72 0.08 80));
    --color-cat-4: light-dark(oklch(0.82 0.07 235), oklch(0.72 0.08 235));
    --color-cat-5: light-dark(oklch(0.82 0.07 25), oklch(0.72 0.08 25));
    --color-cat-6: light-dark(oklch(0.82 0.07 130), oklch(0.72 0.08 130));
    --color-cat-7: light-dark(oklch(0.82 0.07 195), oklch(0.72 0.08 195));
    --color-cat-8: light-dark(oklch(0.82 0.005 255), oklch(0.72 0.006 255));
    --color-cat-ink: light-dark(oklch(0.21 0.03 258), oklch(0.2 0.02 255));

    /* Data */
    --color-seq-1: light-dark(oklch(0.93 0.03 230), oklch(0.32 0.05 255));
    --color-seq-2: light-dark(oklch(0.835 0.06 234.7), oklch(0.413 0.067 251.2));
    --color-seq-3: light-dark(oklch(0.74 0.084 239.3), oklch(0.507 0.081 247.3));
    --color-seq-4: light-dark(oklch(0.645 0.098 244), oklch(0.6 0.089 243.5));
    --color-seq-5: light-dark(oklch(0.55 0.098 248.7), oklch(0.693 0.089 239.7));
    --color-seq-6: light-dark(oklch(0.455 0.086 253.3), oklch(0.787 0.082 235.8));
    --color-seq-7: light-dark(oklch(0.36 0.062 258), oklch(0.88 0.068 232));
    --color-div-neg-3: light-dark(oklch(0.5 0.147 25), oklch(0.73 0.147 25));
    --color-div-neg-2: light-dark(oklch(0.65 0.105 25), oklch(0.59 0.105 25));
    --color-div-neg-1: light-dark(oklch(0.8 0.063 25), oklch(0.45 0.063 25));
    --color-div-mid: light-dark(oklch(0.93 0.005 255), oklch(0.33 0.006 255));
    --color-div-pos-1: light-dark(oklch(0.8 0.063 250), oklch(0.45 0.063 250));
    --color-div-pos-2: light-dark(oklch(0.65 0.105 250), oklch(0.59 0.105 250));
    --color-div-pos-3: light-dark(oklch(0.5 0.142 250), oklch(0.73 0.146 250));
    --color-cat-1-stroke: light-dark(oklch(0.57 0.081 160), oklch(0.8 0.092 160));
    --color-cat-2-stroke: light-dark(oklch(0.57 0.081 300), oklch(0.8 0.092 300));
    --color-cat-3-stroke: light-dark(oklch(0.57 0.081 80), oklch(0.8 0.092 80));
    --color-cat-4-stroke: light-dark(oklch(0.57 0.081 235), oklch(0.8 0.092 235));
    --color-cat-5-stroke: light-dark(oklch(0.57 0.081 25), oklch(0.8 0.092 25));
    --color-cat-6-stroke: light-dark(oklch(0.57 0.081 130), oklch(0.8 0.092 130));
    --color-cat-7-stroke: light-dark(oklch(0.57 0.081 195), oklch(0.8 0.092 195));
    --color-cat-8-stroke: light-dark(oklch(0.57 0.01 255), oklch(0.8 0.012 255));
    --chart-grid: light-dark(oklch(0.9 0.007 255), oklch(0.335 0.008 255));
    --chart-axis: light-dark(oklch(0.58 0.01 255), oklch(0.62 0.012 255));
    --chart-label: var(--color-ink-muted);
    --chart-tooltip-surface: var(--color-surface-raised);
    --chart-tooltip-border: var(--color-line-strong);
    --chart-tooltip-ink: var(--color-ink);
    --chart-focus: var(--color-focus);

    /* Edges & depth */
    --shadow-surface: none;
    --active-shift: 0px;
    --shadow-active: none;
    --shadow-float: 0 1px 2px oklch(0.2 0.04 258 / 0.1), 0 8px 24px -6px oklch(0.2 0.04 258 / 0.18);
    --shadow-overlay: 0 2px 4px oklch(0.15 0.04 258 / 0.12), 0 20px 56px -12px oklch(0.15 0.04 258 / 0.32);
    --shadow-lift: 0 2px 4px oklch(0.2 0.04 258 / 0.12), 0 16px 36px -8px oklch(0.2 0.04 258 / 0.28);
    --canvas-image: none;
  }
}
```

Three things about its shape matter:

- **The first line declares Kiln's layer order.** Every Kiln stylesheet does, so the order holds whichever file loads first.
- **Tokens live in the `kiln.themes` layer.** Layered rules lose to unlayered ones, so your app's own CSS still wins over the theme.
- **The selector is your theme's name.** `[data-theme='harbour']` is what `ThemeProvider` and `ThemeScope` write. Don't add `:root`: Paper already covers the document root at zero specificity.

## 3. Change the values

Work through the file group by group. Keep every token; a theme that leaves one out inherits it from whatever scope it's nested in, which differs from page to page.

**Colour.** Author in OKLCH, with each colour a `light-dark(<light>, <dark>)` pair, so the theme works in both modes with no extra file. Tint the neutrals toward your hue with a little chroma (0.004 to 0.02). Check contrast: `--color-ink-subtle` must still meet AA on sunken and raised surfaces, and `--color-accent-text` must meet AA on the canvas.

```css
--color-canvas: light-dark(oklch(0.965 0.006 225), oklch(0.2 0.012 230));
--color-accent: light-dark(oklch(0.6 0.17 42), oklch(0.72 0.15 48));
--color-highlight: light-dark(oklch(0.93 0.04 175), oklch(0.33 0.05 178));
```

**Type.** Assign families to roles, then set the temperament: the base size, the ratio between steps, the display weight and tracking.

```css
--font-numeric: 'Atkinson Hyperlegible Mono', ui-monospace, monospace;
--numeric-stretch: 87.5%;
--display-weight: 780;
--type-ratio: 1.22;
```

**Structure.** `--density` multiplies every space step and control height; `--motion-scale` multiplies every duration. Radii are roles, so actions, fields, surfaces and avatars can each have their own.

**Depth.** Decide what an edge is. Flat themes set `--shadow-surface: none` and keep soft shadows for floating layers only; a hard offset belongs only on floating layers, and only when your subject explains it (Riso's misregistered second drum). Fiesta keeps its hard offset on static surfaces as a legacy preset; don't copy that.

The whole Harbour file is in the repository at [`apps/docs/src/styles/harbour.css`](https://github.com/mitcsutt/kiln/blob/main/apps/docs/src/styles/harbour.css).

## 4. Load it and select it

Import your theme after Kiln's stylesheet (`import './harbour.css'` on the next line: your bundler loads your own CSS as it does any other), then name it. `ThemeName` accepts any string, so there's no type to extend and nothing to register:

```tsx title="app root"
import '@mitcsutt/kiln-ui/styles.css'
// import './harbour.css'
import { ThemeProvider } from '@mitcsutt/kiln-ui'

;<ThemeProvider theme="harbour">…</ThemeProvider>
```

For SSR without a flash, `themeScript('harbour')` works the same way as for a built-in. To theme one part of a page, use `ThemeScope`. It paints its own canvas, and portalled overlays opened inside it (dialogs, menus, tooltips) render in its theme:

```tsx
<ThemeScope theme="harbour">
  <TimetablePanel />
</ThemeScope>
```

`useTheme()` reads and changes the theme and mode from anywhere inside a `ThemeProvider`:

```tsx
const { theme, setTheme, mode, resolvedMode, setMode } = useTheme()
```

## 5. Load its fonts

Kiln ships only the faces its own themes use. Declare your theme's faces in the same file, with `font-display: swap`, and serve the files yourself:

```css title="harbour.css"
@font-face {
  font-family: 'Harbour Sign';
  src: url('./fonts/harbour-sign.woff2') format('woff2');
  font-weight: 400 900;
  font-display: swap;
}
```

Harbour itself uses only Golos Text and Atkinson Hyperlegible Mono, which Kiln's base stylesheet already loads. That's allowed too.

## 6. Check it everywhere

See it in the context where it'll fail first: everything, in both modes.


Then go through the component pages with your theme applied. A few things to look for:

- Focus rings on every control. Focus is `--color-focus`, and it should never look like an error.
- Text on the accent (`--color-accent-ink`) and on each solid tone (`--tone-*-ink`).
- A `Section surface="inverse"` band, where the colour roles flip.
- Numbers in a `Table` with `numeric` cells, and an `Amount` with `accounting`.
- `Dialog`, `Popover` and `DropdownMenu`, which use `--shadow-float` and `--shadow-overlay`.

## Optional and component tokens

When your idea needs something the contract doesn't cover, there are two more levels.

[Optional tokens](references/tokens.md#optional-theme-tokens) are set by only some themes, and every theme scope resets them, so they never leak into a nested theme. Ledger sets `--table-foot-rule`; Fiesta and Riso set the `--highlight-*-text` inks for text on their gold and sunflower rows, and Riso sets `--navlinks-current-bg` and `--navlinks-marker` for its current-page row.

Component tokens change one component without touching the rest. They're read with a fallback, so setting one is always safe:

```css
[data-theme='harbour'] {
  --button-radius: 0;
  --card-radius: var(--radius-field);
}
```

## Rules a theme follows

From [DESIGN.md](https://github.com/mitcsutt/kiln/blob/main/DESIGN.md), and they're how the built-in themes are reviewed:

- One idea, from the subject. Two families at most, and one accent.
- No gradients that don't encode data, no glow in dark mode, no indigo or violet primary.
- Every token in the contract, in light and dark.
- No theme logic in components. If a component can't express your idea, it needs a component token, not an `if (theme === 'harbour')`.

## References

Read a reference when its description matches the task:

- [Tokens](references/tokens.md): The three tiers of design tokens, the contract every theme fills in, and the axes that scope them.
- [Colour](references/colour.md): Tinted OKLCH neutrals, one accent, a highlight that means "you", and tones that carry status.
- [Type](references/type.md): Type roles a theme fills in, a modular scale with big display steps, and figures that line up.
- [Motion](references/motion.md): Three durations and three easings, scaled by the theme's temperament and collapsed for reduced motion.
