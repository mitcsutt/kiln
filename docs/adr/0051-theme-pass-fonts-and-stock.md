# 0051. Riso's face and non-white light surfaces

- **Status:** Accepted (supersedes in part [0030](0030-theme-family-without-ai-tells.md))
- **Date:** 2026-10-28

## Context

[0045](0045-four-themes-each-with-a-goal.md) gave Paper, Flightdeck, Riso and Ledger a goal each. A theme pass against those goals found two choices in [0030](0030-theme-family-without-ai-tells.md) that work against them:

- **Riso's face.** 0030 sets Riso in Shantell Sans and lists as a known limit that it has no tabular figures, so numerals don't align in columns. Handwriting is also hard to read at text sizes.
- **White stock.** 0030 describes Paper's "white sheets", Ledger as "a white sheet with green rules" and Riso as "on white stock". On a bright display, a near-white fill is harsh, and with the canvas, surface, raised and sunken fills all close to white the layers blur together.

## Decision

- **Riso is set in Recursive Casual**, a readable second family for text, with tabular figures. It replaces Shantell Sans in `riso.css`, `fonts-riso.css`, the font files and the licence file.
- **Light surfaces in Paper, Ledger and Riso are no longer white.** The light-surface rule: no light fill above OKLCH L 0.97, and canvas, surface, raised and sunken are visibly distinct from one another.
- Everything else in 0030 stands, including the other themes' faces and the second-order tells list.

## Consequences

- 0030's lines on Shantell Sans, on Paper's "white sheets", on Ledger's "white sheet" and on Riso's "white stock" no longer describe the shipped themes. The limit "Shantell Sans has no tabular figures" no longer applies.
- This is a visual change to three built-in themes, so it ships as a changeset on `@mitcsutt/kiln-ui`. Apps that depend on the old look should check their screens.
- The theme docs pages and DESIGN.md describe the shipped looks.
