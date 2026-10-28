---
'@mitcsutt/kiln-dnd': minor
---

`GridLayout` items are never shorter than their content: an item whose content needs more rows than its entry gives it renders taller and the items below move down, so items no longer overlap as the grid narrows. The stored layout and `onChange` keep the entries' own heights. A pointer drag now stays inside the grid, so carrying an item past either side no longer widens the page or leaves it, and the carried item stays under the pointer instead of running ahead of it.
