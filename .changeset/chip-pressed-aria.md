---
'@mitcsutt/kiln-ui': patch
---

`ToggleChip` and `ChipGroup` chips read their pressed state from `aria-pressed` and `aria-checked` instead of `data-state`, so a chip wrapped in a `Tooltip` or another `asChild` trigger, which writes its own `data-state`, still looks pressed. Chips also take the disabled look from `aria-disabled="true"`.
