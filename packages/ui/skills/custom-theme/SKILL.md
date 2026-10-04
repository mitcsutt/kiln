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

export default function CustomTheme() {
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

Strong themes take one idea from their subject and apply it everywhere, with everything else quiet. Paper is a typeset proof; Fiesta is a screen-printed matchday poster. Harbour is _the tide table posted at a ferry terminal_. That idea decides the rest:

- **Colour**: sea-grey enamel neutrals (hue 225), one signal-orange accent like a channel buoy, sea-glass green for "you".
- **Type**: heavy upright signage for headings, and every figure in a monospaced face, because tide times are read down a column.
- **Shape**: squared enamel corners, firm hairlines, flat surfaces.
- **Motion**: brisk, no bounce.

If a choice can't be justified by the idea, leave it at the default. Pick at most two families and one accent.

## 2. Copy the starter file

This is every token in the contract, set to Paper's values, under your theme's name. It's generated from Paper when the docs are built, so it's always complete. Rename `harbour` and save it as your theme's stylesheet.

```css
/* harbour.css: a theme for Kiln. Every token in the contract, starting from Paper. */
@layer kiln.reset, kiln.tokens, kiln.themes;

@layer kiln.themes {
  [data-theme='harbour'] {
    /* Type roles */
    --font-display: 'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif;
    --font-text: 'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif;
    --font-prose: 'Newsreader', 'Iowan Old Style', Georgia, serif;
    --font-mono: 'Martian Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
    --font-numeric: 'Newsreader', 'Iowan Old Style', Georgia, serif;
    --type-base: 1rem;
    --display-scale: 1;
    --type-ratio: 1.25;
    --display-weight: 640;
    --display-style: normal;
    --display-stretch: 100%;
    --display-transform: none;
    --display-tracking: -0.04em;
    --display-opsz: 72;
    --heading-font: var(--font-display);
    --heading-weight: 620;
    --heading-tracking: -0.015em;
    --heading-transform: none;
    --label-weight: 560;
    --label-tracking: 0;
    --label-transform: none;
    --numeric-stretch: 100%;
    --mono-stretch: 87.5%;
    --leading-tight: 1;
    --leading-snug: 1.2;
    --leading-body: 1.55;
    --prose-size: 1.125rem;
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
    --radius-action: 0.375rem;
    --radius-field: 0.375rem;
    --radius-surface: 0.5rem;
    --radius-media: 0.25rem;
    --radius-chip: 0.375rem;
    --radius-avatar: 50%;

    /* Colour */
    --color-canvas: light-dark(oklch(0.976 0.004 85), oklch(0.188 0.005 85));
    --color-surface: light-dark(oklch(0.993 0.002 85), oklch(0.215 0.006 85));
    --color-surface-sunken: light-dark(oklch(0.955 0.005 85), oklch(0.165 0.005 85));
    --color-surface-raised: light-dark(oklch(0.997 0.002 85), oklch(0.245 0.006 85));
    --color-surface-inverse: light-dark(oklch(0.235 0.008 85), oklch(0.93 0.005 85));
    --color-ink: light-dark(oklch(0.215 0.008 85), oklch(0.935 0.005 85));
    --color-ink-muted: light-dark(oklch(0.435 0.008 85), oklch(0.755 0.006 85));
    --color-ink-subtle: light-dark(oklch(0.515 0.008 85), oklch(0.64 0.006 85));
    --color-ink-inverse: light-dark(oklch(0.965 0.004 85), oklch(0.2 0.008 85));
    --color-line: light-dark(oklch(0.9 0.005 85), oklch(0.3 0.006 85));
    --color-line-strong: light-dark(oklch(0.8 0.006 85), oklch(0.4 0.007 85));
    --color-accent: light-dark(oklch(0.25 0.008 85), oklch(0.92 0.005 85));
    --color-accent-hover: light-dark(oklch(0.34 0.008 85), oklch(0.84 0.006 85));
    --color-accent-ink: light-dark(oklch(0.975 0.004 85), oklch(0.2 0.008 85));
    --color-accent-text: light-dark(oklch(0.25 0.008 85), oklch(0.92 0.005 85));
    --color-accent-soft: light-dark(oklch(0.925 0.006 85), oklch(0.285 0.007 85));
    --color-highlight: light-dark(oklch(0.935 0.035 228), oklch(0.315 0.045 235));
    --color-highlight-ink: var(--color-ink);
    --color-focus: var(--color-ink);
    --color-selection: light-dark(oklch(0.88 0.06 228), oklch(0.42 0.07 235));
    --color-scrim: light-dark(oklch(0.22 0.008 85 / 0.4), oklch(0.07 0.005 85 / 0.66));
    --tone-positive: light-dark(oklch(0.52 0.11 155), oklch(0.72 0.12 158));
    --tone-positive-soft: light-dark(oklch(0.94 0.035 155), oklch(0.28 0.045 158));
    --tone-positive-text: light-dark(oklch(0.45 0.1 155), oklch(0.78 0.11 158));
    --tone-positive-ink: light-dark(oklch(0.985 0.01 155), oklch(0.18 0.03 158));
    --tone-caution: light-dark(oklch(0.74 0.14 78), oklch(0.8 0.13 85));
    --tone-caution-soft: light-dark(oklch(0.95 0.05 88), oklch(0.3 0.05 80));
    --tone-caution-text: light-dark(oklch(0.5 0.1 70), oklch(0.84 0.11 88));
    --tone-caution-ink: light-dark(oklch(0.22 0.04 70), oklch(0.2 0.04 80));
    --tone-critical: light-dark(oklch(0.54 0.19 25), oklch(0.68 0.17 24));
    --tone-critical-soft: light-dark(oklch(0.94 0.035 22), oklch(0.29 0.06 24));
    --tone-critical-text: light-dark(oklch(0.5 0.18 25), oklch(0.76 0.14 24));
    --tone-critical-ink: light-dark(oklch(0.985 0.01 22), oklch(0.18 0.03 24));
    --tone-info: light-dark(oklch(0.52 0.09 240), oklch(0.72 0.09 238));
    --tone-info-soft: light-dark(oklch(0.94 0.025 240), oklch(0.28 0.04 240));
    --tone-info-text: light-dark(oklch(0.46 0.09 240), oklch(0.78 0.08 238));
    --tone-info-ink: light-dark(oklch(0.985 0.01 240), oklch(0.18 0.03 240));
    --color-cat-1: light-dark(oklch(0.8 0.06 228), oklch(0.7 0.07 228));
    --color-cat-2: light-dark(oklch(0.8 0.07 160), oklch(0.7 0.08 160));
    --color-cat-3: light-dark(oklch(0.82 0.08 75), oklch(0.72 0.09 75));
    --color-cat-4: light-dark(oklch(0.79 0.07 20), oklch(0.69 0.08 20));
    --color-cat-5: light-dark(oklch(0.8 0.05 300), oklch(0.7 0.06 300));
    --color-cat-6: light-dark(oklch(0.82 0.06 125), oklch(0.72 0.07 125));
    --color-cat-7: light-dark(oklch(0.8 0.05 195), oklch(0.7 0.06 195));
    --color-cat-8: light-dark(oklch(0.8 0.01 85), oklch(0.7 0.01 85));
    --color-cat-ink: oklch(0.21 0.008 85);

    /* Edges & depth */
    --shadow-surface: none;
    --active-shift: 0px;
    --shadow-active: none;
    --shadow-float: 0 1px 2px oklch(0.2 0.008 85 / 0.1), 0 8px 24px -6px oklch(0.2 0.008 85 / 0.18);
    --shadow-overlay: 0 2px 4px oklch(0.15 0.008 85 / 0.12), 0 20px 56px -12px oklch(0.15 0.008 85 / 0.32);
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
--font-numeric: 'Martian Mono', ui-monospace, monospace;
--numeric-stretch: 87.5%;
--display-weight: 780;
--type-ratio: 1.22;
```

**Structure.** `--density` multiplies every space step and control height; `--motion-scale` multiplies every duration. Radii are roles, so actions, fields, surfaces and avatars can each have their own.

**Depth.** Decide what an edge is. Flat themes set `--shadow-surface: none` and keep soft shadows for floating layers only; Fiesta's hard offset is its edge.

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

Harbour itself uses only Schibsted Grotesk and Martian Mono, which Kiln's base stylesheet already loads. That's allowed too.

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

[Optional tokens](references/tokens.md#optional-theme-tokens) are set by only some themes, and every theme scope resets them, so they never leak into a nested theme. Ledger sets `--table-foot-rule`; Fiesta sets the `--highlight-*-text` inks for text on its gold rows.

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
