---
name: layout-composition
description: "Use when laying out a screen, page or panel with @mitcsutt/kiln-ui: Stack, Inline, Grid, Split, Section and Container with typed props such as gap, align, width, ratio, space and surface, instead of utility classes, inline styles, margins or custom CSS."
metadata:
  purpose: Build screens from kiln-ui's layout primitives and the space scale, so spacing and structure come from props and the theme.
  type: core
  library: "@mitcsutt/kiln-ui"
sources:
  - mitcsutt/kiln:apps/docs/content/docs/ui/foundations/spacing.mdx
  - mitcsutt/kiln:packages/ui/src/components/layout/Stack/Stack.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Inline/Inline.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Grid/Grid.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Split/Split.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Section/Section.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Container/Container.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Box/Box.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/AppShell/AppShell.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/ActionBar/ActionBar.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/Divider/Divider.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/AspectRatio/AspectRatio.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/ScrollArea/ScrollArea.tsx
  - mitcsutt/kiln:packages/ui/src/components/layout/VisuallyHidden/VisuallyHidden.tsx
  - mitcsutt/kiln:apps/docs/content/docs/ui/patterns/dashboard.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/patterns/settings.mdx
  - mitcsutt/kiln:apps/docs/content/docs/ui/patterns/checkout.mdx
---

<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Compose layout with typed props

Build screens from kiln-ui's layout primitives and the space scale, so spacing and structure come from props and the theme.

## Spacing

A non-linear space scale that follows the theme's density, content widths, and props that change per breakpoint.

Space is a scale of twelve steps, and props take the step number: `gap={5}`, `padding={4}`, `space={9}`. You never write a pixel value at a call site.

### The scale

The steps are deliberately non-linear (4, 8, 12, 16, 24, 32, 48, 64, 96, 144, 192 and 256px at density 1), so neighbouring choices look different from each other. Each step is multiplied by the theme's `--density`. The bars below are measured in the theme you're looking at: switch to Ledger and they tighten.


Vary the rhythm. Adjacent sections shouldn't share a `space` step, and a page usually wants one generous break somewhere (`space={9}` or more) rather than the same gap everywhere.

### Density

`data-density` multiplies the theme's own density for a subtree: `compact` by 0.85, `comfortable` by 1.15. Spacing, control heights and gaps all follow. Use it for a dense admin table inside an otherwise roomy page.

```tsx
import { Button, Inline, Stack, Text, TextField } from '@mitcsutt/kiln-ui'

export function Density() {
  return (
    <Inline gap={7} align="start">
      {(['compact', undefined, 'comfortable'] as const).map((density) => (
        <div key={density ?? 'default'} data-density={density}>
          <Stack gap={4}>
            <Text size="sm" tone="muted">
              {density ?? 'Theme default'}
            </Text>
            <TextField label="Berth" defaultValue="3" />
            <Button size="sm">Board now</Button>
          </Stack>
        </div>
      ))}
    </Inline>
  )
}
```

### Widths

`Container width` and `Text measure` take named widths rather than lengths:

| Width     | Size  | For                                   |
| --------- | ----- | ------------------------------------- |
| `narrow`  | 32rem | sign-in forms, confirmations          |
| `text`    | 42rem | reading: about 68 characters of body  |
| `content` | 68rem | most pages                            |
| `wide`    | 84rem | dashboards, tables with many columns  |
| `full`    | 100%  | edge-to-edge, still inside the gutter |

`--gutter` is fluid (1rem to 2.5rem), and `Container` applies it unless you pass `gutter={false}`.

### Responsive props

Layout props that make sense per breakpoint take either a value or a map of values, from `base` up:

```ts
type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>
```

```tsx
import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const STOPS = ['Harbour', 'Northpoint', 'Kelso Bay', 'Ferry Lane', 'Old Quay', 'Marram Point']

export function ResponsiveProps() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 3, md: 5 }}>
      {STOPS.map((stop) => (
        <Box key={stop} padding={4} border radius="surface">
          <Text weight="medium">{stop}</Text>
        </Box>
      ))}
    </Grid>
  )
}
```

Breakpoints are mobile-first viewport widths: `sm` 40em, `md` 48em, `lg` 64em, `xl` 80em. Structural components also take `hideBelow` and `hideAbove`, so responsive visibility is a prop too: `<NavLinks hideBelow="md">` beside `<BottomNav hideAbove="md">`.

### Control heights

Inputs, buttons and selects share three heights, which follow density like everything else: `--control-sm` (32px), `--control-md` (40px) and `--control-lg` (48px). A `size` prop on a control picks one, so a button and a field of the same size line up in a row.

## Stack

A column of things with consistent space between them. The layout you'll reach for most.

`Stack` lays its children out vertically with a gap from the space scale. Most screens are stacks of stacks, so most spacing in a Kiln app is a `gap` prop rather than a margin.

`align` sets the cross-axis alignment (`stretch` by default, so children fill the width). Use `align="start"` when a child like a button should keep its own width.

```tsx
import { Button, Heading, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4} align="start">
      <Heading level={3} size="xl">
        Night bus N14
      </Heading>
      <Text tone="muted">Every 20 minutes from Harbour Square until 04:40.</Text>
      <Button size="sm">Save route</Button>
    </Stack>
  )
}
```

### Rules between items

`dividers` draws a hairline between every child, centred in the gap. It's usually better than a card per item: lists, settings rows and timelines read as one document.

```tsx
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'

const STOPS = [
  { name: 'Harbour Square', time: '23:10' },
  { name: 'Northpoint Library', time: '23:18' },
  { name: 'Kelso Bay Pier', time: '23:31' },
]

export function Dividers() {
  return (
    <Stack gap={{ base: 3, md: 4 }} dividers>
      {STOPS.map((stop) => (
        <Inline key={stop.name} justify="between">
          <Text>{stop.name}</Text>
          <Text numeric tone="muted">
            {stop.time}
          </Text>
        </Inline>
      ))}
    </Stack>
  )
}
```

### Responsive gaps and elements

`gap` and `align` take responsive values: `gap={{ base: 3, md: 4 }}`. Render a list with `as="ul"` (or `ol`) and list semantics are kept even though the bullets are gone.

### API

`StackProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `Responsive<Space>` |  | Space between children, as a step on the theme's space scale. Responsive. |
| `align` | `Responsive<Align>` | `stretch` | Cross-axis alignment. Responsive. Default `stretch`. |
| `dividers` | `boolean` | `false` | Draw a hairline rule between children (the rule sits in the middle of the gap). |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer' \| 'main' \| 'nav' \| 'ul' \| 'ol' \| 'li' \| 'form' \| 'fieldset'` | `div` | Render as a different element. Lists get `role="list"` semantics preserved. |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

## Inline

Things in a row that wrap when they run out of room. Button rows, tag lists, toolbars and meta lines.

`Inline` lays its children out horizontally with a gap, vertically centred, wrapping onto new lines when they don't fit.

`justify` spreads the row (`between` pushes the groups to either end) and takes responsive values, so a header can stack its groups on a phone and spread them from `md` up. `wrap={false}` keeps everything on one line; children then shrink instead. `rowGap` sets the space between wrapped lines when it should differ from `gap`.

```tsx
import { Badge, Button, Inline, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={3} justify={{ base: 'start', md: 'between' }}>
      <Inline gap={2}>
        <Text weight="strong">Route 7</Text>
        <Badge tone="caution">Diverted</Badge>
      </Inline>
      <Inline gap={2}>
        <Button size="sm" variant="outline" tone="neutral">
          Share
        </Button>
        <Button size="sm">Track live</Button>
      </Inline>
    </Inline>
  )
}
```

### API

`InlineProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `Responsive<Space>` |  | Space between items (both axes when wrapping). Responsive. |
| `rowGap` | `Responsive<Space>` |  | Row gap when wrapped, if different from `gap`. Responsive. |
| `align` | `Responsive<Align>` | `center` | Cross-axis alignment. Default `center`. Responsive. |
| `justify` | `Responsive<Justify>` | `start` | Main-axis distribution. Default `start`. Responsive. |
| `wrap` | `boolean` | `true` | Wrap onto new lines. Default `true`. |
| `as` | `'div' \| 'header' \| 'footer' \| 'nav' \| 'ul' \| 'ol' \| 'li' \| 'span' \| 'p'` | `div` |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

## Grid

Two-dimensional layout, either with a column count per breakpoint or as an auto-fill grid that needs no breakpoints.

`Grid` has two modes. With `columns`, you choose how many equal columns there are, per breakpoint. With `minItemWidth`, the grid fits as many columns as there's room for, each at least that wide, so it adapts to its container without a single breakpoint.

One column on a phone, two from `sm` and four from `lg`.

```tsx
import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const LINES = ['Red', 'Harbour', 'Coastal', 'Night', 'Airport', 'Orbital', 'Market', 'University']

export function Columns() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      {LINES.map((line) => (
        <Box key={line} padding={4} border radius="surface">
          <Text weight="medium">{line} line</Text>
        </Box>
      ))}
    </Grid>
  )
}
```

### Auto-fill

`minItemWidth` takes `xs` (12rem), `sm` (16rem), `md` (20rem) or `lg` (24rem).

```tsx
import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

const PIERS = ['North pier', 'South pier', 'Ferry terminal', 'Lifeboat station', 'Fish market']

export function AutoFill() {
  return (
    <Grid minItemWidth="xs" gap={4}>
      {PIERS.map((pier) => (
        <Box key={pier} padding={4} surface="sunken" radius="surface">
          <Text>{pier}</Text>
        </Box>
      ))}
    </Grid>
  )
}
```

### Spanning columns

`Grid.Item` spans columns (`span`) or starts at one (`start`), both responsive. Use it in `columns` mode.

```tsx
import { Box, Grid, Text } from '@mitcsutt/kiln-ui'

export function Items() {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      <Grid.Item span={{ base: 1, md: 2 }}>
        <Box padding={5} border radius="surface">
          <Text weight="medium">Live map</Text>
        </Box>
      </Grid.Item>
      <Box padding={5} border radius="surface">
        <Text weight="medium">Next departures</Text>
      </Box>
      <Grid.Item span={{ base: 1, md: 3 }}>
        <Box padding={5} surface="sunken" radius="surface">
          <Text tone="muted">Service updates</Text>
        </Box>
      </Grid.Item>
    </Grid>
  )
}
```

### API

`GridProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `Responsive<GridColumns>` |  | A fixed track count, 1–12. Responsive: `{ base: 1, sm: 2, lg: 4 }`. |
| `minItemWidth` | `'sm' \| 'md' \| 'lg' \| 'xs'` |  | Fit as many tracks as there's room for, each at least this wide (xs 12rem · sm 16rem · md 20rem · lg 24rem). No breakpoints needed. |
| `gap` | `Responsive<Space>` |  | Space between cells (both axes). Responsive. |
| `rowGap` | `Responsive<Space>` |  | Row gap, if different from `gap`. Responsive. |
| `align` | `Responsive<Align>` | `stretch` | Cell alignment on the block axis. Default `stretch`. Responsive. |
| `as` | `'div' \| 'section' \| 'ul' \| 'ol' \| 'dl'` | `div` |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

`GridItemProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `span` | `Responsive<GridSpan>` |  | Columns to span, or `full` for edge to edge. Responsive. |
| `start` | `Responsive<GridColumns>` |  | Column line to start on (1-based). Responsive. |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'li'` |  |  |
| `hideBelow` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). |
| `hideAbove` | `'sm' \| 'md' \| 'lg' \| 'xl'` |  | Hide from this breakpoint up (e.g. `md` → shown on phones only). |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

#### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--grid-min-xs` | 12rem   --grid-min-sm  16rem   --grid-min-md  20rem   --grid-min-lg  24rem |

## Split

An asymmetric two-column layout that stacks on small screens. A heading beside its list, a label beside its content.

`Split` takes exactly two children and puts them side by side in a ratio. Asymmetric splits read as designed; a 50/50 split of a heading and a list rarely does. Below `collapseBelow` (`md` by default) the two stack, first child on top.

A heading and a list of changes in a 5/7 split, stacked on a phone.

```tsx
import { Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'

const CHANGES = [
  'Route 7 now stops at Ferry Lane on weekdays.',
  'Night buses run every 15 minutes on Fridays.',
  'Kelso Bay Pier reopens on 3 November.',
]

export function Usage() {
  return (
    <Split ratio="5/7" gap={{ base: 5, md: 7 }}>
      <Heading level={3} size="2xl">
        Timetable changes this month
      </Heading>
      <Stack gap={4} dividers>
        {CHANGES.map((change) => (
          <Text key={change}>{change}</Text>
        ))}
      </Stack>
    </Split>
  )
}
```

### Ratios

`ratio` is one of `1/1`, `1/2`, `2/1`, `1/3`, `3/1`, `5/7`, `7/5`, `4/8` or `8/4`. `5/7` is the default. `reverse` swaps the visual order without changing the reading order.

```tsx
import { Box, Split, Stack, Text } from '@mitcsutt/kiln-ui'

export function Ratios() {
  return (
    <Stack gap={4}>
      {(['1/1', '1/2', '1/3', '5/7'] as const).map((ratio) => (
        <Split key={ratio} ratio={ratio} gap={3} collapseBelow="sm">
          <Box padding={3} surface="sunken" radius="field">
            <Text size="sm">{ratio}</Text>
          </Box>
          <Box padding={3} border radius="field">
            <Text size="sm" tone="muted">
              The wider side
            </Text>
          </Box>
        </Split>
      ))}
    </Stack>
  )
}
```

### API

`SplitProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ratio` | `'1/1' \| '1/2' \| '2/1' \| '1/3' \| '3/1' \| '5/7' \| '7/5' \| '4/8' \| '8/4'` | `5/7` | Width of the first child to the second. Default `5/7` — asymmetric on purpose. |
| `collapseBelow` | `'sm' \| 'md' \| 'lg'` | `md` | Stack the two children vertically below this breakpoint. Default `md`. |
| `gap` | `Responsive<Space>` |  | Space between the two sides (and between them when stacked). Responsive. |
| `align` | `Responsive<Align>` | `start` | Block-axis alignment of the two sides. Default `start`. Responsive. |
| `reverse` | `boolean` | `false` | Put the second child first *visually* when split. DOM (and stacked) order is unchanged. |
| `children` (required) | `[ReactNode, ReactNode]` |  | Exactly two children: the first and second side. |
| `as` | `'div' \| 'section' \| 'article' \| 'header' \| 'footer'` | `div` |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

## References

Read a reference when its description matches the task:

- [Section](references/section.md): A full-bleed band of vertical space, with an optional surface and rules. Put a Container inside it for width.
- [Container](references/container.md): Centres content at a readable maximum width, with a fluid gutter outside it.
- [Box](references/box.md): Padding, a surface and an edge, and nothing else. The escape hatch when no other layout fits.
- [AppShell](references/app-shell.md): The frame of an app screen. A header, an optional sidebar, the main region, a footer and a phone-only bottom bar.
- [ActionBar](references/action-bar.md): The row of actions at the end of a form or dialog. Cancel, save, continue.
- [Divider](references/divider.md): A hairline rule between groups of content, optionally labelled, horizontal or vertical.
- [AspectRatio](references/aspect-ratio.md): A frame that keeps its proportions, for images, video, maps and charts.
- [ScrollArea](references/scroll-area.md): A scroll container for content wider or taller than the page, such as a bracket, a timeline or a wide board, that keyboard users can reach and scroll.
- [VisuallyHidden](references/visually-hidden.md): Content that screen readers announce and sighted readers don't need to see.
- [Dashboard](references/dashboard.md): A week of operations at a glance, built from stats, a table and a list. No tiles, no gradients, no cards that don't need to be cards.
- [Settings](references/settings.md): A settings page with section navigation, labelled fields, grouped switches and a guarded destructive action.
- [Checkout](references/checkout.md): A short checkout with the order summary beside the form, choice cards for collection, and a total that lines up.
