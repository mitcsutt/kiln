---
'@mitcsutt/kiln-ui': minor
---

`NavLinks` labels move one step up the type scale, so navigation reads like the text around it instead of at caption size. `md` (the default) is now `--text-md`, body size, and `sm` is `--text-sm`, where it was the 11px `--text-xs`. Row heights are unchanged. DESIGN.md §2 gains the rule that navigation text never uses `--text-xs` or `--text-2xs`, enforced by a test over `NavLinks`, `Tabs` and `BottomNav`.
