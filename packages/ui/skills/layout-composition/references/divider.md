<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Divider

> A hairline rule between groups of content, optionally labelled, horizontal or vertical.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/divider

`Divider` separates groups. For a rule between every item of a list, use `Stack dividers` instead, which spaces the rules for you.

A labelled divider is a band rather than a separator: its label is content that screen readers read in place, and the rules either side of it are decorative.

A labelled divider names the group that follows. `spacing` adds space above and below from the space scale, `strong` uses the stronger line colour, and `decorative` hides the rule from assistive technology when it carries no meaning (it's a `separator` otherwise).

```tsx
import { Divider, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <Text>Morning departures</Text>
      <Divider />
      <Divider label="Afternoon" spacing={4} />
      <Divider label="Evening" labelPosition="center" strong />
      <Inline gap={3}>
        <Text size="sm">Timetable</Text>
        <Divider orientation="vertical" />
        <Text size="sm">Fares</Text>
        <Divider orientation="vertical" />
        <Text size="sm">Accessibility</Text>
      </Inline>
    </Stack>
  )
}
```

## Block label

A label can be a block: a few lines set into the rule, like a verdict and a time between two halves of a timetable. It's read in place as ordinary content.

```tsx
import { Divider, Stack, Text } from '@mitcsutt/kiln-ui'

export function BlockLabel() {
  return (
    <Divider
      labelPosition="center"
      spacing={4}
      label={
        <Stack gap={1} align="center">
          <Text size="sm" weight="strong">
            Change at Harbour Square
          </Text>
          <Text size="sm" tone="muted">
            Connection 6 minutes
          </Text>
        </Stack>
      }
    />
  )
}
```

## API

`DividerProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | Default `horizontal`. A vertical rule stretches to its flex/grid row. |
| `strong` | `boolean` | `false` | Heavier rule in `--color-line-strong` at `--border-width-strong`. |
| `label` | `ReactNode` |  | Content set into a horizontal rule, e.g. "Earlier this week". It's real content, read like any text, and may be a block (a `Stack` of lines); the rules either side are decorative. |
| `labelPosition` | `'start' \| 'center'` | `start` | Where the label sits. Default `start` (left-aligned by default); `center` for a lone break. |
| `spacing` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12` |  | Margin on both sides of the rule (block axis if horizontal, inline if vertical). |
| `decorative` | `boolean` | `false` | Purely visual: hide it from assistive tech. Use when the rule only repeats a boundary that headings or landmarks already convey. |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--divider-color` | default var(--color-line) (var(--color-line-strong) when strong) |
| `--divider-label-color` | default var(--color-ink-muted) |
