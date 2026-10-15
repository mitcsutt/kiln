# packages/dnd: `@mitcsutt/kiln-dnd`

Drag and drop on kiln-ui: `Sortable`, `Board`, `GridLayout`, `Draggable` with `DropZone`, and the primitives under them (`Dnd`, `useDraggable`, `useDroppable`, `useSortable`). Read [ADR 0040](../../docs/adr/0040-kiln-dnd.md) first: it records the design and where it departs from [#48](https://github.com/mitcsutt/kiln/issues/48). The root [`DESIGN.md`](../../DESIGN.md) and kiln-ui's authoring guide ([`packages/ui/AGENTS.md`](../ui/AGENTS.md): API, CSS, stories, docs stories and docs pages) apply here too. This file and those are binding standards ([ADR 0012](../../docs/adr/0012-design-standards.md)).

## Rules

- **The engine stays behind one module.** Only `src/core/engine.ts` imports `@dnd-kit/*`, and only through the dynamic `import()` in `loadEngine`. ESLint blocks it anywhere else, and `src/test/publicTypes.test.ts` fails if a public declaration reaches a dnd-kit type. Kiln's engine interface is in `src/core/engineTypes.ts`.
- **The keyboard is Kiln's.** Every key goes through `DndController.keyDown`, and moves happen in data space: an index, a column, a zone, a cell. Never add dnd-kit's `KeyboardSensor` or `Accessibility` plugin.
- **Every word is in `DndAnnouncements`** (`src/core/messages.ts`), with an English default. A new string means a new key.
- **Nothing moves until the drop.** A drag changes a target (the drop line, the grid preview), and `onChange` or `onDragEnd` fires once per drop, never during the drag.
- **Nothing is written during render.** Registry records are written in layout effects (`useDragSource`, `useDroppable`), and the React compiler lint rules hold here.
- **Import kiln-ui from its barrel**, and use `#` subpath imports inside the package. Relative `../` imports are out.
- **The vendored grid maths stays as written upstream** (`src/grid/engine/`, react-grid-layout 2.3.0). Change it only with a note in the file's header, and keep `engine.test.ts` covering every function Kiln calls.
- **No export may share a name with a kiln-ui or kiln-forms export** (`src/test/exportNames.test.ts`).
- Must work on **React 18 and 19** ([ADR 0004](../../docs/adr/0004-react-18-and-19.md)), and render on a server without loading the engine (`src/test/server.test.tsx`).

## Layout

```
src/
  core/        controller (the drag state machine, the keyboard model, list and zone targets),
               engine (the only dnd-kit import), engineTypes, messages, store, context,
               useDragSource (the record, engine registration and focus return every source shares)
  hooks/       useDraggable, useDroppable, useSortable, each with its stories
  components/  one folder per component: Dnd, Sortable, Board, GridLayout, Draggable, DropZone,
               DragHandle; internal/ListEntry is the list item Sortable and Board share
  data/        the pure helpers: lists (arrayMove, moveBetween) and layout (grid items, compact,
               appendItem, removeItem, and the move, resize and keyboard-step previews)
  grid/engine/ react-grid-layout 2.3.0's core maths, vendored (MIT)
  testing/     the `./testing` entry: stubDndBrowserApis
  stories/     play-function helpers for the workbench stories (pointer drags at real coordinates)
  test/        setup, helpers and the package-wide tests
```

## Stories and tests

- Story titles: `Drag and drop/Components/<Name>` and `Drag and drop/Hooks/<hookName>` ([ADR 0010](../../docs/adr/0010-information-architecture.md)). Every component has a `Playground` whose `play` function drives it by keyboard and checks the exact announcements.
- Pointer, touch, resize, the responsive switch and reduced motion are tested in play functions, which run in Chromium (`pnpm test:storybook`), with `drag` from `#stories/play`. jsdom has no layout, so keep those out of the unit tests.
- Unit tests cover the keyboard paths, the data helpers, the engine configuration and server rendering, on React 18 and 19.
- Component tokens: `--dnd-lift-shadow` (default `--shadow-lift`), `--dnd-lift-radius`, `--dnd-drop-line`, `--dnd-placeholder-bg`, `--drop-zone-radius`, `--drop-zone-over-bg`, `--board-column-bg`, `--board-card-bg` and `--grid-layout-radius`. Each is read with a fallback.

## Commands

```bash
pnpm --filter @mitcsutt/kiln-dnd test            # Vitest on React 19
pnpm --filter @mitcsutt/kiln-dnd test:react18    # the same suite on React 18.3
pnpm --filter @mitcsutt/kiln-dnd typecheck
pnpm --filter @mitcsutt/kiln-dnd lint
pnpm --filter @mitcsutt/kiln-dnd build
pnpm --filter @mitcsutt/kiln-dnd check:package   # publint and attw on the packed tarball
pnpm --filter @mitcsutt/kiln-dnd size            # budgets, engine included and not
```

## Don'ts

- No `any`, no `@ts-ignore`.
- Don't add runtime dependencies without an ADR. Today: `@dnd-kit/dom` and `@dnd-kit/abstract`, pinned exactly.
