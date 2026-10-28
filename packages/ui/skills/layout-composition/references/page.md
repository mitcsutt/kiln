<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Page

> The layout of a page inside an app: a title block, then sections, at one rhythm, so pages need no layout of their own.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/page

`Page` is the content of one screen, inside `AppShell.Main` and its `Container`. It spaces its parts at one rhythm, so every page in an app opens and steps the same way:

- **`Page.Header`** is the page's `<h1>`, with an optional kicker, description and actions. Anything you nest in it sits under the title block, like a notice or a filter row.
- **`Page.Section`** is a `<section>` named by its `<h2>`, with its content a set distance below the title. Leave out `title` for a part with no heading.
- **`Page.Columns`** puts content side by side: `columns` is the count on a wide screen, and each count steps down to one column on a phone.

`AppShell.Main` pads the top and the end of the page, so `Page` adds no outer space of its own. Change the rhythm with `gap` on any part.

A whole page: the header with its actions, then titled sections, one with its content in columns. Nothing here sets a gap or a heading size: every page laid out this way opens and steps the same.

```tsx
import { Badge, Button, Card, Inline, Numeral, Page, Stat } from '@mitcsutt/kiln-ui'

const kilns = [
  { name: 'Kiln 1', load: 'Saturday class bisque', temperature: 962, status: 'Firing' },
  { name: 'Kiln 2', load: 'Café planters, glaze', temperature: 1184, status: 'Firing' },
  { name: 'Kiln 3', load: 'Tenmoku test tiles', temperature: 41, status: 'Cooling' },
]

export function Usage() {
  return (
    <Page>
      <Page.Header
        kicker="Kiln room"
        title="Live firings"
        description="Readings from every kiln in the studio, every thirty seconds."
        actions={<Button variant="outline">Book a slot</Button>}
      />
      <Page.Section title="Now firing" description="Two kilns are on, one is cooling.">
        <Page.Columns columns={3}>
          {kilns.map((kiln) => (
            <Card key={kiln.name} variant="outline">
              <Card.Header>
                <Card.Title>{kiln.name}</Card.Title>
                <Card.Meta>{kiln.load}</Card.Meta>
              </Card.Header>
              <Card.Body>
                <Inline gap={2} align="center" justify="between">
                  <Numeral value={kiln.temperature} suffix="°C" />
                  <Badge variant="outline">{kiln.status}</Badge>
                </Inline>
              </Card.Body>
            </Card>
          ))}
        </Page.Columns>
      </Page.Section>
      <Page.Section title="This week">
        <Page.Columns columns={4}>
          <Stat label="Firings" value={<Numeral value={14} />} />
          <Stat label="Pieces" value={<Numeral value={212} />} />
          <Stat label="Kiln hours" value={<Numeral value={96} />} />
          <Stat label="Failed pieces" value={<Numeral value={3} />} />
        </Page.Columns>
      </Page.Section>
    </Page>
  )
}
```

## Header with a notice

Anything nested in `Page.Header` sits under its title block, at the header's own gap, so a notice or a filter row belongs to the header rather than to the first section.

```tsx
import { Page, Stack, Text } from '@mitcsutt/kiln-ui'

export function HeaderWithANotice() {
  return (
    <Page>
      <Page.Header kicker="Studio admin" title="Members" description="Everyone with a studio key.">
        <Stack gap={1}>
          <Text weight="strong">Kiln 2 is down for elements until Friday</Text>
          <Text size="sm" tone="muted">
            Glaze firings move to Kiln 1 and Kiln 3 this week.
          </Text>
        </Stack>
      </Page.Header>
      <Page.Section title="Teachers">
        <Text>Maud Lindqvist, Tomasz Bielski</Text>
      </Page.Section>
    </Page>
  )
}
```

## API

`PageProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `Responsive<Space>` | `8` | Space between the header and each section, as a step on the space scale. Responsive. Default `8`. |
| `as` | `'div' \| 'article'` | `div` |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PageHeaderProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  | The page title, as its `<h1>`. |
| `kicker` | `ReactNode` |  | Small context above the title, only when it tells the reader something: the area the page belongs to, or the period it covers. Plain muted text. |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | Heading level. Default 1. |
| `children` | `ReactNode` |  | Anything that belongs to the header under the title block: a notice, filters, tabs. |
| `description` | `ReactNode` |  | A sentence or two under the title. |
| `actions` | `ReactNode` |  | Buttons or links beside the title from `md` up, below it on a phone. |
| `size` | `Responsive<HeadingSize>` |  | Heading size; defaults from the part (`2xl` for the header, `lg` for a section). Responsive. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PageSectionProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` |  | The section title, as an `<h2>` that also names the section. Omit for an untitled section. |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Heading level. Default 2. |
| `gap` | `Responsive<Space>` | `4` | Space between the title block and the content, and between content blocks. Default `4`. |
| `description` | `ReactNode` |  | A sentence or two under the title. |
| `actions` | `ReactNode` |  | Buttons or links beside the title from `md` up, below it on a phone. |
| `size` | `Responsive<HeadingSize>` |  | Heading size; defaults from the part (`2xl` for the header, `lg` for a section). Responsive. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`PageColumnsProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `2 \| 3 \| 4` | `2` | How many columns on a wide screen. Each count steps up from one column on a phone: `2` from `md`, `3` through two at `md` to three at `lg`, `4` through two at `sm` to four at `lg`. Default `2`. |
| `gap` | `Responsive<Space>` | `5` | Space between columns and rows. Responsive. Default `5`. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.
