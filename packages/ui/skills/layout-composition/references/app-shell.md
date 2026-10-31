<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# AppShell

> The frame of an app screen. A header, an optional sidebar, the main region, a footer and a phone-only bottom bar.

Source: https://kiln.mitchellsutton.com/docs/ui/layout/app-shell

`AppShell` is the outermost frame of an app: landmarks in the right order, a skip link, a sticky header, and a hand-over between a phone's bottom bar and a desktop's sidebar or header nav. These docs are an `AppShell`.

The window above scrolls; narrow it below `md` and the header links give way to the bottom bar.

```tsx
import {
  AppShell,
  ArrowRightIcon,
  BottomNav,
  CircleCheckIcon,
  Container,
  Heading,
  Inline,
  NavLinks,
  SearchIcon,
  Stack,
  SystemIcon,
  Text,
} from '@mitcsutt/kiln-ui'

const SECTIONS = ['Departures', 'Routes', 'Tickets', 'Account']
const ICONS = [
  <ArrowRightIcon key="d" />,
  <SearchIcon key="r" />,
  <CircleCheckIcon key="t" />,
  <SystemIcon key="a" />,
]

export function Usage() {
  return (
    <AppShell navBreakpoint="md">
      <AppShell.Header>
        <Container width="full">
          <Inline justify="between">
            <Text weight="strong">Bayline</Text>
            <NavLinks label="Main" size="sm" hideBelow="md">
              {SECTIONS.map((section, index) => (
                <NavLinks.Item
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  active={index === 0}
                >
                  {section}
                </NavLinks.Item>
              ))}
            </NavLinks>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container width="text">
          <Stack gap={4}>
            <Heading level={2} size="2xl">
              Departures from Harbour Square
            </Heading>
            {Array.from({ length: 12 }, (_, index) => (
              <Text key={index}>
                {String(7 + Math.floor(index / 2)).padStart(2, '0')}:{index % 2 ? '40' : '10'}{' '}
                Coastal line to Kelso Bay
              </Text>
            ))}
          </Stack>
        </Container>
      </AppShell.Main>
      <AppShell.BottomBar>
        <BottomNav position="static" hideAbove="md" label="Main">
          {SECTIONS.map((section, index) => (
            <BottomNav.Item
              key={section}
              href={`#${section.toLowerCase()}`}
              icon={ICONS[index]}
              label={section}
              active={index === 0}
            />
          ))}
        </BottomNav>
      </AppShell.BottomBar>
    </AppShell>
  )
}
```

## Flush main

`flush` drops Main's padding, so full-bleed `Section` bands meet the header and the footer edge to edge, and each band sets its own spacing.

```tsx
import { AppShell, Container, Heading, Section, Stack, Text } from '@mitcsutt/kiln-ui'

export function FlushMain() {
  return (
    <AppShell>
      <AppShell.Header>
        <Container>
          <Text weight="strong">Bayline</Text>
        </Container>
      </AppShell.Header>
      <AppShell.Main flush>
        <Section space={{ base: 7, md: 9 }} surface="sunken" divider="bottom">
          <Container>
            <Stack gap={3}>
              <Heading level={1} size="3xl">
                Winter timetable
              </Heading>
              <Text tone="muted">From 3 November, the first boat leaves Kelso Bay at 07:35.</Text>
            </Stack>
          </Container>
        </Section>
        <Section space={{ base: 6, md: 8 }}>
          <Container>
            <Stack gap={2}>
              <Text>07:35 Kelso Bay to Harbour Square</Text>
              <Text>08:10 Harbour Square to North Point</Text>
              <Text>08:40 North Point to Kelso Bay</Text>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
      <AppShell.Footer>
        <Container>
          <Text size="sm">Bayline ferries</Text>
        </Container>
      </AppShell.Footer>
    </AppShell>
  )
}
```

## Slots

`AppShell.Header`, `AppShell.Sidebar`, `AppShell.Main`, `AppShell.Footer` and `AppShell.BottomBar` place themselves, so their order in JSX doesn't affect the layout. Keep it the same as the reading order anyway: header, sidebar, main, footer, bottom bar.

- **Header** is sticky by default (`sticky={false}` to scroll it away). While it sticks, in-page links and `scrollIntoView` land just below it, whatever its height. Put a `Container` and an `Inline` inside.
- **Sidebar** appears from `navBreakpoint` up. It sits at the start of the main region (`side="end"` for the other side) on the sunken surface, a step quieter than the page, scrolls on its own, and stays below the header. Put a vertical `NavLinks` inside.
- **Main** is the `<main>` landmark and the skip link's target. It pads the top and the end of the page, so content never starts under the header's rule or ends flush with the bottom of the scroll, with less room on a phone, where the header and bottom bar already frame it. Lay the page out with `Page` inside a `Container`. Add `flush` when the page brings its own spacing, such as full-bleed `Section` bands, so Main adds none.
- **BottomBar** is pinned to the bottom of the viewport below `navBreakpoint`, and pads for the phone's home indicator.

## Navigation hand-over

`navBreakpoint` (`md` or `lg`, default `lg`) is the one width where phone navigation gives way to desktop navigation, so there's never a width with neither. Pair it with the same value on `BottomNav hideAbove` and the header's `NavLinks hideBelow`.

## API

`AppShellProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `skipLinkLabel` | `string` | `"Skip to content"` | Text of the skip link rendered before everything else. Default "Skip to content". |
| `navBreakpoint` | `'md' \| 'lg'` | `lg` | Where navigation hands over from phone to desktop: from this breakpoint up the `Sidebar` appears and the `BottomBar` is removed, so there is never a width with neither. `md` (48em) or `lg` (64em, default). Pair it with the same value on `BottomNav hideAbove` and header `NavLinks hideBelow`. |
| `mainId` | `string` |  | Id given to `AppShell.Main` (the skip link target). Generated when omitted. |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>`.

`AppShellHeaderProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sticky` | `boolean` | `true` | Stick to the top of the viewport while scrolling. Default `true`. While it sticks, in-page links and `scrollIntoView` land below it, however tall it grows. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`AppShellMainProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `flush` | `boolean` | `false` | Drop Main's padding at the top and the end, for pages that space themselves, such as full-bleed `Section` bands. Default `false`. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.

`AppShellSidebarProps`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'start' \| 'end'` | `start` | Which side of Main it sits on. Logical, so it follows writing direction. Default `start`. |

Also accepts every prop of `HTMLAttributes<HTMLElement>`.





### Component tokens

Set these in a theme, or on one element, to change this component without touching the rest.

| Token | Default and use |
| --- | --- |
| `--app-shell-header-height` | minimum header height, also the sidebar's sticky offset (default: control-lg + space-4) |
| `--app-shell-sidebar-width` | default 18rem |
| `--app-shell-sidebar-bg` | default var(--color-surface-sunken): a quieter layer than Main, so the page leads and the nav reads as its own panel |
| `--app-shell-main-padding` | Main's block padding (default var(--space-5) var(--space-5) on a phone, var(--space-6) var(--space-7) from md): the page never starts under the header rule or ends flush at the bottom of the scroll. 0 when each page pads itself, or set `flush` on Main, which drops it with no CSS. |
| `--app-shell-header-bg` | default var(--color-canvas) — opaque, never glass |
| `--app-shell-bar-rule` | rule under the header / above the bottom bar (default var(--color-line-strong): these are the frame's edges) |
