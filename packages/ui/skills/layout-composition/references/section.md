<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Section

> A full-bleed band of vertical space, with an optional surface and rules. Put a Container inside it for width.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/section

`Section` is how a page gets its rhythm: each band pads itself top and bottom with a step from the space scale, and can paint a surface across the full width. Width is the `Container`'s job, so a section is almost always `Section` then `Container`.

Vary `space` between neighbours. The scale is non-linear for this reason: a page of `space={8}` everywhere has no rhythm at all.

```tsx
import { Button, Container, Heading, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <>
      <Section space={7}>
        <Container width="text">
          <Stack gap={3}>
            <Heading level={3} size="2xl">
              Ride the coast for less
            </Heading>
            <Text tone="muted">An annual pass covers every ferry and bus in the bay.</Text>
          </Stack>
        </Container>
      </Section>
      <Section space={6} surface="inverse" divider="top">
        <Container width="text">
          <Stack gap={4} align="start">
            <Text>Commuting every day? The pass pays for itself in five weeks.</Text>
            <Button>Buy an annual pass</Button>
          </Stack>
        </Container>
      </Section>
    </>
  )
}
```

## Surfaces and bands

`surface` is `canvas`, `surface`, `sunken`, `inverse` or `accent`. On `inverse` and `accent`, the colour roles flip for everything inside, so text, links, focus rings and buttons stay legible with no extra props. `divider` adds a rule at the `top`, `bottom` or `both`.

## API

`SectionProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `space` | `Responsive<Space>` | `8` | Block padding (top and bottom), as a step on the space scale. Responsive. Vary it: adjacent sections should not share the same step. Default `8`. |
| `surface` | `'accent' \| 'surface' \| 'canvas' \| 'sunken' \| 'inverse'` |  | Full-bleed band colour. Omit to stay transparent on the canvas. `inverse` and `accent` re-point the ink, line and focus colours so children stay legible. |
| `divider` | `'top' \| 'bottom' \| 'both'` |  | A hairline across the full bleed at the top, bottom or both edges. |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer'` | `section` |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--section-fill` | / --section-on   (read-only) the band's fill and ink on inverse/accent |
| `--section-space-default` | block padding when `space` is unset (default var(--space-8)) |
| `--section-divider-color` | hairline colour for `divider` (default var(--color-line)) |
