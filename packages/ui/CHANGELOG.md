# @mitcsutt/kiln-ui

## 0.5.0

### Minor Changes

- 76670c1: `Box` takes `surface="accent"`, a panel in the accent colour that re-points ink, lines and the accent for its children, like `Section`'s accent band.

  `Box` and `Section` take `adaptTones`, which re-points status tones on an `inverse`, `accent` or categorical `cat-1` to `cat-8` fill, so a `Stat`, `Numeral`, `Delta`, `Text` or soft `Badge` in a status tone stays AA there. On `accent` and categorical fills tone text takes the fill's own ink and soft tone fills are the fill itself, so the status shows through the sign, glyph or label; on `inverse` each tone keeps its hue, mixed toward the band's ink. It's off by default, so existing bands look as before.

- 76670c1: `List` and `Table` take `surface` (`none`, `surface` or `raised`) to set their rows on one sheet, with Card's edges, so they read as rows on a textured or coloured canvas. Rows run edge to edge and the sheet clips them to its corners: highlighted, selected and hovered fills are bands across the sheet, a categorical rail is the row's edge (flush with the sheet, full height, following the corners on the first and last rows), and a table on a sheet gets a little more air, compact included. A table caption lines up with the first column and a sticky header takes the sheet's fill. New component tokens: `--list-surface-bg`, `--list-surface-radius`, `--table-surface-bg` and `--table-surface-radius`.
- 76670c1: Add `ScrollArea`, a scroll container for content wider or taller than the page, such as a bracket or a timeline. With a `label` (or `aria-labelledby`) it's a named region in the tab order, so keyboard users can focus and scroll it; `axis` picks `x` (default), `y` or `both`, and the scrollbar takes the theme's line colour (`--scroll-area-thumb`).
- 76670c1: `Table` takes `valign` for rows whose cells differ in height (a flag and a tag beside plain figures): `middle` centres body and footer cells, so figures sit level with the name; `top` pins them to the top. The default, `baseline`, is unchanged. Header cells still sit on the header rule.

### Patch Changes

- 76670c1: A sized `Media` with a fixed `ratio` gives its image `width` and `height` attributes from its size and ratio, so the browser knows the image's box before it loads and audits no longer flag it as unsized. Its CSS still sets the rendered size, so layout doesn't change, and `imgProps.width`/`height` still win. With `ratio="auto"` the image's own ratio isn't known, so pass them in `imgProps`.

## 0.4.0

### Minor Changes

- b1ea52d: `Accordion.Trigger` takes `trailing`, a figure or badge set at the end of the trigger just before the chevron, and its label now fills the trigger, so content inside it can spread to the far edge. With `trailing`, a small trigger's label fills too, so a list of small rows lines its figures up on the end edge; a small trigger without one still hugs its text.
- b1ea52d: Add twelve icons for app navigation and page furniture, drawn on the same 20px grid with the theme's stroke: `TrophyIcon`, `CalendarIcon`, `UsersIcon`, `SwordsIcon`, `HelpIcon`, `ClockIcon`, `ZapIcon`, `MessageIcon`, `RadioIcon`, `ShieldIcon`, `TargetIcon` and `TrendingUpIcon`. A bottom nav or a stat tile no longer needs a second icon set beside Kiln's.

  `createIcon` is marked free of side effects, so a bundler drops every icon an app doesn't import. An app that imports one component which uses an icon no longer pulls in the whole set.

- b1ea52d: `Card` has two new variants: `live`, a heavier accent keyline for something happening now, and `placeholder`, no fill with printer's crop marks at its corners, for a slot that isn't decided yet.
- b1ea52d: Carry a person's or team's categorical colour beyond `Tag` and `Avatar`. `List.Item` and `Table.Row` take `color` (1 to 8) and draw a thin rail at the row's start, `Card` takes `color` and draws a keyline along its top, and `Box` and `Section` take `surface="cat-1"` to `"cat-8"`, a fill whose ink, lines and nested surfaces re-point to stay legible. The shared `CategoryColor` type is exported. Component tokens: `--list-rail-width`, `--table-rail-width`, `--card-keyline-width`.
- b1ea52d: A labelled `Divider` is now a band rather than a `separator`: its `label` is real content that screen readers read in place, and it may be a block (a `Stack` of lines). The rules either side stay decorative. Before, the label was only the separator's accessible name, and a separator's children are presentational. An unlabelled `Divider` is still a `separator`.
- b1ea52d: Small additions for figures, times and tags:

  - `Numeral` takes `annotation`, a small muted figure after the main one in the same `<data>` element ("1 (4)").
  - `Numeral` and `Text` take `tone="highlight"`, which sets the figure or text on the theme's highlight, like a marker pen.
  - `RelativeTime` takes `justNowWithin` (seconds) and `justNowLabel` (default "just now"), for moments `Intl` would call "now" or "in 30 sec".
  - `Tag` takes `size="sm"` for dense lists. `TagSize` is exported.
  - The `Numeral` docs explain how to query a figure in tests: its sign and decimal mark are separate spans, so match the `<data>` element.

- b1ea52d: Add `Flash`, which draws brief attention to an element that just changed or that a link just opened on. It wraps any single element, adds no element of its own, and gives it an outline in the accent that fades: each time its `value` changes after the first render; once on mount with `appear`, for an element that's new because of a change (never during the page's first render); whenever the element is the URL's `#target`, including `#hash` links and back and forward; and when `target` turns true, for client-side routers that don't update `:target`. Under reduced motion the outline holds and goes instead of fading. Tokens: `--flash-color`, `--flash-duration`.
- b1ea52d: `Media` takes a `size` (`xs`, `sm`, `md`, `lg` or `xl`, about 16, 20, 24, 32 and 96px tall) for a small image that sits inline beside text, like a flag by a name. The width follows `ratio`, or the image's own ratio, and `radius` and `fallback` work as before, with the corner radius capped at a fifth of the height so a small thumbnail never rounds into a pill. Without `size`, `Media` still fills its container.
- b1ea52d: Show what's out of play: `List.Item` and `Table.Row` take `muted`, which drops every ink in the row to the muted step (still AA), and `Media` takes `dimmed`, which fades the image toward a neutral grey while keeping it recognisable (`--media-dim-filter`, default `saturate(0.3) contrast(0.7)`).
- b1ea52d: `NavLinks` labels move one step up the type scale, so navigation reads like the text around it instead of at caption size. `md` (the default) is now `--text-md`, body size, and `sm` is `--text-sm`, where it was the 11px `--text-xs`. Row heights are unchanged. DESIGN.md §2 gains the rule that navigation text never uses `--text-xs` or `--text-2xs`, enforced by a test over `NavLinks`, `Tabs` and `BottomNav`.
- b1ea52d: `ToggleChip` takes `trailing`, content set after the label with the chip's gap, such as an `AvatarGroup` of who reacted.
- b1ea52d: `Tooltip` works on touch screens and on disabled triggers. `touch="longpress"` opens the tooltip when the trigger is held for half a second on a touch screen, and swallows the tap that ends the press (and the phone's context menu), so holding a button to read its hint doesn't also press it. A `disabled` trigger is marked `aria-disabled` instead, with its clicks and key presses blocked, so it still looks and announces as disabled but hover, focus and long press reach it and its tooltip can say why. It stays the same element, so a trigger that's disabled while a request is pending keeps keyboard focus.

### Patch Changes

- b1ea52d: `AppShell.Header` no longer covers in-page link and `scrollIntoView` targets. While it's sticky, it measures its own height and sets the document's `scroll-padding-block-start` to match, and the sidebar's sticky offset follows the same measurement, so a header taller than `--app-shell-header-height` is accounted for. Both are removed on unmount or with `sticky={false}`.
- b1ea52d: `AvatarGroup` renders a `<span role="group">` instead of a `<div>`, like `Avatar`, so a group can sit inside a button (a reaction chip) or a line of text. Its ref is typed `HTMLElement`.
- b1ea52d: `ToggleChip` and `ChipGroup` chips read their pressed state from `aria-pressed` and `aria-checked` instead of `data-state`, so a chip wrapped in a `Tooltip` or another `asChild` trigger, which writes its own `data-state`, still looks pressed. Chips also take the disabled look from `aria-disabled="true"`.
- b1ea52d: Fiesta's status and categorical inks no longer collide. The gold is only the highlight ("you"): `caution` is now marigold and `--color-cat-2` lilac, so a caution badge, a highlighted row and the second categorical colour are three different colours. `critical` is a deep brick, darker and warmer than the coral accent, so "out" never reads as an accent figure, and `--color-cat-4` moves to tangerine to stay clear of the new caution. Every Fiesta story still passes axe in light and dark.
- b1ea52d: `List.Leading`, `List.Content`, `List.Description` and `List.Trailing` render `<div>`s, so block components such as `Stat`, `Stack` and a sized `Media` fit in them as valid HTML. Inside an `asChild` row (a link or button) they stay `<span>`s, the only content a button may hold. A `Stat` in `List.Trailing` lines its label and value up on the row's end edge, through a new `--stat-align` token (`start` or `end`), and is only as wide as its content, through `--stat-container-type`, so it never squeezes the title. A row's title wraps between words and breaks inside one only when a single word can't fit.
- b1ea52d: A sized `Media` renders `<span>`s, so it's phrasing content and can sit inside a button, an `Accordion.Trigger` or a line of text. `MediaSize` is exported from the package with the other `Media` types.
- ad8ad08: Tidy doc comments and the shipped agent skills: the `setup-and-theming` skill's storage key example uses a generic app name, and comments no longer refer to internal planning documents.

## 0.3.0

### Minor Changes

- 591b219: Add two theme presets, rework two others, and enforce the second-order AI design tells with a test. Each new or reworked theme takes its subject from a real object or standard, and every colour, face, radius and easing has a one-line reason in its stylesheet. See [ADR 0030](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0030-theme-family-without-ai-tells.md).

  - New preset `flightdeck`: a glass-cockpit display in B612 and B612 Mono, dark-first. Cyan marks what the pilot sets and acts on, the selected line is a neutral reverse-video box, and green, amber and red are status. Import `@mitcsutt/kiln-ui/themes/flightdeck.css`.
  - New preset `riso`: a two-drum risograph zine in fluorescent pink and blue, with screen tints instead of borders, Shantell Sans, and a hard offset only on floating layers. Import `@mitcsutt/kiln-ui/themes/riso.css`.
  - `paper` (the default) is reworked: an office print with white sheets on grey recycled stock in blue-black ink, set in Golos Text.
  - `ledger` is reworked: an accountant's columnar pad with a white sheet ruled in green, banknote-green actions, and figures set condensed in Archivo instead of in a monospace.
  - `monograph` and `fiesta` are unchanged.
  - `themes/tells.test.ts` checks Paper, Ledger, Flightdeck and Riso against the banned font list, the warm-cream canvas and the ember, terracotta and indigo accents. Monograph and Fiesta are exempt.

  ### Upgrading

  Nothing is renamed or removed, so no code changes are needed.

  - `paper` and `ledger` change appearance and fonts. Check any screen that depends on their old look.
  - Paper is now set in Golos Text, with Atkinson Hyperlegible Mono for code. Ledger is set in Archivo, with Atkinson Hyperlegible Mono for code. Flightdeck brings B612 and B612 Mono, and Riso brings Shantell Sans.
  - The base stylesheet no longer declares Schibsted Grotesk, Newsreader or Martian Mono. The Monograph and Fiesta presets now load them (Martian Mono for both), so an app that imports those presets sees no change. A custom theme that relied on these faces arriving with `styles.css` must load them itself or import the Monograph preset.

## 0.2.2

### Patch Changes

- 1ef6bf4: Each component's doc comment is now the text of its docs page: the summary is the page's description and `@remarks` its lead, so editor hovers match the docs. Older notes moved to `@privateRemarks`. The agent skills follow the regenerated pages, with the defaults components set in code now in their props tables, and the Section page a reference of the `layout-composition` skill.

## 0.2.1

### Patch Changes

- 4834a79: A soft `Badge` or `Tag` in a highlighted `Table` row or `List` item is legible in every theme and mode. The row already re-points the tone texts for its fill, and now tints the soft fills from that fill too; before, in Fiesta night, a caution badge on a gold row put the daytime ink on the night soft fill.
- 4834a79: A plain native `<select>`, such as your own control inside a `Field`, takes the theme's surface as its background. The reset already gave it the theme's ink, so in dark mode the browser's default grey box left the text short of AA contrast on some platforms.
- 4834a79: The agent skills' examples now declare each example as a named export (`export function Usage()`) instead of a default export, matching the docs, where the examples now sit beside the code they document. The examples are otherwise unchanged.

## 0.2.0

### Minor Changes

- b14cd6e: Add the `@mitcsutt/kiln-ui/theme-script` entry, which exports `themeScript` and `DEFAULT_STORAGE_KEY` with no React, so Node-side tooling (like a Vite config that writes the script into a static `index.html`) can load it. The single-page-app recipe on the getting-started page now imports from it. `themeScript` is still exported from the root entry too.
- b14cd6e: Add `storageKey` to `ThemeProvider` and `themeScript` (`themeScript(theme, defaultMode, { storageKey })`), so an app can keep the colour mode under its own `localStorage` key instead of the shared `kiln-color-mode`. The getting-started page also shows how a single-page app generates the script into its `index.html` at build time.

### Patch Changes

- b14cd6e: The README's agent-skills section now covers projects that already have an `intent.skills` list in `package.json`: add the package to the list, then check with `npx @tanstack/intent@latest list`.
