<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# DragHandle

> The grip a draggable item is picked up by.

Source: https://kiln.mitchellsutton.com/docs/drag-and-drop/components/drag-handle

Put `DragHandle` inside a `Sortable` or `Board` item rendered with `handle`, inside a `GridLayout.Item` (which always drags by a handle) or inside a `Draggable` with `handle`. It's a small `IconButton` named after the item ("Move Revenue") that points to the scope's keyboard instructions, so a screen reader says how to use it.

Use a handle whenever the item holds its own links, buttons or fields: clicks and keys inside the item then stay theirs, and only the handle starts a drag.

Put a `DragHandle` in each item of a `Sortable` or `Board` with `handle`, in a `Draggable` with `handle`, or in a `GridLayout.Item`. It takes its name from the item: "Move Hull marina".

```tsx
import { DragHandle, Sortable } from '@mitcsutt/kiln-dnd'
import { Inline, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Sortable
      label="Delivery route"
      defaultItems={[
        { id: 'leeds', name: 'Leeds depot' },
        { id: 'york', name: 'York, Fossgate' },
        { id: 'hull', name: 'Hull marina' },
      ]}
      getLabel={(stop) => stop.name}
      handle
    >
      {(stop) => (
        <Inline gap={3} align="center">
          <DragHandle />
          <Text>{stop.name}</Text>
        </Inline>
      )}
    </Sortable>
  )
}
```

## API

`DragHandleProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `"Move"` | The accessible name. Default "Move" and the item's label, from `announcements.handle`. |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |
| `size` | `'sm' \| 'md' \| 'lg'` | `sm` |  |
| `tone` | `'neutral' \| 'accent' \| 'critical'` |  | Colour intent. `critical` is for destructive actions only. |
| `asChild` | `boolean` |  | Render the single child element instead of a <button>, merging props and styles. Use for links: `<Button asChild><Link to="/work">Work</Link></Button>`. |
| `variant` | `'solid' \| 'outline' \| 'ghost'` |  | Visual weight. One `solid` per view is the norm — it *is* the primary action. |
| `loading` | `boolean` |  | Shows a spinner, sets `aria-busy` and disables interaction while keeping the width. |
| `shape` | `'auto' \| 'round' \| 'square'` | `auto` | `auto` (default) follows the theme's action radius — a circle where actions are pills, a small square in Ledger. `round` forces a circle; `square` uses the field radius. |
| `showTitle` | `boolean` | `false` | Also set the native `title`, so pointer users get the name on hover. Default `false`. |

Also accepts every prop of `ButtonHTMLAttributes<HTMLButtonElement>`.
