---
'@mitcsutt/kiln-ui': patch
---

Components that size or colour an inner Icon, Spinner, Button or TagList through `className` now win on specificity instead of stylesheet order: TreeTable's chevron, FileDrop's icon, Checkbox's tick and dash, Combobox's chevron, check, spinner and chip list, DateRangePickerField's presets, field error and warning icons and the validating spinner, CommandPalette's search icon, chevron and spinner, and an external Link's arrow. Each rule used to tie with the inner component's base rule, so a Next.js build that loaded the CSS in the other order changed them (TreeTable chevrons and FileDrop icons shrank from 16px to 12.8px).
