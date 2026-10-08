---
'@mitcsutt/kiln-ui': minor
---

`Box` takes `surface="accent"`, a panel in the accent colour that re-points ink, lines and the accent for its children, like `Section`'s accent band.

Status tones are now re-pointed inside every fill that re-points ink (`Box` and `Section` on `inverse`, `accent` and `cat-1` to `cat-8`), so a `Stat`, `Numeral`, `Delta`, `Text` or soft `Badge` in a status tone stays legible there. Before, they kept the page's tone colours, which could fall below AA on these fills.

**Upgrade note:** this changes how status tones look on those fills, with no opt-in. On `accent` and categorical fills, tone text now takes the fill's own ink and soft tone fills are the fill itself, so the status shows through the sign, glyph or label rather than the colour (these fills only clear AA against their own ink). On `inverse` fills each tone keeps its hue, mixed toward the band's ink. Solid tone fills (a solid `Badge`, a status dot) are unchanged. If a screen relied on a coloured status figure on a categorical or accent band, move the figure off the band or use a solid `Badge`.
