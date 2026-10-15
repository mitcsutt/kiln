<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Colour

> Tinted OKLCH neutrals, one accent, a highlight that means "you", and tones that carry status.

Source: https://kiln.mitchellsutton.com/docs/ui/foundations/colour

Colour in Kiln is a short list of roles. A theme gives each role a value for light and dark; a component asks for a role and never for a colour. The swatches below are the theme you have selected in the header, in its current mode. Switch either and they change.

## Surfaces, ink and lines

Neutrals are tinted toward the theme's hue (chroma 0.004 to 0.02), never stock grey and never pure black or white. Paper is cool grey stock with white sheets; Monograph is blue slate; Flightdeck is dark blue-grey display glass; Ledger is white paper ruled in green; Fiesta is apricot poster stock; Riso is bright white stock printed in two inks.



`--color-ink-subtle` still meets AA contrast on sunken and raised surfaces: it sets placeholders and meta text, which people need to read. Controls get their own edge, `--color-line-control`, mixed to reach 3:1 against what's around it, because a field you can't see the edge of fails WCAG 1.4.11.

## One accent

The accent is for about 5 to 10 percent of a screen: the primary action, the current item, live state, key data. Everything else is ink. `--color-accent-ink` is text set _on_ the accent; `--color-accent-text` is accent-coloured text on the canvas, and it's tuned for AA.


A second hue appears only when it carries meaning. `--color-highlight` means "you" or "selected": your row in a members table, the chosen option. Focus is always neutral (`--color-focus` is ink), so focus can never be mistaken for validation.

## Tones

Tones are status: positive, caution, critical and info. Each comes as four tokens: the tone itself (fills and glyphs), `-soft` (a tinted background), `-text` (readable tone-coloured text on the canvas) and `-ink` (text on the solid tone).


Components take a `tone` prop and pick the right token for the job: `<Badge tone="critical">`, `<Alert tone="caution">`, `<Numeral tone="auto">` (positive or critical by sign).

## Categorical

Eight muted inks at even lightness for things that need telling apart but have no order: people, series in a chart, tags. `--color-cat-ink` is readable on all eight. `Avatar` and `Tag` use them.


## Ramps

Categorical colour marks who; ramps mark how much. An amount, like a heatmap cell or a bar shaded by its value, takes the sequential ramp: seven steps from least to most, each one further from the page, so more is darker in light mode and lighter in dark mode.


A value either side of a reference, like change against last month or distance from a target, takes the diverging ramp. Its two arms are different hues at matching lightness, so neither side looks bigger, and they step out from `--color-div-mid`, a neutral that stands for the reference itself.


Status still belongs to the tones: a ramp says how much, never whether it's good.

## Charts

Each categorical colour has a stroke variant, `--color-cat-N-stroke`, for lines and the outlines of filled marks. The fills are pale, and a 1px line in one would disappear, so the stroke reaches 3:1 on the canvas and the surface. Strokes are for lines, never text.


The chart chrome tokens are the grid, the axis, tick and legend labels, the tooltip and the focus ring on a data point. Labels and tooltip text are ink-coloured and meet AA, and the axis and focus meet 3:1. A legend or tick never takes its series colour.


kiln-ui's tests check all of this in every built-in theme and both modes: the ramp order, the neutral midpoint and every contrast pair.

## Light and dark

Every colour token is a `light-dark(<light>, <dark>)` pair. The page's `color-scheme`, set by `data-mode`, chooses between them, so dark mode needs no second stylesheet and no class juggling, and a nested scope can be dark inside a light page:

```tsx
<ThemeScope theme="ledger" mode="dark">
  …
</ThemeScope>
```

## The rules

These come from [DESIGN.md](https://github.com/mitcsutt/kiln/blob/main/DESIGN.md), and they bind every theme and every example in these docs.

- Author colour in OKLCH. Tint the neutrals.
- One accent. A second hue only when it means something.
- No gradients unless they encode data, no gradient text, no glow in dark mode.
- No indigo or violet as a primary.
