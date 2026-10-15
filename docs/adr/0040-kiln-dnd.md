# 0040. kiln-dnd: dnd-kit's DOM engine for pointers, Kiln's own keyboard model

- **Status:** Accepted
- **Date:** 2026-10-15

## Context

[#48](https://github.com/mitcsutt/kiln/issues/48) settled the shape of `@mitcsutt/kiln-dnd`, a general drag-and-drop library ([0039](0039-subpath-or-package.md) made it a package of its own). It has one engine, one keyboard model and one announcer across `Sortable`, `Board`, `Draggable` with `DropZone`, and `GridLayout`, and it treats layouts as plain data. Its grilling rounds and the GridLayout spike chose `@dnd-kit/react` 0.5 as the engine. They also chose react-grid-layout 2.3.0's `core` maths, vendored, and recorded the dnd-kit 0.5 quirks a real package would have to work around.

Building it showed that some of those choices would make the result worse than it needs to be:

- **The engine has to load on the client only** (accepted spike decision 1), but `@dnd-kit/react` is a set of hooks. A hook can't be swapped in after a dynamic `import()`, because React needs the same hooks in the same order on every render. So either every item mounts twice, or the React bindings can't be lazy at all.
- **dnd-kit's `KeyboardSensor` moves a dragged item by pixels**, and collision detection then decides the target. That's where the spike's quirks came from: `dragmove` lagging a step, Shift+arrow hard-coded to five times the offset, and a capture-phase listener to resize. It also can't run without layout, so no keyboard test can run in jsdom. The spike had already moved grid resizing to Kiln's own handler (accepted decision 2).
- **Reordering a list live under the pointer** makes the target move under the pointer, so it flickers between neighbours. #48 already asked for a drop line in lists and a placeholder in grids.

## Decision

**Engine.** kiln-dnd depends on `@dnd-kit/dom` and `@dnd-kit/abstract` (0.5.0, pinned exactly in the catalog), the framework-free core under `@dnd-kit/react`. It doesn't use `@dnd-kit/react`. Kiln's hooks are ordinary React hooks that create dnd-kit's `Draggable` and `Droppable` entities in effects, once `Dnd` has loaded the engine with `import()` in the browser. One module, `src/core/engine.ts`, imports dnd-kit (ESLint enforces it). No public declaration reaches a dnd-kit type (`src/test/publicTypes.test.ts`). `engineProps` passes options to the manager, outside semver.

**dnd-kit does the pointer; Kiln does everything else.** The engine runs the pointer sensor, collision detection, auto-scroll and the lifted overlay. Its `Accessibility` plugin, `KeyboardSensor` and drop animation are off. Activation: mouse and pen start once the pointer moves 5px, so a click stays a click, and touch needs a 250ms press with 5px of tolerance.

**One keyboard model, in data space, owned by Kiln.** Space or Enter picks up and drops, the arrows move, Escape cancels, and leaving the handle (Tab, a click elsewhere) cancels too. A move changes a target in data space: an index in a list, a column and index on a board, the next drop zone in document order, or a cell on a grid (Shift resizes). This is the spike's Kiln-owned resize handler, extended to every key. Announcements say exactly where the item is, the same keys work in every pattern, and every keyboard path can be tested in jsdom. Focus stays on the handle, and returns to it after a drop re-renders the item somewhere else.

**One announcer per scope.** `Dnd` renders a live region and the hidden instructions every handle points to with `aria-describedby`. All the words are in `DndAnnouncements`, with English defaults; `announcements` replaces any subset. Pointer moves are announced once the pointer settles (300ms), and keyboard moves straight away.

**Nothing moves until the drop.** Lists and boards draw a drop line on the item the drop lands next to. Grids preview the layout, with a placeholder for a pointer drag, and the preview is always a pure function of the committed layout plus the requested cell. `onChange` fires once per drop and never during the drag. A pointer drag lifts the real element into the top layer, through dnd-kit's `clone` feedback, and leaves a faded copy in place. The lift uses kiln-ui's `--shadow-lift`, and `--shadow-float` with kiln-ui 0.6, which predates it, so the peer range can stay `>=0.6.0`. A grid item moves itself under the pointer instead (`feedback: 'none'`), so its placeholder and the reflowing items stay in the grid.

**Grid maths, vendored.** react-grid-layout 2.3.0's collision, sort, layout, compactor and responsive functions are in `src/grid/engine/`, with the MIT notice in each file and in the package `LICENSE`, and with tests for every function. Two changes from #56:

- `resizeItemInDirection` isn't vendored. It resizes in pixels from eight handles, while Kiln resizes in grid units, from one corner by pointer and with Shift and the arrows by keyboard (`resizeInLayout`).
- `cloneLayoutItem` copies every field, so a consumer's own fields survive a move.

A keyboard step keeps moving the requested cell until the item's place actually changes. Vertical compaction often pulls an item one row down straight back up, and a key press that does nothing helps nobody.

**Breakpoints on the grid's width.** `columns` takes Kiln's breakpoint names (`base`, `sm`, `md`, `lg`, `xl`) at Kiln's widths. They're measured against the grid's own width with a `ResizeObserver`, not the viewport, so a grid in a narrow pane gets fewer columns, and no element becomes a size container ([`packages/ui/AGENTS.md`](../../packages/ui/AGENTS.md)). The server and the first client render use the widest layout. One layout is stored, the widest, as #48 decided. Narrower ones are generated with `findOrGenerateResponsiveLayout` and are read-only: an edit there would have no stored layout to go to. A handle pressed there says so. Per-breakpoint layouts can come in a later minor.

**Budgets.** The whole package, engine included, has a 45 kB gzip budget, and `GridLayout` with its engine has 44.2 kB (the spike's 40.2 kB plus 10%). Both are met: 41.2 kB and 38.6 kB, because `@dnd-kit/react` isn't in the bundle. The spike's 6 kB budget for Kiln's own code measured the grid alone. Five patterns, three hooks and the controller come to 12.5 kB, so that budget is 13.8 kB (the measurement plus 10%). `size-report.ts` gained `withDependencies` for checks that count the engine and the lazily loaded chunk.

**Tests.** Unit tests run in jsdom on React 18 and 19, including every keyboard path. Pointer, touch, corner resize, placeholder, the responsive switch and reduced motion are Storybook play functions, which the Vitest addon runs in Chromium. They dispatch pointer events at real coordinates, in every theme and mode, with axe. The jsdom stubs the engine needs ship as `@mitcsutt/kiln-dnd/testing`.

## Consequences

- The engine is a dependency of kiln-dnd alone. A dnd-kit upgrade, or a swap to another engine, touches `src/core/engine.ts` and nothing a consumer can see.
- Keyboard dragging works before the engine has loaded, and without it.
- Kiln owns more code than a thin wrapper would: the controller, the targets and the announcements. That's what keeps the keyboard model the same in every pattern.
- `SortableTree` (#48 item 10) is still out of v1. It would be one more behaviour on the same controller.
- The first publish of `@mitcsutt/kiln-dnd` follows [releasing.md](../releasing.md): a placeholder `0.0.0` published by hand, a trusted publisher, then the batched release bumps it to `0.1.0`.
