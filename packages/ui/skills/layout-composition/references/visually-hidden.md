<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# VisuallyHidden

> Content that screen readers announce and sighted readers don't need to see.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/visually-hidden

`VisuallyHidden` keeps text in the accessibility tree while hiding it from view: the rest of a sentence a glyph implies, a heading the layout already makes obvious, a table caption.

Screen readers announce the rating above as "4.2 out of 5, from 318 passenger reviews". `as` renders it as another element, such as a heading (`as="h2"`). `focusable` makes a hidden link appear when it receives focus, which is how a skip link works.

```tsx
import { Inline, Text, VisuallyHidden } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={2}>
      <Text numeric weight="strong">
        4.2
      </Text>
      <Text tone="muted" aria-hidden="true">
        ★
      </Text>
      <VisuallyHidden>out of 5, from 318 passenger reviews</VisuallyHidden>
    </Inline>
  )
}
```

## API

`VisuallyHiddenProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `focusable` | `boolean` | `false` | Reveal the content while it (or something inside it) has keyboard focus — for skip links and other keyboard-only affordances. |
| `as` | `'div' \| 'span' \| 'label' \| 'a' \| 'h1' \| 'h2' \| 'h3'` | `span` | Default `span`. |
| `href` | `string` |  | Only for `as="a"`. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.
