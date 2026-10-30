<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Tokens

> The three tiers of design tokens, the contract every theme fills in, and the axes that scope them.

Source: https://kiln.mitchellsutton.com/docs/ui/foundations/tokens

Everything visual in Kiln is a CSS custom property. A component never contains a colour, a size or a duration: it reads a token, and the theme on the page decides what the token is. That's why one `<Button>` can look like four different products.

## Three tiers

Components read tiers 2 and 3 only.

| Tier            | Where it's set                               | Examples                                                                                       |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1. Theme inputs | a theme stylesheet                           | `--density`, `--type-base`, `--type-ratio`, `--motion-scale`, font stacks, OKLCH colour values |
| 2. Semantic     | derived from the inputs, or set by the theme | `--space-5`, `--text-lg`, `--color-ink`, `--radius-field`, `--dur-2`                           |
| 3. Component    | read inside a component's CSS, with fallback | `var(--button-radius, var(--radius-action))`                                                   |

A theme sets its inputs and its semantic colours, radii and type roles. The scales (space, type sizes, control heights, durations) are formulas over the inputs, so a theme never sets them directly: Ledger sets `--density: 0.86` (0.94 from 40em) and every space step, control height and gap gets denser.

## The scales

These come from formulas, and every theme gets them.

| Family        | Tokens                                                                | How it's derived                                                                                                                                     |
| ------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Space         | `--space-1` … `--space-12`                                            | 4 8 12 16 24 32 48 64 96 144 192 256px × `--density`. Props take the step: `gap={5}`                                                                 |
| Controls      | `--control-sm`, `--control-md`, `--control-lg`                        | 32, 40, 48px × `--density`                                                                                                                           |
| Type          | `--text-2xs` … `--text-3xl`, `--text-display-sm/md/lg`                | From body up, `--type-base × --type-ratio^n`. Below body, fixed fractions of the base (`sm` 0.875, `xs` 0.75, `2xs` 0.6875). Display steps are fluid |
| Width         | `--width-narrow/text/content/wide`, `--gutter`                        | 32, 42, 68, 84rem. The gutter is fluid                                                                                                               |
| Motion        | `--dur-1`, `--dur-2`, `--dur-3`                                       | 110, 190, 340ms × `--motion-scale`, and 1ms under reduced motion                                                                                     |
| Layers        | `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-popover`, `--z-toast` | Fixed                                                                                                                                                |
| Control edges | `--color-line-control`                                                | Mixed from `--color-line-strong` and ink, at least 3:1 against its surroundings                                                                      |
| Breakpoints   | `sm` 40em, `md` 48em, `lg` 64em, `xl` 80em                            | Mobile-first. Media queries can't read custom properties, so these are fixed                                                                         |

[Spacing](https://kiln.mitchellsutton.com/docs/ui/foundations/spacing), [Type](./type.md) and [Motion](./motion.md) show each scale measured in the theme you're looking at.

## The theme contract

Every theme sets every one of these tokens. Together they're Kiln's public theming API, so they're a semver surface: renaming or removing one is a breaking change. The values below are Paper's, read from `paper.css` when these docs are built. kiln-ui's test suite fails if Paper and this list ever disagree.

Type roles:

| Token | Paper |
| --- | --- |
| `--font-display` | `'Golos Text', ui-sans-serif, system-ui, sans-serif` |
| `--font-text` | `'Golos Text', ui-sans-serif, system-ui, sans-serif` |
| `--font-prose` | `'Golos Text', ui-sans-serif, system-ui, sans-serif` |
| `--font-mono` | `'Atkinson Hyperlegible Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace` |
| `--font-numeric` | `'Golos Text', ui-sans-serif, system-ui, sans-serif` |
| `--type-base` | `1rem` |
| `--display-scale` | `1` |
| `--type-ratio` | `1.25` |
| `--display-weight` | `740` |
| `--display-style` | `normal` |
| `--display-stretch` | `100%` |
| `--display-transform` | `none` |
| `--display-tracking` | `-0.025em` |
| `--display-opsz` | `72` |
| `--heading-font` | `var(--font-display)` |
| `--heading-weight` | `650` |
| `--heading-tracking` | `-0.015em` |
| `--heading-transform` | `none` |
| `--label-weight` | `600` |
| `--label-tracking` | `0` |
| `--label-transform` | `none` |
| `--numeric-stretch` | `100%` |
| `--mono-stretch` | `87.5%` |
| `--leading-tight` | `1` |
| `--leading-snug` | `1.2` |
| `--leading-body` | `1.55` |
| `--prose-size` | `1.0625rem` |
| `--prose-leading` | `1.6` |

Structure & temperament:

| Token | Paper |
| --- | --- |
| `--density` | `1` |
| `--motion-scale` | `1` |
| `--ease-out` | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--ease-spring` | `var(--ease-out)` |
| `--icon-stroke` | `1.5` |
| `--border-width` | `1px` |
| `--border-width-strong` | `2px` |
| `--radius-action` | `0.25rem` |
| `--radius-field` | `0.25rem` |
| `--radius-surface` | `0.375rem` |
| `--radius-media` | `0.125rem` |
| `--radius-chip` | `999px` |
| `--radius-avatar` | `50%` |

Colour:

| Token | Paper |
| --- | --- |
| `--color-canvas` | `light-dark(oklch(0.953 0.005 255), oklch(0.215 0.006 255))` |
| `--color-surface` | `light-dark(oklch(0.995 0.002 255), oklch(0.26 0.006 255))` |
| `--color-surface-sunken` | `light-dark(oklch(0.932 0.005 255), oklch(0.175 0.006 255))` |
| `--color-surface-raised` | `light-dark(oklch(0.998 0.001 255), oklch(0.3 0.006 255))` |
| `--color-surface-inverse` | `light-dark(oklch(0.25 0.045 258), oklch(0.93 0.004 255))` |
| `--color-ink` | `light-dark(oklch(0.25 0.045 258), oklch(0.935 0.005 255))` |
| `--color-ink-muted` | `light-dark(oklch(0.43 0.03 258), oklch(0.78 0.01 255))` |
| `--color-ink-subtle` | `light-dark(oklch(0.515 0.02 258), oklch(0.68 0.01 255))` |
| `--color-ink-inverse` | `light-dark(oklch(0.975 0.003 255), oklch(0.2 0.009 255))` |
| `--color-line` | `light-dark(oklch(0.9 0.007 255), oklch(0.33 0.008 255))` |
| `--color-line-strong` | `light-dark(oklch(0.79 0.008 255), oklch(0.47 0.01 255))` |
| `--color-accent` | `light-dark(oklch(0.4 0.11 258), oklch(0.7 0.11 255))` |
| `--color-accent-hover` | `light-dark(oklch(0.35 0.11 258), oklch(0.75 0.11 255))` |
| `--color-accent-ink` | `light-dark(oklch(0.985 0.003 255), oklch(0.18 0.03 255))` |
| `--color-accent-text` | `light-dark(oklch(0.4 0.11 258), oklch(0.82 0.08 255))` |
| `--color-accent-soft` | `light-dark(oklch(0.935 0.03 255), oklch(0.3 0.04 255))` |
| `--color-highlight` | `light-dark(oklch(0.925 0.045 230), oklch(0.33 0.045 235))` |
| `--color-highlight-ink` | `var(--color-ink)` |
| `--color-focus` | `light-dark(oklch(0.52 0.17 258), oklch(0.78 0.115 252))` |
| `--color-selection` | `light-dark(oklch(0.88 0.06 230), oklch(0.42 0.07 240))` |
| `--color-scrim` | `light-dark(oklch(0.2 0.03 255 / 0.4), oklch(0.08 0.01 255 / 0.66))` |
| `--tone-positive` | `light-dark(oklch(0.52 0.12 150), oklch(0.75 0.13 150))` |
| `--tone-positive-soft` | `light-dark(oklch(0.95 0.035 150), oklch(0.3 0.05 150))` |
| `--tone-positive-text` | `light-dark(oklch(0.495 0.12 150), oklch(0.75 0.13 150))` |
| `--tone-positive-ink` | `light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 150))` |
| `--tone-caution` | `light-dark(oklch(0.635 0.133 78), oklch(0.81 0.13 80))` |
| `--tone-caution-soft` | `light-dark(oklch(0.955 0.039 78), oklch(0.31 0.05 80))` |
| `--tone-caution-text` | `light-dark(oklch(0.5 0.1 78), oklch(0.81 0.13 80))` |
| `--tone-caution-ink` | `light-dark(oklch(0.2 0.04 78), oklch(0.18 0.04 80))` |
| `--tone-critical` | `light-dark(oklch(0.55 0.19 25), oklch(0.68 0.16 25))` |
| `--tone-critical-soft` | `light-dark(oklch(0.95 0.025 25), oklch(0.3 0.06 25))` |
| `--tone-critical-text` | `light-dark(oklch(0.535 0.19 25), oklch(0.725 0.16 25))` |
| `--tone-critical-ink` | `light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 25))` |
| `--tone-info` | `light-dark(oklch(0.53 0.1 240), oklch(0.74 0.09 240))` |
| `--tone-info-soft` | `light-dark(oklch(0.95 0.025 240), oklch(0.3 0.045 240))` |
| `--tone-info-text` | `light-dark(oklch(0.505 0.1 240), oklch(0.74 0.09 240))` |
| `--tone-info-ink` | `light-dark(oklch(0.985 0.002 255), oklch(0.18 0.04 240))` |
| `--color-cat-1` | `light-dark(oklch(0.82 0.07 160), oklch(0.72 0.08 160))` |
| `--color-cat-2` | `light-dark(oklch(0.82 0.07 300), oklch(0.72 0.08 300))` |
| `--color-cat-3` | `light-dark(oklch(0.82 0.07 80), oklch(0.72 0.08 80))` |
| `--color-cat-4` | `light-dark(oklch(0.82 0.07 235), oklch(0.72 0.08 235))` |
| `--color-cat-5` | `light-dark(oklch(0.82 0.07 25), oklch(0.72 0.08 25))` |
| `--color-cat-6` | `light-dark(oklch(0.82 0.07 130), oklch(0.72 0.08 130))` |
| `--color-cat-7` | `light-dark(oklch(0.82 0.07 195), oklch(0.72 0.08 195))` |
| `--color-cat-8` | `light-dark(oklch(0.82 0.005 255), oklch(0.72 0.006 255))` |
| `--color-cat-ink` | `light-dark(oklch(0.21 0.03 258), oklch(0.2 0.02 255))` |

Data:

| Token | Paper |
| --- | --- |
| `--color-seq-1` | `light-dark(oklch(0.93 0.03 230), oklch(0.32 0.05 255))` |
| `--color-seq-2` | `light-dark(oklch(0.835 0.06 234.7), oklch(0.413 0.067 251.2))` |
| `--color-seq-3` | `light-dark(oklch(0.74 0.084 239.3), oklch(0.507 0.081 247.3))` |
| `--color-seq-4` | `light-dark(oklch(0.645 0.098 244), oklch(0.6 0.089 243.5))` |
| `--color-seq-5` | `light-dark(oklch(0.55 0.098 248.7), oklch(0.693 0.089 239.7))` |
| `--color-seq-6` | `light-dark(oklch(0.455 0.086 253.3), oklch(0.787 0.082 235.8))` |
| `--color-seq-7` | `light-dark(oklch(0.36 0.062 258), oklch(0.88 0.068 232))` |
| `--color-div-neg-3` | `light-dark(oklch(0.5 0.147 25), oklch(0.73 0.147 25))` |
| `--color-div-neg-2` | `light-dark(oklch(0.65 0.105 25), oklch(0.59 0.105 25))` |
| `--color-div-neg-1` | `light-dark(oklch(0.8 0.063 25), oklch(0.45 0.063 25))` |
| `--color-div-mid` | `light-dark(oklch(0.93 0.005 255), oklch(0.33 0.006 255))` |
| `--color-div-pos-1` | `light-dark(oklch(0.8 0.063 250), oklch(0.45 0.063 250))` |
| `--color-div-pos-2` | `light-dark(oklch(0.65 0.105 250), oklch(0.59 0.105 250))` |
| `--color-div-pos-3` | `light-dark(oklch(0.5 0.142 250), oklch(0.73 0.146 250))` |
| `--color-cat-1-stroke` | `light-dark(oklch(0.57 0.081 160), oklch(0.8 0.092 160))` |
| `--color-cat-2-stroke` | `light-dark(oklch(0.57 0.081 300), oklch(0.8 0.092 300))` |
| `--color-cat-3-stroke` | `light-dark(oklch(0.57 0.081 80), oklch(0.8 0.092 80))` |
| `--color-cat-4-stroke` | `light-dark(oklch(0.57 0.081 235), oklch(0.8 0.092 235))` |
| `--color-cat-5-stroke` | `light-dark(oklch(0.57 0.081 25), oklch(0.8 0.092 25))` |
| `--color-cat-6-stroke` | `light-dark(oklch(0.57 0.081 130), oklch(0.8 0.092 130))` |
| `--color-cat-7-stroke` | `light-dark(oklch(0.57 0.081 195), oklch(0.8 0.092 195))` |
| `--color-cat-8-stroke` | `light-dark(oklch(0.57 0.01 255), oklch(0.8 0.012 255))` |
| `--chart-grid` | `light-dark(oklch(0.9 0.007 255), oklch(0.335 0.008 255))` |
| `--chart-axis` | `light-dark(oklch(0.58 0.01 255), oklch(0.62 0.012 255))` |
| `--chart-label` | `var(--color-ink-muted)` |
| `--chart-tooltip-surface` | `var(--color-surface-raised)` |
| `--chart-tooltip-border` | `var(--color-line-strong)` |
| `--chart-tooltip-ink` | `var(--color-ink)` |
| `--chart-focus` | `var(--color-focus)` |

Edges & depth:

| Token | Paper |
| --- | --- |
| `--shadow-surface` | `none` |
| `--active-shift` | `0px` |
| `--shadow-active` | `none` |
| `--shadow-float` | `0 1px 2px oklch(0.2 0.04 258 / 0.1), 0 8px 24px -6px oklch(0.2 0.04 258 / 0.18)` |
| `--shadow-overlay` | `0 2px 4px oklch(0.15 0.04 258 / 0.12), 0 20px 56px -12px oklch(0.15 0.04 258 / 0.32)` |
| `--shadow-lift` | `0 2px 4px oklch(0.2 0.04 258 / 0.12), 0 16px 36px -8px oklch(0.2 0.04 258 / 0.28)` |
| `--canvas-image` | `none` |

## Optional theme tokens

Some themes set a few more: Fiesta's and Riso's inks for text on their tinted rows, Ledger's table rule. Every theme scope resets these first, so a theme nested inside another falls back to the component's default instead of inheriting its parent's value. Set them only when your theme's idea needs them:

`--badge-soft-ink`, `--canvas-image-size`, `--control-checked-border`, `--highlight-accent-text`, `--highlight-tone-caution-text`, `--highlight-tone-critical-text`, `--highlight-tone-info-text`, `--highlight-tone-positive-text`, `--marquee-edge`, `--navlinks-current-bg`, `--navlinks-marker`, `--numeral-scale`, `--numeral-weight`, `--section-divider-color`, `--stat-fit`, `--table-foot-rule`, `--table-head-font`

## Component tokens

A component exposes a few tokens of its own where a theme might reasonably differ, always read with a fallback to a semantic token: `--button-radius`, `--card-radius`, `--link-thickness`, `--prose-measure`, `--code-bg`, `--app-shell-sidebar-width`. Each component's CSS lists its tokens at the top. Set one in a theme, or on a single element, when one component needs to step away from the rest.

## Shape and depth

Radii are roles, not one global roundness. A theme can make actions pills and surfaces square.


One edge treatment per element: a border, a shadow or a change of fill, never all three. Static structure uses hairlines. Soft shadows are only for things that float, like popovers and dialogs. Hard offsets never go on static surfaces in a new theme. Fiesta keeps its hard offset as a legacy preset: it's the print misregistration, and it _is_ the edge. Riso's misregistered offset, the second ink drum printing slightly off, is floating-only.


## Axes and scoping

Three attributes select tokens, and they're independent of each other.

```html
<html data-theme="flightdeck" data-mode="dark">
  <div data-theme="riso">a Riso panel that keeps the page's dark mode</div>
  <div data-density="compact">a denser table</div>
</html>
```

- `data-theme` is `paper`, `monograph`, `ledger`, `fiesta`, `flightdeck`, `riso`, or the name of a theme you wrote. No attribute means Paper.
- `data-mode` is `light`, `dark` or `system`. It drives `color-scheme`, which drives every `light-dark()` colour. Leave it off nested scopes and they inherit the page's mode.
- `data-density` is `compact` or `comfortable`, and multiplies the theme's own density.

The derived scales are re-declared on every `[data-theme]` and `[data-density]`, so a nested scope recomputes from its own inputs rather than inheriting its parent's already-resolved sizes. In React, `ThemeProvider` sets the attributes on `<html>`, and `ThemeScope` sets them on a subtree.

## Inverted bands

`Section surface="inverse"` (or `"accent"`) and `Box surface="inverse"` re-point the colour roles for everything inside: ink, muted ink, lines, focus and accent text. Any component placed on a dark band stays legible without extra props.

## Cascade layers

Kiln declares `@layer kiln.reset, kiln.tokens, kiln.themes;` at the top of every stylesheet, so the order holds whichever file loads first. Layers have the lowest priority, so your own CSS always wins over Kiln's globals. Component CSS is deliberately _not_ layered: a layered rule loses to any unlayered rule, so a typical app reset (`button { color: inherit }`) would otherwise break every button. A single-class component selector beats an element reset, and a `className` you pass wins on source order.
