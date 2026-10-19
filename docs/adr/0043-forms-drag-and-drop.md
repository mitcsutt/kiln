# 0043. kiln-forms reorders Repeater items by drag through an optional `./dnd` entry

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

`Repeater` in `@mitcsutt/kiln-forms` reorders its items with Move up and Move down buttons (`reorderable`). Form authors also want to drag items into place, and [ADR 0040](0040-kiln-dnd.md) now gives Kiln a drag-and-drop package, `@mitcsutt/kiln-dnd`, with one keyboard model and one announcer. Using it for the Repeater raises four questions.

- **Dependencies.** kiln-forms has one runtime dependency, `@tanstack/react-form` (its AGENTS.md). kiln-dnd brings dnd-kit's engine, about 30 kB gzip, and most forms never drag anything. Making kiln-dnd a dependency would make every consumer install it.
- **Both modes.** A schema can't hold a function, so whatever turns drag on has to be reachable from JSON (`"reorderable": "drag"`) as well as from JSX.
- **Styling.** kiln-forms has no CSS. A drop line and a lifted item need styles, and kiln-dnd's `Sortable` draws them only around list items (`li`), while a Repeater renders fieldsets, cards or table rows.
- **Words.** All of kiln-forms' text comes from `FormMessages`, overridable per kit and per form. kiln-dnd's text comes from `DndAnnouncements`.

Options considered for the dependency:

- **A runtime dependency.** Simplest, but every form pays for drag and drop in its install, whatever it imports.
- **An adapter shipped from kiln-dnd.** kiln-dnd would have to know kiln-forms' internals (array paths, the runtime, focus), and kiln-dnd is meant to be a general drag-and-drop library with no forms concept.
- **An optional peer dependency with a separate entry.** [ADR 0039](0039-subpath-or-package.md) says a small add-on to a package's component is a subpath of that package, with an optional peer that loads only when it's used, as `@mitcsutt/kiln-ui/highlight` does with Shiki ([ADR 0035](0035-code-highlighting.md)).

## Decision

**`@mitcsutt/kiln-dnd` is an optional peer dependency of kiln-forms**, a dev dependency for its tests, and is imported only by a new entry, **`@mitcsutt/kiln-forms/dnd`**. ESLint blocks a kiln-dnd import anywhere else in the package except tests, and the build keeps it external like every peer. The main entry and `./schema` never reach it, and a form that doesn't import `./dnd` never loads it. kiln-forms' runtime dependencies stay at one.

**The kit carries it.** `./dnd` exports `dragAndDrop`, and a kit takes it as a new optional input, `kit.extend({ dragAndDrop })`. `useAppForm` puts it on the form's runtime, beside the field registry. That one step serves both modes, as the kit's other registries do: `Repeater reorderable="drag"` in JSX and `"reorderable": "drag"` in a schema read it from the form. `reorderable` widens from `boolean` to `boolean | 'drag'`, so `true` and `false` mean what they did, and `parseFormSchema` accepts only `true`, `false` or `"drag"`. A repeater asking for drag in a kit without `dragAndDrop` shows the move buttons alone and warns once in development, since the item can still be moved.

**The seam is a small set of parts, not kiln-dnd's types.** `FormDragAndDrop` (a type in the main entry) is three components: `List` (one repeater's `Dnd` scope with its drop area), `Item` (one item, rendering the repeater's own element through a render prop with `ref` and `props`) and `Handle`. The main entry depends on that shape only, so its declarations never reach kiln-dnd and type-check without it installed. The shape is how the two entries talk, documented as built only by `./dnd`, so it can change in a minor.

**kiln-dnd gains `SortableItem`.** It is `useSortable` plus what `Sortable` draws around each row: the drop line, the lifted look, and the context a `DragHandle` needs, handed to any element through a render prop. `Sortable` and `Board` now render their items through it, so their DOM doesn't change. The Repeater spreads those props onto its own `Fieldset`, `Card` or `Table.Row`. kiln-forms still writes no CSS, no `style` and no class name of its own: the drag styles are kiln-dnd's, from `@mitcsutt/kiln-dnd/styles.css`, which a consumer of `./dnd` imports after kiln-ui's.

**kiln-dnd's model, kiln-forms' words.** The keyboard (Space or Enter, the arrows, Escape) and the announcements are kiln-dnd's. Their text comes from a new `FormMessages.drag` group (`instructions`, `handle`, `lifted`, `moved`, `dropped`, `canceled`, with positions counted from 1), which `./dnd` maps onto `DndAnnouncements`. The keys are optional and their English defaults ship in `./dnd`, not in `defaultMessages`, so forms that never drag don't carry the words either. The handle is named "Drag Item 1", so it can't be mistaken for "Move Item 1 up". kiln-dnd announces a drop, and the repeater doesn't announce it again.

**The form follows the item.** A drop is one `moveFieldValues`, the same call the move buttons make, so values, field meta (errors, touched) and array-level validation move with the item, and `onChange` validators run as for any move. Items stay keyed by index, as before, so a drop never remounts a field. After a keyboard drop, focus goes to the moved item's handle in its new place.

**The buttons stay.** A drag handle is added beside Move up and Move down, not instead of them: WCAG 2.2's 2.5.7 (Dragging Movements) asks for a single-pointer way to do what a drag does. The handle shows only when there is more than one item.

**Cards stack in one column while they can be dragged.** kiln-dnd's lists are one-dimensional, and a two-column grid would make the drop line and the arrow keys disagree with the layout. `variant="cards"` with `reorderable="drag"` lays its cards out in one column. Other repeaters keep their layout.

## Consequences

- Existing forms see no change: `reorderable` keeps its meaning, and a repeater without `"drag"` renders as before, with no kiln-dnd scope.
- A consumer who wants drag installs `@mitcsutt/kiln-dnd`, imports its stylesheet, and extends their kit once. Everyone else installs nothing new. Until kiln-dnd's first release, the workspace's `0.0.0` is allowed for the peer range through `peerDependencyRules`.
- kiln-dnd's majors become a reason for a kiln-forms release only through `./dnd`'s peer range, which is the trade-off ADR 0039 accepts for optional peers.
- The same entry is where other drag behaviour for forms can go, such as reordering a tags field's chips, without touching the main entry.
- `SortableItem` is new public API in kiln-dnd, useful on its own for table rows and other markup that can't be list items.
