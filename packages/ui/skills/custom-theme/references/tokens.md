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

A theme sets its inputs and its semantic colours, radii and type roles. The scales (space, type sizes, control heights, durations) are formulas over the inputs, so a theme never sets them directly: Ledger sets `--density: 0.86` and every space step, control height and gap gets denser.

## The scales

These come from formulas, and every theme gets them.

| Family        | Tokens                                                                | How it's derived                                                                     |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Space         | `--space-1` … `--space-12`                                            | 4 8 12 16 24 32 48 64 96 144 192 256px × `--density`. Props take the step: `gap={5}` |
| Controls      | `--control-sm`, `--control-md`, `--control-lg`                        | 32, 40, 48px × `--density`                                                           |
| Type          | `--text-2xs` … `--text-3xl`, `--text-display-sm/md/lg`                | `--type-base × --type-ratio^n`. Display steps are fluid                              |
| Width         | `--width-narrow/text/content/wide`, `--gutter`                        | 32, 42, 68, 84rem. The gutter is fluid                                               |
| Motion        | `--dur-1`, `--dur-2`, `--dur-3`                                       | 110, 190, 340ms × `--motion-scale`, and 1ms under reduced motion                     |
| Layers        | `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-popover`, `--z-toast` | Fixed                                                                                |
| Control edges | `--color-line-control`                                                | Mixed from `--color-line-strong` and ink, at least 3:1 against its surroundings      |
| Breakpoints   | `sm` 40em, `md` 48em, `lg` 64em, `xl` 80em                            | Mobile-first. Media queries can't read custom properties, so these are fixed         |

[Spacing](https://kiln.mitchellsutton.com/docs/ui/foundations/spacing), [Type](./type.md) and [Motion](./motion.md) show each scale measured in the theme you're looking at.

## The theme contract

Every theme sets every one of these tokens. Together they're Kiln's public theming API, so they're a semver surface: renaming or removing one is a breaking change. The values below are Paper's, read from `paper.css` when these docs are built. kiln-ui's test suite fails if Paper and this list ever disagree.

Type roles:

| Token | Paper |
| --- | --- |
| `--font-display` | `'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif` |
| `--font-text` | `'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif` |
| `--font-prose` | `'Newsreader', 'Iowan Old Style', Georgia, serif` |
| `--font-mono` | `'Martian Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace` |
| `--font-numeric` | `'Newsreader', 'Iowan Old Style', Georgia, serif` |
| `--type-base` | `1rem` |
| `--display-scale` | `1` |
| `--type-ratio` | `1.25` |
| `--display-weight` | `640` |
| `--display-style` | `normal` |
| `--display-stretch` | `100%` |
| `--display-transform` | `none` |
| `--display-tracking` | `-0.04em` |
| `--display-opsz` | `72` |
| `--heading-font` | `var(--font-display)` |
| `--heading-weight` | `620` |
| `--heading-tracking` | `-0.015em` |
| `--heading-transform` | `none` |
| `--label-weight` | `560` |
| `--label-tracking` | `0` |
| `--label-transform` | `none` |
| `--numeric-stretch` | `100%` |
| `--mono-stretch` | `87.5%` |
| `--leading-tight` | `1` |
| `--leading-snug` | `1.2` |
| `--leading-body` | `1.55` |
| `--prose-size` | `1.125rem` |
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
| `--radius-action` | `0.375rem` |
| `--radius-field` | `0.375rem` |
| `--radius-surface` | `0.5rem` |
| `--radius-media` | `0.25rem` |
| `--radius-chip` | `0.375rem` |
| `--radius-avatar` | `50%` |

Colour:

| Token | Paper |
| --- | --- |
| `--color-canvas` | `light-dark(oklch(0.976 0.004 85), oklch(0.188 0.005 85))` |
| `--color-surface` | `light-dark(oklch(0.993 0.002 85), oklch(0.215 0.006 85))` |
| `--color-surface-sunken` | `light-dark(oklch(0.955 0.005 85), oklch(0.165 0.005 85))` |
| `--color-surface-raised` | `light-dark(oklch(0.997 0.002 85), oklch(0.245 0.006 85))` |
| `--color-surface-inverse` | `light-dark(oklch(0.235 0.008 85), oklch(0.93 0.005 85))` |
| `--color-ink` | `light-dark(oklch(0.215 0.008 85), oklch(0.935 0.005 85))` |
| `--color-ink-muted` | `light-dark(oklch(0.435 0.008 85), oklch(0.755 0.006 85))` |
| `--color-ink-subtle` | `light-dark(oklch(0.515 0.008 85), oklch(0.64 0.006 85))` |
| `--color-ink-inverse` | `light-dark(oklch(0.965 0.004 85), oklch(0.2 0.008 85))` |
| `--color-line` | `light-dark(oklch(0.9 0.005 85), oklch(0.3 0.006 85))` |
| `--color-line-strong` | `light-dark(oklch(0.8 0.006 85), oklch(0.4 0.007 85))` |
| `--color-accent` | `light-dark(oklch(0.25 0.008 85), oklch(0.92 0.005 85))` |
| `--color-accent-hover` | `light-dark(oklch(0.34 0.008 85), oklch(0.84 0.006 85))` |
| `--color-accent-ink` | `light-dark(oklch(0.975 0.004 85), oklch(0.2 0.008 85))` |
| `--color-accent-text` | `light-dark(oklch(0.25 0.008 85), oklch(0.92 0.005 85))` |
| `--color-accent-soft` | `light-dark(oklch(0.925 0.006 85), oklch(0.285 0.007 85))` |
| `--color-highlight` | `light-dark(oklch(0.935 0.035 228), oklch(0.315 0.045 235))` |
| `--color-highlight-ink` | `var(--color-ink)` |
| `--color-focus` | `var(--color-ink)` |
| `--color-selection` | `light-dark(oklch(0.88 0.06 228), oklch(0.42 0.07 235))` |
| `--color-scrim` | `light-dark(oklch(0.22 0.008 85 / 0.4), oklch(0.07 0.005 85 / 0.66))` |
| `--tone-positive` | `light-dark(oklch(0.52 0.11 155), oklch(0.72 0.12 158))` |
| `--tone-positive-soft` | `light-dark(oklch(0.94 0.035 155), oklch(0.28 0.045 158))` |
| `--tone-positive-text` | `light-dark(oklch(0.45 0.1 155), oklch(0.78 0.11 158))` |
| `--tone-positive-ink` | `light-dark(oklch(0.985 0.01 155), oklch(0.18 0.03 158))` |
| `--tone-caution` | `light-dark(oklch(0.74 0.14 78), oklch(0.8 0.13 85))` |
| `--tone-caution-soft` | `light-dark(oklch(0.95 0.05 88), oklch(0.3 0.05 80))` |
| `--tone-caution-text` | `light-dark(oklch(0.5 0.1 70), oklch(0.84 0.11 88))` |
| `--tone-caution-ink` | `light-dark(oklch(0.22 0.04 70), oklch(0.2 0.04 80))` |
| `--tone-critical` | `light-dark(oklch(0.54 0.19 25), oklch(0.68 0.17 24))` |
| `--tone-critical-soft` | `light-dark(oklch(0.94 0.035 22), oklch(0.29 0.06 24))` |
| `--tone-critical-text` | `light-dark(oklch(0.5 0.18 25), oklch(0.76 0.14 24))` |
| `--tone-critical-ink` | `light-dark(oklch(0.985 0.01 22), oklch(0.18 0.03 24))` |
| `--tone-info` | `light-dark(oklch(0.52 0.09 240), oklch(0.72 0.09 238))` |
| `--tone-info-soft` | `light-dark(oklch(0.94 0.025 240), oklch(0.28 0.04 240))` |
| `--tone-info-text` | `light-dark(oklch(0.46 0.09 240), oklch(0.78 0.08 238))` |
| `--tone-info-ink` | `light-dark(oklch(0.985 0.01 240), oklch(0.18 0.03 240))` |
| `--color-cat-1` | `light-dark(oklch(0.8 0.06 228), oklch(0.7 0.07 228))` |
| `--color-cat-2` | `light-dark(oklch(0.8 0.07 160), oklch(0.7 0.08 160))` |
| `--color-cat-3` | `light-dark(oklch(0.82 0.08 75), oklch(0.72 0.09 75))` |
| `--color-cat-4` | `light-dark(oklch(0.79 0.07 20), oklch(0.69 0.08 20))` |
| `--color-cat-5` | `light-dark(oklch(0.8 0.05 300), oklch(0.7 0.06 300))` |
| `--color-cat-6` | `light-dark(oklch(0.82 0.06 125), oklch(0.72 0.07 125))` |
| `--color-cat-7` | `light-dark(oklch(0.8 0.05 195), oklch(0.7 0.06 195))` |
| `--color-cat-8` | `light-dark(oklch(0.8 0.01 85), oklch(0.7 0.01 85))` |
| `--color-cat-ink` | `oklch(0.21 0.008 85)` |

Edges & depth:

| Token | Paper |
| --- | --- |
| `--shadow-surface` | `none` |
| `--active-shift` | `0px` |
| `--shadow-active` | `none` |
| `--shadow-float` | `0 1px 2px oklch(0.2 0.008 85 / 0.1), 0 8px 24px -6px oklch(0.2 0.008 85 / 0.18)` |
| `--shadow-overlay` | `0 2px 4px oklch(0.15 0.008 85 / 0.12), 0 20px 56px -12px oklch(0.15 0.008 85 / 0.32)` |
| `--canvas-image` | `none` |

## Optional theme tokens

Some themes set a few more: Fiesta's inks for text on its gold rows, Ledger's table rule. Every theme scope resets these first, so a theme nested inside another falls back to the component's default instead of inheriting its parent's value. Set them only when your theme's idea needs them:

`--canvas-image-size`, `--control-checked-border`, `--highlight-accent-text`, `--highlight-tone-caution-text`, `--highlight-tone-critical-text`, `--highlight-tone-info-text`, `--highlight-tone-positive-text`, `--marquee-edge`, `--numeral-scale`, `--numeral-weight`, `--section-divider-color`, `--stat-fit`, `--table-foot-rule`, `--table-head-font`

## Component tokens

A component exposes a few tokens of its own where a theme might reasonably differ, always read with a fallback to a semantic token: `--button-radius`, `--card-radius`, `--link-thickness`, `--prose-measure`, `--code-bg`, `--app-shell-sidebar-width`. Each component's CSS lists its tokens at the top. Set one in a theme, or on a single element, when one component needs to step away from the rest.

## Shape and depth

Radii are roles, not one global roundness. A theme can make actions pills and surfaces square.


One edge treatment per element: a border, a shadow or a change of fill, never all three. Static structure uses hairlines. Soft shadows are only for things that float, like popovers and dialogs. Fiesta's hard offset is its one deliberate exception: it's the print misregistration, and it _is_ the edge.


## Axes and scoping

Three attributes select tokens, and they're independent of each other.

```html
<html data-theme="monograph" data-mode="dark">
  <div data-theme="fiesta">a Fiesta panel that keeps the page's dark mode</div>
  <div data-density="compact">a denser table</div>
</html>
```

- `data-theme` is `paper`, `monograph`, `ledger`, `fiesta`, or the name of a theme you wrote. No attribute means Paper.
- `data-mode` is `light`, `dark` or `system`. It drives `color-scheme`, which drives every `light-dark()` colour. Leave it off nested scopes and they inherit the page's mode.
- `data-density` is `compact` or `comfortable`, and multiplies the theme's own density.

The derived scales are re-declared on every `[data-theme]` and `[data-density]`, so a nested scope recomputes from its own inputs rather than inheriting its parent's already-resolved sizes. In React, `ThemeProvider` sets the attributes on `<html>`, and `ThemeScope` sets them on a subtree.

## Inverted bands

`Section surface="inverse"` (or `"accent"`) and `Box surface="inverse"` re-point the colour roles for everything inside: ink, muted ink, lines, focus and accent text. Any component placed on a dark band stays legible without extra props.

## Cascade layers

Kiln declares `@layer kiln.reset, kiln.tokens, kiln.themes;` at the top of every stylesheet, so the order holds whichever file loads first. Layers have the lowest priority, so your own CSS always wins over Kiln's globals. Component CSS is deliberately _not_ layered: a layered rule loses to any unlayered rule, so a typical app reset (`button { color: inherit }`) would otherwise break every button. A single-class component selector beats an element reset, and a `className` you pass wins on source order.
