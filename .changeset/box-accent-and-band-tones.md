---
'@mitcsutt/kiln-ui': minor
---

`Box` takes `surface="accent"`, a panel in the accent colour that re-points ink, lines and the accent for its children, like `Section`'s accent band.

`Box` and `Section` take `adaptTones`, which re-points status tones on an `inverse`, `accent` or categorical `cat-1` to `cat-8` fill, so a `Stat`, `Numeral`, `Delta`, `Text` or soft `Badge` in a status tone stays AA there. On `accent` and categorical fills tone text takes the fill's own ink and soft tone fills are the fill itself, so the status shows through the sign, glyph or label; on `inverse` each tone keeps its hue, mixed toward the band's ink. It's off by default, so existing bands look as before.
