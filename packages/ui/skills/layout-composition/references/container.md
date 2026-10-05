<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Container

> Centres content at a readable maximum width, with a fluid gutter outside it.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/container

`Container` sets a maximum width and centres its content. The gutter sits _outside_ the width, so `width="text"` is a true reading measure at any screen size.

```tsx
import { Container, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      {(['narrow', 'text', 'content'] as const).map((width) => (
        <Container key={width} width={width}>
          <Text size="sm" tone="muted">
            width=&quot;{width}&quot;: the timetable for the coastal line, laid out to this width.
          </Text>
        </Container>
      ))}
    </Stack>
  )
}
```

| `width`   | Max width | For                                 |
| --------- | --------- | ----------------------------------- |
| `narrow`  | 32rem     | sign-in, short forms, confirmations |
| `text`    | 42rem     | articles and long reading           |
| `content` | 68rem     | most pages (the default)            |
| `wide`    | 84rem     | dashboards and wide tables          |
| `full`    | 100%      | edge to edge, inside the gutter     |

Pass `gutter={false}` when the parent already pads its content.

## API

`ContainerProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `'content' \| 'narrow' \| 'text' \| 'wide' \| 'full'` |  | Maximum content width: `narrow` 32rem · `text` 42rem (prose measure) · `content` 68rem (default) · `wide` 84rem · `full` (no maximum). |
| `gutter` | `boolean` | `true` | Keep the fluid page gutter on either side. Default `true`. |
| `as` | `'div' \| 'section' \| 'article' \| 'header' \| 'footer' \| 'main' \| 'nav'` |  |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--container-gutter` | default var(--gutter) (fluid, from foundation.css) |
