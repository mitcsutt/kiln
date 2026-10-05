<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# ActionBar

> The row of actions at the end of a form or dialog. Cancel, save, continue.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/action-bar

`ActionBar` is a row of buttons with consistent spacing and alignment: `end` by default, `between` to push a destructive action to the other side, `start` to follow a form's left edge.

`sticky` keeps the bar at the bottom of the viewport while a long form scrolls, so save is always in reach.

```tsx
import { ActionBar, Button, Stack, TextField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={5}>
      <TextField label="Route name" defaultValue="Morning commute" />
      <ActionBar>
        <Button variant="ghost" tone="neutral">
          Cancel
        </Button>
        <Button>Save route</Button>
      </ActionBar>
      <ActionBar align="between">
        <Button variant="outline" tone="critical">
          Delete route
        </Button>
        <Button>Save route</Button>
      </ActionBar>
    </Stack>
  )
}
```

## API

`ActionBarProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `align` | `'start' \| 'end' \| 'between'` | `end` | Where the actions sit on the row. Default `end`. |
| `sticky` | `boolean` | `false` | Pins the bar to the bottom of its scroll container — a canvas surface above a top hairline, at `--z-sticky`. Use inside a scrolling form/dialog body so the primary action stays reachable. |
| `gap` | `Responsive<Space>` | `3` | Space between actions. Responsive. Default `3`. |
| `as` | `'div' \| 'footer'` | `div` | Render as `footer` when the bar is the form's own closing landmark. Default `div`. |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--action-bar-surface` | sticky background, default var(--color-surface) |
| `--action-bar-line` | sticky top hairline, default var(--color-line) |
