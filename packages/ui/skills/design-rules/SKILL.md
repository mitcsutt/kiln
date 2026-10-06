---
name: design-rules
description: "Use when designing or reviewing a screen, component, theme, example or copy built with @mitcsutt/kiln-ui, to avoid generic AI-generated UI: one accent, tinted neutrals, no gradients or glow, two type families, left-aligned asymmetric layout, not everything a card, one edge treatment, motion only in answer to an action, and specific copy."
metadata:
  purpose: Kiln's binding principles and anti-slop rules, as a checklist for anything built with it.
  type: core
  library: "@mitcsutt/kiln-ui"
sources:
  - mitcsutt/kiln:DESIGN.md
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Kiln design rules

Kiln's binding principles and anti-slop rules, as a checklist for anything built with it.

These rules come from [DESIGN.md](https://github.com/mitcsutt/kiln/blob/main/DESIGN.md), which is binding for everything in the Kiln repository. They apply just as well to screens you build with Kiln: the components and tokens make most of them the default, and the rest are a review checklist.

## Principles

1. **Themes are data, components are structure.** A component never knows which theme it is in. Everything visual is a token; a new theme is one CSS file and zero component changes.
2. **One idea per theme, drawn from its subject.** Paper is an office that prints for everyone, on grey recycled stock in blue-black ink. Monograph is a scholar's monograph read under a desk lamp. Ledger is an accountant's columnar pad. Fiesta is a screen-printed festival poster. Flightdeck is a glass-cockpit display. Riso is a two-drum risograph zine. Monograph and Fiesta predate the second-order rules in §2 and are kept unchanged for compatibility. Every choice in a theme designed since has a one-line reason traced to its subject, written in the stylesheet next to the value. If you can't write the reason, the choice is wrong and it doesn't ship.
3. **Props, not styles.** Consumers compose layout and intent through typed props (`gap={5}`, `tone="critical"`, `width="text"`). No utility classes, no inline style soup, no raw px/hex/ms at call sites. `className` exists as an escape hatch, not a workflow.
4. **Durable by default.** Every component forwards refs, spreads native props, works with React 18 and 19, is keyboard- and screen-reader-complete, respects `prefers-reduced-motion`, and renders on the server.
5. **Specific beats safe.** The median choice is the wrong choice (see [Not AI slop](#not-ai-slop)).

## Not AI slop

Generated UI converges on the statistical median: indigo buttons, Inter, gradient text, three rounded cards with an icon in a tinted circle, fade-up on scroll. The "tasteful" escapes have converged too: cream + serif + terracotta; near-black + one acid accent; hairline broadsheet layouts; mono ALL-CAPS eyebrows over every section. Distinctive systems share one trait: **a single idea from the subject matter, applied consistently, with everything else quiet.** These rules are enforced by the tokens and components wherever possible; the rest are review checklist items.

### Colour

- Authored in **OKLCH**. Neutrals are **tinted** (chroma 0.004–0.02 toward the theme's hue). Never `#000`/`#fff` surfaces, never stock slate/zinc.
- **One accent, ~5–10% of pixels**: the primary action, the current item, live state, key data. A second hue only when it carries meaning (`--color-highlight` = "you" / selected; tones = status).
- **No gradients** unless they encode data. No gradient text. No glow halos in dark mode.
- No indigo/violet as a primary. No warm cream canvas (such as `#F4F1EA`) and no terracotta or ember accent (such as `#D97757`). See _Second-order tells_ below.

### Type

- **Two families max per theme** (+ a mono for code/figures where the theme needs it), clearly distinct, one with real character.
- **Big contrast**: the largest display step is ≥ 5× body. Display tracking tightens with size (−0.02 to −0.04em); line-height drops to ~0.9–1.05.
- **`tabular-nums` on every number that aligns or updates**: counts, money, tables, dates. `<Numeral>`/`<Amount>` do this for you.
- Prose measure ≤ 70ch (`width="text"`). `text-wrap: balance` on headings, `pretty` on paragraphs (the reset does it).
- **Banned patterns:** accenting one word of a headline in italic/colour; a tracked ALL-CAPS eyebrow over every section; `01 / 02 / 03` numbering on things that aren't a sequence; monospace used as decoration for small labels.

### Second-order tells

Models that are told to avoid the tells above converge on a second set instead ([research](https://github.com/mitcsutt/kiln/blob/main/docs/research/ai-design-tells.md), [ADR 0030](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0030-theme-family-without-ai-tells.md)). None of these ships in a new built-in theme:

- A **cream or warm-paper canvas** (hue 40 to 100, with any visible chroma), including apricot and beige.
- An **ember, terracotta or burnt-orange accent**.
- A **near-black canvas with one acid or ember accent**.
- A **mint or sage canvas with a forest-green accent**, which is the cream tell in another hue.
- **Hard-offset "neo-brutalist" shadows on static surfaces.** A hard offset is allowed only where the theme's subject explains it, and only on floating layers. Fiesta, the legacy preset, keeps its hard offset on static surfaces; no new theme may.
- **Grain, noise or halftone** on the canvas (`--canvas-image` stays `none`).
- **Monospace beyond code**: for labels, eyebrows or every figure as decoration. A mono is allowed for figures only when the subject really uses one.
- A **serif display with one italic accent word**.
- A font from the banned list below.

`packages/ui/src/themes/tells.test.ts` enforces the checkable part for Paper, Ledger, Flightdeck and Riso: no banned font family in any theme or font stylesheet, no warm-cream light canvas, and no ember, terracotta or indigo accent. The rest is review.

**Legacy exemption.** Monograph and Fiesta are listed as `LEGACY` in that test and are exempt, because they ship unchanged from before these rules ([ADR 0030](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0030-theme-family-without-ai-tells.md)). Monograph still has its ember accent and serif display, and Fiesta its apricot canvas and halftone. Do not treat them as precedent: a new theme gets no exemption, and a redesigned Monograph or Fiesta loses its own.

The banned font families, from the research: the first-order defaults plus the faces models now reach for as "distinctive" escapes (several are on Anthropic's own recommended list): Inter, Roboto, Open Sans, Poppins, Montserrat, Space Grotesk, Space Mono, Geist, DM Sans, DM Serif, Manrope, Plus Jakarta Sans, Outfit, Sora, Syne, Satoshi, Cabinet Grotesk, Clash Display, General Sans, Instrument Sans, Instrument Serif, Fraunces, Playfair Display, Cormorant, Lora, EB Garamond, Newsreader, Bricolage Grotesque, IBM Plex, JetBrains Mono and Fira Code. The list goes stale as model defaults move: change the list in the test and here together.

Beyond the checks, a theme has a subject, and each colour, face, radius and easing has a one-line reason in the stylesheet that traces it to that subject. Each theme also mixes radii on purpose (for example square fields with pill chips), so no theme is one uniform roundness.

### Layout

- **Left-aligned by default.** Centre is an exception (empty states, a lone CTA).
- **Asymmetric splits** (`<Split ratio="5/7">`), a hang column for labels, at least one element per page that breaks the column.
- **Vary section rhythm.** The space scale is non-linear (4 8 12 16 24 32 48 64 96 144…) and adjacent `<Section>`s should not use the same `space`.
- **Not everything is a card.** Prefer lists, tables, rules and whitespace. A card needs a reason: it's interactive, draggable, or a self-contained object.
- The hero is the subject's most characteristic thing: the open invoices, the release board, today's orders. Not a stat row with a gradient.

### Components & depth

- **Radii are roles**, not a global roundness: `--radius-action`, `--radius-field`, `--radius-surface`, `--radius-media`, `--radius-chip`, `--radius-avatar`. Nested radii shrink (inner = outer − padding).
- **One edge treatment per element**: a border _or_ a shadow _or_ a fill change. Static structure uses hairlines; soft shadows are only for things that float (popover, menu, dialog). Hard-offset shadows never go on static surfaces in a new theme. Fiesta keeps its hard offset as a legacy preset: it is the print misregistration, and it _is_ the edge. Riso's misregistered offset (the second ink drum slightly off) is floating-only.
- **Icons**: the library ships ~20 glyphs on a 20px grid with a themed stroke. At most one icon per row; never an icon in a tinted chip; never emoji as UI.
- **No left-border-accent callouts.** Alerts are a neutral hairline frame; the tone lives only in the glyph and a short tab on the top edge (`variant="soft"` for a tinted box when it must shout).
- **Empty states** mark their frame with printer's crop marks, not a dashed box.
- **Focus is neutral** (`--color-focus` = ink) and always visible on `:focus-visible`. Focus must never look like validation; only error/warning/success tint a field.

### Motion

- Motion answers an action or shows a state change (count updated, row expanded, panel opened). **No fade-up-on-scroll, no hover-scale on static cards, no parallax.**
- Durations and easings are tokens (`--dur-1/2/3`, `--ease-out`, `--ease-spring`) and collapse to ~0 under `prefers-reduced-motion`.

### Copy (for stories, docs and examples)

- Sentence case. Specific nouns, active verbs: "Send invoice", "Export CSV", "Read the release notes". Never "Get started →", "Learn more", "Elevate", "Seamless", "Unleash".
- Realistic content in stories and docs: specific names, amounts, places and projects. It's invented, never copied from a real product, and never lorem ipsum.

**Review question for every screen:** _"Would I produce this for any similar page?"_ If yes, change something until the answer is no. Spend boldness in one place; remove one accessory before shipping.
