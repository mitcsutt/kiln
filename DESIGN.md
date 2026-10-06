# DESIGN.md: the Kiln design system

> One component library, many personalities. `@mitcsutt/kiln-ui` is a single set of React components whose entire look (colour, type, shape, density, depth, motion) is decided by a theme applied at the root. The same `<Button>` is a blue-black office-print key in Paper, a quiet ember pill in Monograph, a banknote-green ledger key in Ledger, a chunky poster sticker in Fiesta, a square instrument key in Flightdeck and a hand-cut fluorescent pink pill in Riso.

This document is the contract, and it is **binding** ([ADR 0012](docs/adr/0012-design-standards.md)): its principles, its anti-slop rules and its token contract apply to every component, theme, story and docs page in this repo. Read it before designing a screen, writing a component, or adding a theme. Component-authoring mechanics live in [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md). To change a rule here, change the lint rule or test that enforces it in the same pull request.

---

## 1. Principles

1. **Themes are data, components are structure.** A component never knows which theme it is in. Everything visual is a token; a new theme is one CSS file and zero component changes.
2. **One idea per theme, drawn from its subject.** Paper is an office that prints for everyone, on grey recycled stock in blue-black ink. Monograph is a scholar's monograph read under a desk lamp. Ledger is an accountant's columnar pad. Fiesta is a screen-printed festival poster. Flightdeck is a glass-cockpit display. Riso is a two-drum risograph zine. Monograph and Fiesta predate the second-order rules in §2 and are kept unchanged for compatibility. Every choice in a theme designed since has a one-line reason traced to its subject, written in the stylesheet next to the value. If you can't write the reason, the choice is wrong and it doesn't ship.
3. **Props, not styles.** Consumers compose layout and intent through typed props (`gap={5}`, `tone="critical"`, `width="text"`). No utility classes, no inline style soup, no raw px/hex/ms at call sites. `className` exists as an escape hatch, not a workflow.
4. **Durable by default.** Every component forwards refs, spreads native props, works with React 18 and 19, is keyboard- and screen-reader-complete, respects `prefers-reduced-motion`, and renders on the server.
5. **Specific beats safe.** The median choice is the wrong choice (see §2).

---

## 2. Not AI slop: the rules

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

---

## 3. Tokens

Three tiers. **Components read tiers 2 and 3 only.**

| Tier            | Where                                                      | Examples                                                                                       |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1. Theme inputs | a theme stylesheet (`packages/ui/src/themes/<name>.css`)   | `--density`, `--type-base`, `--type-ratio`, `--motion-scale`, font stacks, OKLCH colour values |
| 2. Semantic     | derived in `src/tokens/foundation.css` or set by the theme | `--space-5`, `--text-lg`, `--color-ink`, `--radius-field`, `--dur-2`                           |
| 3. Component    | read inside each `*.module.css` with a fallback            | `var(--button-radius, var(--radius-action))`                                                   |

The token contract (§3.2 and §3.3) is the public theming API, so it is a semver surface: renaming or removing a token is a breaking change ([ADR 0003](docs/adr/0003-theming-model.md)).

### 3.1 Scales (theme-independent formulas)

| Family        | Tokens                                               | Notes                                                                                         |
| ------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Space         | `--space-1 … --space-12`                             | 4 8 12 16 24 32 48 64 96 144 192 256px × `--density`. Props take the step number (`gap={5}`). |
| Controls      | `--control-sm/md/lg`                                 | 32 / 40 / 48px × density                                                                      |
| Type          | `--text-2xs … --text-3xl`, `--text-display-sm/md/lg` | `--type-base × --type-ratio^n`; display steps are fluid (`clamp`)                             |
| Width         | `--width-narrow/text/content/wide`, `--gutter`       | 32 / 42 / 68 / 84rem; gutter is fluid                                                         |
| Motion        | `--dur-1/2/3`                                        | 110 / 190 / 340ms × `--motion-scale`; 1ms under reduced motion                                |
| Layers        | `--z-raised/sticky/overlay/popover/toast`            |                                                                                               |
| Control edges | `--color-line-control`                               | mixed from `--color-line-strong` and ink, ≥ 3:1 against its surroundings (WCAG 1.4.11)        |
| Breakpoints   | `sm 40em · md 48em · lg 64em · xl 80em`              | mobile-first; mirrored in `utils/responsive.ts`                                               |

A theme never sets these: it sets the inputs they're derived from.

### 3.2 The theme contract (every theme sets all of these)

`packages/ui/src/themes/paper.css` is the reference implementation: it sets every token below, with a comment on each group. `themes/contract.test.ts` fails if this list and Paper drift apart.

- **Type roles**: `--font-display`, `--font-text`, `--font-prose`, `--font-mono`, `--font-numeric`; `--display-weight`, `--display-style`, `--display-stretch`, `--display-transform`, `--display-tracking`, `--display-opsz`; `--heading-font`, `--heading-weight`, `--heading-tracking`, `--heading-transform`; `--label-weight`, `--label-tracking`, `--label-transform`; `--numeric-stretch`, `--mono-stretch`; `--leading-tight`, `--leading-snug`, `--leading-body`; `--prose-size`, `--prose-leading`.
- **Temperament**: `--type-base`, `--type-ratio`, `--display-scale` (multiplies only the display steps), `--density`, `--motion-scale`, `--ease-out`, `--ease-in-out`, `--ease-spring`, `--icon-stroke`, `--border-width`, `--border-width-strong`.
- **Shape**: `--radius-action`, `--radius-field`, `--radius-surface`, `--radius-media`, `--radius-chip`, `--radius-avatar`.
- **Colour** (each a `light-dark(<light>, <dark>)` pair unless it is mode-independent):
  - surfaces `--color-canvas`, `--color-surface`, `--color-surface-sunken`, `--color-surface-raised`, `--color-surface-inverse`;
  - ink `--color-ink`, `--color-ink-muted`, `--color-ink-subtle`, `--color-ink-inverse`;
  - lines `--color-line`, `--color-line-strong` (the control-edge colour is derived from them, see §3.1);
  - accent `--color-accent`, `--color-accent-hover`, `--color-accent-ink` (text _on_ accent), `--color-accent-text` (accent-coloured text on canvas, AA), `--color-accent-soft`;
  - `--color-highlight`, `--color-highlight-ink`; `--color-focus`, `--color-selection`, `--color-scrim`;
  - tones `--tone-positive`, `--tone-positive-soft`, `--tone-positive-text`, `--tone-positive-ink`, and the same four for `caution`, `critical` and `info`: `--tone-caution`, `--tone-caution-soft`, `--tone-caution-text`, `--tone-caution-ink`, `--tone-critical`, `--tone-critical-soft`, `--tone-critical-text`, `--tone-critical-ink`, `--tone-info`, `--tone-info-soft`, `--tone-info-text`, `--tone-info-ink`;
  - categorical `--color-cat-1`, `--color-cat-2`, `--color-cat-3`, `--color-cat-4`, `--color-cat-5`, `--color-cat-6`, `--color-cat-7`, `--color-cat-8`, and `--color-cat-ink` (readable on every one of them).
- **Depth**: `--shadow-surface` (static surfaces that opt in), `--shadow-active` and `--active-shift` (how far a pressed control travels toward its shadow), `--shadow-float` (popovers, menus), `--shadow-overlay` (dialogs), `--canvas-image` (a texture on the page ground, or `none`).

### 3.3 Optional theme tokens

Only some themes set these (Fiesta's gold-row inks, Ledger's table rule…). Every `[data-theme]` resets them in `tokens/foundation.css`, so a nested scope falls back to the component default instead of inheriting its parent theme's value. A new optional token goes in that reset list and here; `themes/themes.test.ts` fails if a theme sets a token the others neither set nor reset.

`--canvas-image-size`, `--control-checked-border`, `--highlight-accent-text`, `--highlight-tone-positive-text`, `--highlight-tone-caution-text`, `--highlight-tone-critical-text`, `--highlight-tone-info-text`, `--marquee-edge`, `--numeral-scale`, `--numeral-weight`, `--section-divider-color`, `--stat-fit`, `--table-foot-rule`, `--table-head-font`.

### 3.4 Axes and scoping

Theme selection is by attribute, and axes are orthogonal:

```html
<html data-theme="flightdeck" data-mode="dark">
  <!-- app -->
  <div data-theme="riso">…</div>
  <!-- nested theme, inherits mode -->
  <div data-density="compact">…</div>
  <!-- denser subtree -->
</html>
```

- `data-theme`: `paper | monograph | ledger | fiesta | flightdeck | riso`, or the name of a theme you wrote (§4.7). No attribute = Paper.
- `data-mode`: `light | dark | system` (drives `color-scheme`, which drives every `light-dark()`); omit on nested scopes to inherit.
- `data-density`: `compact | comfortable` multiplies the theme's own density.
- Derived scales are re-declared on `:root, [data-theme], [data-density]`, so nested scopes recompute from _their_ inputs.

### 3.5 Component tokens

Each component module lists the tokens a theme may set at the top of its CSS, always read with a fallback. Examples: `--button-radius`, `--card-radius`, `--numeral-weight`, `--numeral-scale`, `--link-thickness`, `--prose-measure`, `--quote-mark-color`, `--code-bg`, `--section-divider-color`, `--app-shell-header-height`. Add one only when a theme genuinely needs to diverge. Form inputs add `--color-swatch-radius`, `--combobox-list-border`, `--combobox-option-highlight`, `--combobox-option-check`, `--file-drop-radius`, `--file-drop-bg`, `--file-drop-border` and `--file-drop-active-bg`.

### 3.6 Inverted bands

`Section surface="inverse|accent"` and `Box surface="inverse"` re-point the colour roles for everything inside them (ink, muted, lines, focus, accent-text), so any component placed on a dark band stays legible with no extra props. A pair like ink ↔ ink-inverse can't be swapped on one element (that's a `var()` cycle), so the band exposes `--section-fill`/`--section-on` (`--box-fill`/`--box-on`) and its children perform the swap.

### 3.7 Cascade layers

`@layer kiln.reset, kiln.tokens, kiln.themes;` is the lowest priority, so app CSS always wins over them. **Component CSS Modules are unlayered on purpose**: a layered rule loses to _any_ unlayered rule, so a typical app reset (`button { color: inherit }`) would break every component. Single-class component selectors beat element resets, and a consumer's `className` wins on source order. Every Kiln stylesheet (the base and each preset) declares the layer order first, so import order can't change it.

---

## 4. Themes

Paper is in the base stylesheet. The presets are opt-in stylesheets, so an app pays only for what it imports ([ADR 0003](docs/adr/0003-theming-model.md)).

### 4.1 Paper: the default (light or dark)

_An office that prints for everyone: grey recycled stock, white sheets, blue-black ink._

- **Colour**: cool grey stock for the canvas, near-white sheets for surfaces, so a surface reads against the page by fill alone. **The ink is the accent**: a blue-black that is the primary action, the current item and live state. Links are ink told apart by their underline, so Paper sits under any brand without arguing with it. The one other hue is the proofreader's **non-photo blue**, kept for "you"/selected and text selection. Tones are the only saturated colour on the page.
- **Type**: **Golos Text** for everything, from display to prose and figures, and **Atkinson Hyperlegible Mono** for code. Paratype drew Golos for a national public-services website, so it has a plain zero, true tabular figures and distinct I, l and 1. The bundle has no italic file, so italics are synthesised. No serif. 16px base, 1.25 ratio.
- **Shape**: square-shouldered actions and fields, slightly rounder surfaces, pill chips (the deliberate contrast), round avatars.
- **Depth**: a fill change, not a border: a sheet on stock needs no edge. Soft blue-black shadows for floating layers.
- **Motion**: quart ease-out, brisk, no bounce.

### 4.2 Monograph: preset (dark-first, legacy)

_A scholarly monograph read under a desk lamp at night: "modern nostalgia"._ `import '@mitcsutt/kiln-ui/themes/monograph.css'`

Kept unchanged for compatibility. It predates the second-order rules in §2 and is exempt from them. Its stylesheet loads its own faces, and Martian Mono through `tokens/fonts-martian-mono.css`, so the base stylesheet carries none of them.

- **Colour**: blue-slate neutrals (hue 255, never black). One **ember** accent (`oklch(0.72 0.15 52)` dark / `oklch(0.565 0.158 44)` light) that behaves like phosphor: it marks _live_ and _current_, never decorates. A cool slate `highlight`.
- **Type**: **Newsreader** (display/prose serif, optical sizes, set big at weight ~430 with −0.035em tracking) + **Schibsted Grotesk** (text/UI; a newsroom grotesk). **Martian Mono** only for code. 17px base, 1.25 ratio.
- **Shape**: pill actions, 8px fields, 12px surfaces, rounded-square avatars.
- **Depth**: hairlines only; soft tinted shadows for floating layers.
- **Motion**: quint ease-out, no bounce, slightly slow (`--motion-scale: 1.1`).

### 4.3 Ledger: preset (light-first)

_An accountant's columnar pad._ `import '@mitcsutt/kiln-ui/themes/ledger.css'`

- **Colour**: a white sheet with **green rules** (the lines carry the green, not the canvas), a **banknote-green** accent, **accounting red** for negatives and a flat **highlighter yellow** highlight. Dark mode is a blue-green carbon-copy night, not a green-screen terminal.
- **Type**: **Archivo** throughout. Figures use its width axis to set condensed with tabular numerals, so a column of money reads like receipt tape without a monospace. **Atkinson Hyperlegible Mono** for code only. 15px base, 1.2 ratio.
- **Shape**: tight radii everywhere, squarer chips, rounded-square avatars like ledger stamps; compact density (0.86).
- **Depth**: hairlines in the ledger green; surfaces stay flat.
- **Motion**: brief and flat, no bounce.

### 4.4 Fiesta: preset (light-first, legacy)

_A screen-printed festival poster and sticker album._ `import '@mitcsutt/kiln-ui/themes/fiesta.css'`

Kept unchanged for compatibility. It predates the second-order rules in §2 and is exempt from them.

- **Colour**: flat spot inks (**coral** accent, **gold** highlight, **teal** positive) on apricot poster stock, all keylined in **aubergine ink**. Night mode is a floodlit aubergine. A 6% halftone dot screen on the canvas; no gradients (screen printing can't do them).
- **Type**: **Big Shoulders** (condensed signage face; headings in caps, figures, numerals) + **Bricolage Grotesque** (ink-trapped, mischievous text). 1.28 ratio. The preset stylesheet carries these two faces (`tokens/fonts-fiesta.css`), and **Martian Mono** for code comes from `tokens/fonts-martian-mono.css`, so they cost nothing unless you import it.
- **Shape**: 2px ink borders, pills for actions and chips, 18px surfaces, round avatars.
- **Depth**: the misregistered **hard offset** (`4px 4px 0 ink`), which presses flat (`--active-shift: 2px`) on `:active`.
- **Motion**: overshooting spring: things land with a bump.

### 4.5 Flightdeck: preset (dark-first)

_A glass-cockpit flight display._ `import '@mitcsutt/kiln-ui/themes/flightdeck.css'`

- **Colour**: cockpit colour convention, mapped onto Kiln's roles. **Cyan** is the accent: what the pilot sets and acts on. "You"/selected is a neutral **reverse-video box** (a brighter neutral with its text inverted), like the selected line of a flight-management display. Green, amber and red are the status tones, and info is steel blue. Neutrals are dark blue-grey display glass, never black. The light mode is the day mode of an electronic flight bag, with the cyan darkened for contrast.
- **Type**: **B612** for text, display and figures (its digits are already equal width, so columns align without a monospace), and **B612 Mono** for code. Both were designed for Airbus cockpit displays. B612 ships static 400 and 700 weights and a Latin subset only, so Latin Extended text falls back to system faces. No uppercase transforms.
- **Shape**: square instrument bezels (small radii on actions, fields and surfaces), with pill chips as annunciator capsules.
- **Depth**: hairlines, no shadow on static surfaces. Floating layers add a very subtle dark shadow, with no glow.
- **Motion**: instruments move linearly and quickly: a gentle ease-out, slightly faster than the default, no bounce.

### 4.6 Riso: preset (light-first)

_A two-drum risograph zine._ `import '@mitcsutt/kiln-ui/themes/riso.css'`

- **Colour**: two spot inks, **fluorescent pink** (the accent) and **blue** (the text colour), on bright white stock. Static structure is **screen tints** (a percentage of an ink) rather than borders. The highlight is an overprint: a pink tint with blue ink. Night mode is the same two inks on deep blue stock, not black.
- **Type**: **Shantell Sans** for every role except code, drawn from the artist Shantell Martin's own handwriting: the handmade element. It has no tabular figures, so numerals are not column-aligned. **Atkinson Hyperlegible Mono** for code. 1.25 ratio.
- **Shape**: hand-cut and mixed: generous radii on actions and surfaces, small radii on fields, pill chips.
- **Depth**: a fill change, with no shadow on static surfaces. The one misregistered moment is a hard pink offset on floating layers, as if the second drum printed slightly off.
- **Motion**: a mild spring: things land with a small overshoot.

### 4.7 Writing your own theme

A theme is one CSS file. You don't need Kiln's source to write one:

1. Start from one idea drawn from a real object or standard (§1.2), then pick two families and one accent (§2), and write a one-line reason for each choice next to its value. Run your theme past the second-order tells in §2.
2. Declare the layer order, then put every token in §3.2 inside the themes layer, scoped to your name:

   ```css
   @layer kiln.reset, kiln.tokens, kiln.themes;

   @layer kiln.themes {
     [data-theme='harbour'] {
       --font-display: 'Your Display', ui-serif, serif;
       /* …every token in DESIGN.md §3.2… */
       --color-canvas: light-dark(oklch(0.97 0.01 220), oklch(0.2 0.02 230));
       /* … */
     }
   }
   ```

3. Import it after `@mitcsutt/kiln-ui/styles.css` and select it: `<ThemeProvider theme="harbour">` or `<ThemeScope theme="harbour">`. `ThemeName` accepts any string, and `themeScript('harbour')` works the same way.
4. Load your fonts yourself (`@font-face` in the same file is fine). Kiln ships only the faces its own themes use.
5. Check every component in light and dark (Storybook's _All themes, side by side_ toolbar setting). A token you forget falls back to Paper's value at the document root (Paper is declared on `:where(:root)`), but in a nested scope it inherits the parent theme's, so set them all.

Set optional tokens (§3.3) and component tokens (§3.5) only where your idea needs them.

### 4.8 Adding a built-in preset (contributors)

1. Copy `packages/ui/src/themes/paper.css` to `<name>.css`; change the selector to `[data-theme='<name>']` (drop the `:where(:root)` default) and every value. Keep every token (§3.2).
2. Export it from `packages/ui/package.json` (both `exports` and `publishConfig.exports`), add it to `stylesheets` in `packages/ui/vite.config.ts` and to `size.config.json`, and add the name to `THEMES` and `THEME_META` in `src/theme/themes.ts`.
3. Add any new font files to `src/assets/fonts` with their licence (OFL only) and an `@font-face` file the preset imports, so the base stylesheet doesn't grow.
4. Check every story in every theme, light and dark. No component file should change.

---

## 5. Using it in an app

```tsx
// app root (once)
import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/flightdeck.css' // only the presets you use
import { ThemeProvider } from '@mitcsutt/kiln-ui'

;<ThemeProvider theme="flightdeck" defaultMode="dark">
  …
</ThemeProvider>
```

- SSR without a flash: render `<script dangerouslySetInnerHTML={{ __html: themeScript('flightdeck', 'dark') }} />` in `<head>` (same theme and `defaultMode` as the provider; a stored choice wins).
- Router links: `<Button asChild><Link to="/work">Work</Link></Button>`, `<Link asChild>`, `<NavLink asChild>`; every navigational component supports `asChild`.
- Local theme: `<ThemeScope theme="riso">…</ThemeScope>` (inherits the page's mode; `paint={false}` skips the canvas background). Portalled overlays opened inside a scope render in that scope's theme.
- Compose screens from layout primitives, not CSS:

```tsx
<Section space={9}>
  <Container width="content">
    <Split ratio="5/7" gap={7}>
      <Heading level={2} size="display-sm">
        Recent projects
      </Heading>
      <Stack gap={5} dividers>
        …
      </Stack>
    </Split>
  </Container>
</Section>
```

- Responsive visibility is a prop, not a media query: `<NavLinks hideBelow="md">` + `<BottomNav hideAbove="md">`, `<Table.Cell hideBelow="sm">`.

If a screen needs CSS beyond a layout wrapper or two, the library is probably missing a prop or a component: add it there rather than in the app.

---

## 6. Component catalogue

All exported from `@mitcsutt/kiln-ui`. Folder: `packages/ui/src/components/<group>/<Name>/`. Story titles and docs pages follow the same tree: `UI/<Group>/<Name>` ([ADR 0010](docs/adr/0010-information-architecture.md)).

| Group          | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Theme**      | `ThemeProvider`, `ThemeScope`, `useTheme`, `themeScript`, `THEMES`, `THEME_META`, `DEFAULT_THEME`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Layout**     | `Box`, `Stack`, `Inline`, `Grid`, `Split`, `Container`, `Section`, `Divider`, `AspectRatio`, `AppShell`, `VisuallyHidden`, `ActionBar`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Typography** | `Heading`, `Text`, `Link`, `Code`, `Kbd`, `Prose`, `Quote`, `Numeral`, `Amount`, `SectionHeader`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Actions**    | `Button`, `IconButton`, `ToggleChip`, `ChipGroup`, `SegmentedControl`, `ModeToggle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Inputs**     | `Field`, `Fieldset`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `PasswordInput`, `NumberInput`, `AmountInput`, `OneTimeCodeInput`, `ColorInput`, `CheckboxGroup`, `ChoiceCards`, `Slider`, `RangeSlider`, `Rating`, `Combobox`, `TagsInput`, `FileDrop`, and composed `TextField`, `TextareaField`, `SelectField`, `CheckboxField`, `PasswordField`, `NumberField`, `AmountField`, `OneTimeCodeField`, `ColorField`, `SwitchField`, `DateRangeField`, `CheckboxGroupField`, `RadioGroupField`, `SegmentedField`, `ChipGroupField`, `ChoiceCardsField`, `SliderField`, `RangeSliderField`, `RatingField`, `ComboboxField`, `TagsField`, `FileField` |
| **Display**    | `Card`, `Badge`, `Tag`, `Avatar`, `AvatarGroup`, `Stat`, `Delta`, `DataList`, `List`, `Table`, `Media`, `Marquee`, `CodeBlock`, `Stamp`, `Progress`, `Meter`, `Skeleton`, `EmptyState`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Navigation** | `Tabs`, `NavLinks`, `BottomNav`, `Accordion`, `Stepper`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Feedback**   | `Alert`, `Spinner`, `LiveIndicator`, `StatusDot`, `RelativeTime`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Overlays**   | `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tooltip`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Icons**      | `ChevronDownIcon`, `CheckIcon`, `CloseIcon`, `ArrowUpRightIcon`, … and `createIcon()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Domain components (an `InvoiceRow`, a `ProjectCard`, a `DeployStatus`) stay in the app that needs them, composed from these.

Every component has co-located stories (`<Name>.stories.tsx`): a `Playground` plus stories for real states. They must look right in every theme, light and dark.

### Inputs

Every input exists twice. The bare control (`NumberInput`, `Combobox`) works anywhere, and the `*Field` wrapper adds the label, description, error and warning. `@mitcsutt/kiln-forms` binds the `*Field`s to form state and adds no styling or markup of its own, so a form looks the same with or without it. A missing input gets built here first.

- **Errors and warnings are two channels.** `error` blocks submit, sets `aria-invalid` and renders in the critical tone. `warning` is advice ("Usernames are case-sensitive") in the caution tone that never blocks and is never `role="alert"`. An error replaces the warning while it shows.
- **Error timing is a form setting.** `@mitcsutt/kiln-forms` shows a field's error after it's blurred or after any submit attempt, then keeps it live while the user fixes it. Plain `*Field`s show whatever `error` you pass. Pass `errorLive={false}` when an `ErrorSummary` owns the announcement, and `errorHidden` when the layout shows the message somewhere else.
- **`layout` on a field.** `stack` (default) puts the label above the control, `horizontal` gives label and control their own columns (stacked below `sm`), and `inline` hides the label visually so the control sits in a sentence. Group fields built on `Fieldset` (checkbox, radio and chip groups, choice cards, date range) take the same `layout`: `Fieldset` puts the legend in the label column.
- **Submit buttons are never `disabled`.** They use `aria-disabled` with a reason, so keyboard and screen reader users can still reach them and hear why.

---

## 7. Sharing & publishing

- **In this monorepo**: packages and apps depend on `"@mitcsutt/kiln-ui": "workspace:*"` and consume `src/` directly (TypeScript and CSS Modules compiled by the consumer's Vite). No build step in development.
- **Published build** ([ADR 0005](docs/adr/0005-library-build.md)): `pnpm --filter @mitcsutt/kiln-ui build` → `dist/` (ESM, one file per module for tree-shaking, `.d.ts`, source maps), `styles.css` (fonts, tokens, reset, Paper and every component's CSS), one file per preset in `themes/`, and the fonts with their licences in `assets/fonts/`. `publishConfig.exports` swaps the source exports for `dist/` at publish time.
- **Peers**: `react`/`react-dom` `^18.3 || ^19`. Only runtime dependency: `radix-ui` (headless primitives for overlays, menus, tabs, form controls).
- **Checked in CI**: `publint`, `@arethetypeswrong/cli`, a size report with budgets (base stylesheet, a single `Button` import and more, see `packages/ui/size.config.json`), and the full test suite on React 18 and 19.
