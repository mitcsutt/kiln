# 0053. Ledger: graphite and ruling, with ink actions

- **Status:** Accepted (amends [0030](0030-theme-family-without-ai-tells.md))
- **Date:** 2026-10-28

## Context

[0030](0030-theme-family-without-ai-tells.md) set Ledger's look as "a white sheet with green rules, banknote-green actions, red negatives and a yellow highlighter". [0045](0045-four-themes-each-with-a-goal.md) then gave it a goal: numbers people have to trust (money, records, dense tables, reconciliation), precise and calm, light-first with an authored dark mode.

Scored against that goal, banknote green does two jobs that clash. Green is already the positive tone, the colour of money coming in. With green actions, green lines and a green first chart series as well, a reader can't tell at a glance whether a green figure means money in, good, or a button. A review of the candidate directions found exactly that. The green ruling was a second problem: it tinted every divider, so green also drew the structure of the page.

Three directions were built and measured for Ledger in a theme lab:

- **Bond and banknote:** the shipped idea, refined. Its warm light canvas trips the cream-palette check in the impeccable detector, and its accent collides with the positive tone.
- **Ruled:** neutral sheets, ink actions, and the pad's green ruling kept in every line.
- **Graphite and ruling:** Ruled with graphite rules instead of green ones, and denser, squarer shape tokens.

The maintainer chose Graphite and ruling over Ruled, because Ruled's green borders were the part they didn't want.

## Decision

- **Ledger stays an accountant's columnar pad, worked in graphite.** This replaces the Ledger line in 0030's decision:
  - **Sheets and rules:** cool grey sheets at hue 230 with chroma under 0.01, ruled in graphite hairlines. No green in any line, divider or chart grid.
  - **Actions:** the primary action is solid ink (`oklch(0.27 0.012 240)` light, `oklch(0.9 0.008 230)` dark), like a stamped entry. Banknote green is no longer the action colour.
  - **Colour only on numbers:** green for money in, accounting red for money out, a yellow highlighter for the line you circled. The diverging ramp is red out and green in.
  - **Chart series:** the categorical colours run blue, violet, teal and so on, with no green or red series, so a green bar never means anything but money in.
  - **Focus is the auditor's blue pencil:** `oklch(0.52 0.12 240)` (#0070a6) light and `oklch(0.78 0.11 240)` (#71c1f7) dark. It is generated from the hue and clears 3:1 on every fill a ring sits beside. It stays at least 60° of hue and 0.1 ΔE_OK from the critical and positive tones, so it never reads as validation. Ink focus would vanish against an ink button, which is why Ledger gets a coloured ring.
- **Ledger keeps everything else from 0030 and 0045:**
  - **Type:** Archivo throughout, with figures set condensed through its width axis instead of in a monospace, and Atkinson Hyperlegible Mono for code only.
  - **The totals rule:** a double rule over a table's totals (`--table-foot-rule`).
  - **Goal and lead mode:** unchanged.
- **Shape and size follow the lab direction:**
  - **Body type:** a 16px base, up from 15px, which was too small to read in dense tables.
  - **Density:** 0.94.
  - **Radii:** 2px actions and fields, 4px surfaces.
- **Not the generic dark dashboard.** A neutral grey palette with an ink primary is close to the common developer-tool default. Ledger keeps its own character through things that palette doesn't have:
  - the condensed Archivo figures;
  - the double totals rule;
  - the yellow highlighter;
  - green and red that only ever mean in and out;
  - the blue pencil focus;
  - the stamp-tight radii.

## Consequences

- **Breaking only in appearance.** Ledger changes its accent, lines, canvas, type size and density, so screens that relied on green buttons or green rules look different. kiln-ui is `0.x`, so this ships as a minor bump ([0008](0008-versioning-and-release.md)).
- **Light canvases sit close together.** Ledger's light canvas (#f3f7f8) is ΔE_OK 0.02 from the other light canvases in the lab. That is the floor the lab accepted for every theme in that mode, so the fonts, the ink primary and the rules carry Ledger's identity in light mode more than the paper does.
- **The red money column is still missing.** It needs an optional token and remains a later change, as 0030 recorded.
- **DESIGN.md changes with this record:** §4 now describes Ledger this way, and its focus rule names the theme-hue option Ledger uses.
