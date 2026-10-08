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

## Categorical band

`surface="cat-1"` to `"cat-8"` paints a band in a categorical colour, one person's or team's colour, matching their `Tag`. Ink and lines flip to stay legible on it.

```tsx
import { Container, Heading, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export function CategoricalBand() {
  return (
    <Section surface="cat-2" space={6}>
      <Container>
        <Stack gap={2}>
          <Heading level={2}>Ada's crew</Heading>
          <Text tone="muted">Three boats, eleven crossings this week.</Text>
        </Stack>
      </Container>
    </Section>
  )
}
```

## Surfaces and bands

`surface` is `canvas`, `surface`, `sunken`, `inverse`, `accent`, or a categorical `cat-1` to `cat-8` (a band in one person's or team's colour, matching their `Tag`). On `inverse`, `accent` and the categorical bands, the colour roles flip for everything inside, so text, links, focus rings and buttons stay legible with no extra props. Add `adaptTones` to flip the status tones too. `divider` adds a rule at the `top`, `bottom` or `both`.

## API

`SectionProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `space` | `Responsive<Space>` | `8` | Block padding (top and bottom), as a step on the space scale. Responsive. Vary it: adjacent sections should not share the same step. Default `8`. |
| `surface` | `'accent' \| 'surface' \| 'canvas' \| 'sunken' \| 'inverse' \| 'cat-6' \| 'cat-3' \| 'cat-5' \| 'cat-1' \| 'cat-2' \| 'cat-4' \| 'cat-7' \| 'cat-8'` |  | Full-bleed band colour. Omit to stay transparent on the canvas. `inverse`, `accent` and the categorical `cat-1` to `cat-8` re-point the ink, line and focus colours so children stay legible. |
| `adaptTones` | `boolean` | `false` | On an `inverse`, `accent` or categorical band, re-point the status tones too, so tone text and soft tone fills (a `Stat` delta, a toned `Numeral` or `Text`, a soft `Badge`) stay AA on the band. On `accent` and categorical bands tone text becomes the band's ink, so the sign, glyph or label carries the status; on `inverse` each tone keeps its hue. Off by default, so tones keep the page's colours. No effect on other surfaces. |
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
