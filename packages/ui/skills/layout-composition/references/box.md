<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Box

> Padding, a surface and an edge, and nothing else. The escape hatch when no other layout fits.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/box

`Box` adds padding, a background surface, a border and a radius to its content. Reach for `Stack`, `Inline` or `Grid` to arrange things, and for `Card` when something is a self-contained object. `Box` is for the wells and frames left over.

`surface="inverse"` flips the colour roles inside, like an inverse `Section`.

```tsx
import { Box, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <Box padding={{ base: 4, md: 5 }} surface="sunken" radius="surface">
        <Text>Sunken: a well for secondary content.</Text>
      </Box>
      <Box padding={5} border radius="surface">
        <Text>Bordered: a hairline frame.</Text>
      </Box>
      <Box padding={5} surface="inverse" radius="surface">
        <Text>Inverse: colour roles flip inside.</Text>
      </Box>
    </Stack>
  )
}
```

## Accent panel

`surface="accent"` is a rounded panel in the accent colour, for the one thing on a page that should shout. Text, links and buttons inside it take the accent's own ink.

```tsx
import { Box, Stack, Text } from '@mitcsutt/kiln-ui'

export function AccentPanel() {
  return (
    <Box surface="accent" padding={5} radius="surface">
      <Stack gap={2}>
        <Text weight="medium">Ferry tickets go on sale Monday at 09:00</Text>
        <Text size="sm">Weekend crossings sell out within the hour, so set a reminder.</Text>
      </Stack>
    </Box>
  )
}
```

## API

`BoxProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `padding` | `Responsive<Space>` |  | Padding on every side. Responsive. |
| `paddingX` | `Responsive<Space>` |  | Inline (left/right) padding; overrides `padding` on that axis. Responsive. |
| `paddingY` | `Responsive<Space>` |  | Block (top/bottom) padding; overrides `padding` on that axis. Responsive. |
| `surface` | `'none' \| 'accent' \| 'surface' \| 'canvas' \| 'sunken' \| 'raised' \| 'inverse' \| 'cat-6' \| 'cat-3' \| 'cat-5' \| 'cat-1' \| 'cat-2' \| 'cat-4' \| 'cat-7' \| 'cat-8'` | `none` | Background fill. `inverse`, `accent` and the categorical `cat-1` to `cat-8` (one person's or team's colour, matching their `Tag`) also re-point ink, line and accent colours for its children, so they stay legible on the fill. |
| `adaptTones` | `boolean` | `false` | On an `inverse`, `accent` or categorical fill, re-point the status tones too, so tone text and soft tone fills (a `Stat` delta, a toned `Numeral` or `Text`, a soft `Badge`) stay AA on the fill. On `accent` and categorical fills tone text becomes the fill's ink, so the sign, glyph or label carries the status; on `inverse` each tone keeps its hue. Off by default, so tones keep the page's colours. No effect on other surfaces. |
| `border` | `boolean` | `false` | Hairline border in `--color-line`. One edge treatment per element — a border *or* a fill. |
| `radius` | `'none' \| 'surface' \| 'field' \| 'media'` | `none` | Corner radius, by role. |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer' \| 'li' \| 'span'` | `div` |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.
