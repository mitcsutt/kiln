<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# ScrollArea

> A scroll container for content wider or taller than the page, such as a bracket, a timeline or a wide board, that keyboard users can reach and scroll.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/scroll-area

`ScrollArea` lets one wide thing scroll on its own instead of pushing the page sideways. Give it a `label` and it's a named region in the tab order, so someone without a mouse or touch screen can focus it and scroll with the arrow keys. The scrollbar takes the theme's line colour.

A data table doesn't need one: `Table` scrolls sideways itself, and takes the same `label`.

Something wider than the page, such as a knockout bracket, scrolls inside a `ScrollArea` instead of pushing the page sideways. Its `label` makes it a named region that keyboard users can focus and scroll with the arrow keys.

```tsx
import { Badge, Card, Inline, ScrollArea, Stack, Text } from '@mitcsutt/kiln-ui'

const ROUNDS = [
  { round: 'Round of 16', ties: ['Kelso Bay 2–1 Old Quay', 'Harbour Square 0–0 Marram Point'] },
  { round: 'Quarter-finals', ties: ['Kelso Bay 3–2 North Point', 'Harbour Square 1–0 Eastgate'] },
  { round: 'Semi-finals', ties: ['Kelso Bay 1–1 Harbour Square'] },
  { round: 'Final', ties: ['Saturday 14:00 at Harbour Park'] },
]

export function Usage() {
  return (
    <ScrollArea label="Knockout rounds">
      <Inline gap={4} wrap={false}>
        {ROUNDS.map((r) => (
          <Card key={r.round}>
            <Card.Body>
              <Stack gap={2} align="start">
                <Text weight="medium">{r.round}</Text>
                {r.ties.map((tie) => (
                  <Badge key={tie} variant="outline">
                    {tie}
                  </Badge>
                ))}
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Inline>
    </ScrollArea>
  )
}
```

## API

`ScrollAreaProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` |  | Names the area. With a name (this, or `aria-labelledby`) it becomes a labelled region that keyboard users can focus and scroll with the arrow keys. |
| `axis` | `'both' \| 'x' \| 'y'` | `x` | Which way it scrolls. On `x` and `both` the content keeps its natural width, so a row of cards scrolls instead of squeezing. `y` and `both` scroll once a parent gives the area a height (a grid row, a pane). Default `x`. |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--scroll-area-thumb` | default var(--color-line-strong) — the scrollbar's thumb |
