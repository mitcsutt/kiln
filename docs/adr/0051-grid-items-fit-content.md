# 0051. Grid items fit their content; drags stay in the grid

- **Status:** Accepted
- **Date:** 2026-10-28

## Context

[0040](0040-kiln-dnd.md) sized every `GridLayout` item from its layout entry alone, in CSS, so the server renders the finished grid. Nothing looked at the content. When an item's content needed more rows than its `h` gave it, which happens whenever text wraps as the grid narrows, the content spilled out of the item and painted over the item below. In the demo's kiln room that happened at every width, and got worse as the window narrowed.

A pointer drag carried the item by the full pointer delta, with no limit. Carried past the grid's inline end, the absolutely positioned item widened the document, added a horizontal scrollbar and set dnd-kit's auto-scroller scrolling the window sideways; carried left, it left the page. The item's inset also followed the preview's target cell while its translate was measured from where it started, so it ran ahead of the pointer by the distance between the two cells.

## Decision

- **Content sets a floor on an item's height.** In the browser, `GridLayout` measures each item at its content's own height (in the same frame, by setting `block-size: auto` for the read, so nothing paints), whenever the grid, an item or an item's content changes size. An item whose content needs more rows renders with that many, and the items it now covers move down below it (`fitLayout` in `src/data/layout.ts`), then the layout is compacted as usual. This is only how the layout is drawn: the layout the consumer stores, the drag previews and `onChange` keep the entries' own heights, so a drop never writes a measured height back. The server and the first client render still use the entries' heights.
- **A pointer drag stays inside the grid.** The carried item is translated no further than the grid's inline sides and its top, measured from the item's offsets so the translate already applied doesn't count. It can still be carried down, since the grid grows downward as rows are added. The cell a pointer asks for is worked out from that bounded translate, so the placeholder is always under the item.
- **The carried item stays where it was picked up.** While a pointer moves it, its inset is its origin cell and the translate alone moves it; the placeholder shows the target cell. Keyboard moves are unchanged: the item itself moves cell to cell.

This ships as the default, with no option for the old behaviour.

## Consequences

- Items never overlap, at any width, whatever their content. A keyboard or corner resize can still ask for fewer rows than the content needs; the item then stays at its content's height, and the announcement gives the stored size.
- Content that shrinks without changing an item's size (a panel collapsing inside a stretched card) is picked up on the next resize of the grid or the item, not at once.
- Horizontal content is still the consumer's to fit: a grid with twelve columns at phone width gives each column a few pixels. `columns` per breakpoint is the way to reflow a dashboard at narrow widths, and the demo's kiln room now does that.
