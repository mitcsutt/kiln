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

## API

`BoxProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `padding` | `Responsive<Space>` |  | Padding on every side. Responsive. |
| `paddingX` | `Responsive<Space>` |  | Inline (left/right) padding; overrides `padding` on that axis. Responsive. |
| `paddingY` | `Responsive<Space>` |  | Block (top/bottom) padding; overrides `padding` on that axis. Responsive. |
| `surface` | `'none' \| 'surface' \| 'canvas' \| 'sunken' \| 'raised' \| 'inverse'` | `none` | Background fill. `inverse` also re-points ink and line colours for its children. |
| `border` | `boolean` | `false` | Hairline border in `--color-line`. One edge treatment per element — a border *or* a fill. |
| `radius` | `'none' \| 'surface' \| 'field' \| 'media'` | `none` | Corner radius, by role. |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer' \| 'li' \| 'span'` | `div` |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.
