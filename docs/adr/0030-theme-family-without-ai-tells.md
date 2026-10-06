# 0030. New themes without the second-order AI tells

- **Status:** Accepted (amends [0003](0003-theming-model.md) and [0012](0012-design-standards.md))
- **Date:** 2026-10-06

## Context

[0003](0003-theming-model.md) shipped `paper` as the default and three presets ported from the source apps: `monograph`, `ledger` and `fiesta`. They followed DESIGN.md §2, which bans the well-known tells of generated UI: indigo, Inter, gradient text, icon cards, fade-up on scroll.

Read side by side, the four still looked generated. The research in [`docs/research/ai-design-tells.md`](../research/ai-design-tells.md) explains why. Models that are told to avoid the first-order tells converge on a second set, and each theme matched one of them:

- **Paper:** warm cream paper, graphite ink and a book serif for prose. This is a lighter version of the house style that Anthropic's own prompting guide says Claude falls back on.
- **Monograph:** a near-black canvas, one ember accent and a large serif display.
- **Ledger:** a mint canvas with a forest-green accent, which is the cream tell in a different hue, and monospace for every figure.
- **Fiesta:** apricot and coral with hard-offset "neo-brutalist" shadows.
- **Fonts:** Newsreader and Bricolage Grotesque are both on Anthropic's own list of "distinctive" fonts, so they come out of the same sampling pool the rules were meant to escape.

The rules removed the defaults but couldn't supply a direction. The fix the research supports is a specific real-world reference for each theme, applied consistently, with every choice traceable to that reference.

## Decision

- Each theme designed under this ADR takes its subject from a real working object or standard. Its colours, faces, radii and motion are documented against that subject in the stylesheet.
- **Reworked** (same names, new look):
  - **`paper`** (the default): an office that prints for everyone. Grey recycled stock, white sheets, blue-black ink as the accent and non-photo blue for "you". It is set in Golos Text, a face drawn for a national public-services website, with a plain zero and true tabular figures. Atkinson Hyperlegible Mono is used for code. No serif.
  - **`ledger`**: a columnar accounting pad. A white sheet with green rules, banknote-green actions, red negatives and a yellow highlighter. Archivo, with figures set condensed through its width axis instead of in a monospace.
- **Added** (new presets):
  - **`flightdeck`**: a glass-cockpit display, following the cockpit colour conventions. Cyan marks what the pilot sets and acts on. A selected line is boxed in reverse video. Green, amber and red are status. B612 and B612 Mono, the typefaces designed for Airbus cockpit displays. Dark-first.
  - **`riso`**: a two-drum risograph zine. Fluorescent pink and blue on white stock, with screen tints instead of borders. The only misregistered offset is on floating layers. Shantell Sans, a face drawn from the artist's own handwriting.
- **Kept unchanged:** `monograph` and `fiesta` stay exactly as they were, so nothing breaks for apps that use them. They predate these rules and still carry some of the tells, and they are listed as exempt in the test below. Their fonts move out of the base stylesheet into their own preset stylesheets.
- DESIGN.md §2 gains the second-order tells. `packages/ui/src/themes/tells.test.ts` enforces the checkable part for every built-in theme except the two kept ones: a list of banned font families, no warm-cream light canvas, and no ember, terracotta or indigo accent.
- New faces are OFL and copied from Fontsource 5.3.0, as before.

## Consequences

- **Not breaking.** Every preset name and stylesheet that existed still exists. `paper` and `ledger` change appearance and fonts, so this ships as a minor bump with a note to check screens that depend on their old look.
- The base stylesheet no longer carries Schibsted Grotesk, Newsreader or Martian Mono. A consumer theme that relied on those families arriving with `styles.css` has to load them itself, or import the Monograph preset.
- Kiln ships six themes, so the Storybook test matrix in CI grows from eight jobs to twelve.
- `docs/target-state.md` lists the added presets next to the ported ones.
- B612 ships only a Latin subset, so Flightdeck falls back to system faces for Latin Extended text.
- Monograph and Fiesta are kept for compatibility and are not the model for new themes. If they are ever redesigned, they lose their exemption in `tells.test.ts`.
- The banned list will go stale as model defaults move. Revisit it when the research is refreshed, and change the list and DESIGN.md together.
