# @mitcsutt/kiln-ui

## 0.11.0

### Minor Changes

- 8290fd3: `AppShell.Main` takes a `flush` prop that drops its default padding at the top and the end, for pages that space themselves (full-bleed `Section` bands, say), with no CSS. Without it, Main pads as before, and `--app-shell-main-padding` still sets the padding.
- 771ef1c: App pages get a proper frame by default:

  - **Side navigation.** `AppShell.Sidebar` sits on the sunken surface and is 18rem wide. In a vertical `NavLinks`, each top-level `NavLinksGroup` (and any link beside one) is a section: its label is in the heading face one step above the links, and a hairline rules it off from the section before. Every link is a full-width row with a hover fill and, for the current page, a soft accent fill as well as the dot. The keyboard focus ring is inset, so the sidebar's edge no longer clips it. New component tokens: `--navlinks-hover-bg`, `--navlinks-current-bg`, `--navlinks-section-rule` and `--app-shell-sidebar-bg`.
  - **Page padding.** `AppShell.Main` pads the top and the end of the page (`--app-shell-main-padding`, default `var(--space-5) var(--space-5)` on a phone and `var(--space-6) var(--space-7)` from `md`), so content no longer sits flush against the end of the scroll. Set the token to `0` if your pages pad themselves.
  - **`Page`.** A new layout for the content of an app screen: `Page.Header` (the `<h1>` title block), `Page.Section` (a `<section>` named by its `<h2>`), spaced at one rhythm.
  - **Type scale.** The steps below body are now fixed fractions of `--type-base` instead of dividing by the theme's ratio: `--text-sm` is 0.875, `--text-xs` 0.75 and `--text-2xs` 0.6875 (14, 12 and 11px at a 16px base). Secondary text, table cells and small labels no longer drop to 12.5–12.8px beside body text. Every step is still in rem, so browser zoom scales all of them.
  - **`PaletteIcon`.** A painter's palette for theme and colour-scheme pickers.

- 0984a67: Polish for data display, from a review of the demo app.

  - `TreeTable`: a click anywhere on an expandable row opens or closes it (links and buttons inside a row keep their own clicks), and the chevron has a larger target.
  - `Table` and `TreeTable`: a new `bar` column width keeps room for a `Progress` or `Meter`, which have no width of their own and were squeezed to nothing in a shrink-wrapped column.
  - `Table`: a cell that holds only a checkbox or radio centres it in the row, whatever the row's `valign`.
  - `Card.Header` takes a `leading` slot, so an avatar sits above the title at every width and cards of one width look the same.
  - `Card`: a card with a corner `Stamp` makes room for it, so the stamp no longer covers the title or the date.
  - `ChartTooltip`: values are set in the theme's figures at normal width and the label weight, instead of Ledger's condensed receipt-tape figures.
  - `Repeater`: actions that an item doesn't offer (Move up on the first item, Remove at `min`) keep their place as hidden slots, so a table's columns no longer reflow when a line is added.

- 038a1f7: Deprecate the Monograph and Fiesta themes ([ADR 0045](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0045-four-themes-each-with-a-goal.md)). Both still work in this release, and leave in the next minor release. Switch Fiesta to Riso, and Monograph to Paper for a page or Flightdeck for a tool. `THEME_META` gains an optional `deprecated` note, set on both, that says what to switch to.
- 6f9b346: Flightdeck has new colours, with dark mode designed first. Check screens that depend on its old look.

  - **Night glass.** The dark canvas is blue-grey glass at OKLCH L 0.19, with a deeper ladder (sunken 0.165, surface 0.225, raised 0.262), so a popover reads above a card without a shadow. Ink is held at L 0.94 instead of white so it doesn't halate.
  - **Day mode.** A cool grey case (0.933) holds white sheets (0.993). It no longer shares a light canvas with Paper.
  - **Focus is cyan, not ink.** `--color-focus` is the theme's cyan, a step lighter than the cyan fill at night (`oklch(0.86 0.12 208)`) and darkened by day (`oklch(0.52 0.092 215)`). It reaches at least 7.9:1 on every fill a ring sits beside at night and 3.6:1 by day, and stays clear of the green and red status tones.
  - **Data colours.** Categorical colours no longer use the status hues (green, amber, red) and series one is blue, not cyan. The sequential ramp is cyan, and the diverging ramp is magenta against cyan.
  - **Status tones** are refitted to AA on every ground, their soft fill and the highlight.

- 01c5ff4: Redesign four form controls. `Stepper` draws a connector only between adjacent steps, with none after the last. `Switch` is now a pill with a round knob that carries a check when on. `NumberInput` puts the decrease button before the number and the increase button after it. The unfilled track of `Slider` and `RangeSlider` is thicker and tinted so it reads in every theme.
- 7138040: Rework the Ledger theme as a columnar pad in graphite. Actions are solid ink instead of banknote green. Lines and dividers are graphite hairlines, with no green ruling. Green and red appear only on numbers, for money in and out, and focus is a blue-pencil ring in both modes. Body type grows from 15px to 16px, density stays 0.86 on a phone and goes to 0.94 from 40em, and radii are squarer. Archivo, the condensed figures and the double rule over totals stay. Check screens that relied on Ledger's green buttons or green rules.
- 043f148: Paper, the default theme, is rebuilt as "Office ink": neutral grey stock with white sheets, and blue-black fountain-pen ink as its only hue, which is also the accent, so a brand colour can replace it without a fight.

  - **Dark mode** is neutral graphite rather than blue-slate, with wider steps between layers (sunken, canvas, sheet, raised) so each one reads by lightness alone. The accent is a mid ink-blue with dark text on it, rather than a pastel.
  - **Light mode** keeps grey stock under near-white sheets. The ink carries a little less blue, the accent is a step lighter and brighter, and the lines are a neutral grey.
  - **Focus** is the fountain-pen ink at full saturation, blue rather than black, in both modes. It clears 3:1 against every fill a ring sits beside and keeps well clear of the red and green tones. DESIGN.md's focus rule changes to match: focus takes the theme's own hue, not its ink (ADR 0052). A new `themes/focus.test.ts` checks both rules for every built-in theme.
  - **Tones, categorical colours, strokes, ramps and chart chrome** are retuned to the new neutrals. Categorical colours now sit at one lightness and chroma, ordered so neighbours sit far apart in hue.

  Apps that set no theme, or `theme="paper"`, get the new look on upgrade. Fonts, type, radii, motion and shadows are unchanged.

- 6057967: Riso has a new look. By day it is the classic two-drum print: Blue 3005 U for actions and Sunflower 116 U for "you are here", so the current navigation row now stands clear of the sidebar and its marker passes 3:1. Night stays a reverse print with fluorescent pink actions, now on a blue flood with cards and type knocked out to near-neutral stock. Focus rings are the blue drum in both modes instead of the ink colour. Two new optional tokens, `--navlinks-current-bg` and `--navlinks-marker`, are reset on every theme scope.

## 0.10.0

### Minor Changes

- 79ccf0f: `Badge` reads a new optional component token, `--badge-soft-ink`, for the text colour of soft badges. It defaults to the tone's text colour, so nothing changes until a theme sets it.

## 0.9.0

### Minor Changes

- 571415a: `highlight` from `@mitcsutt/kiln-ui/highlight` now understands shell (`bash`, `sh`, `shell`, `shellscript`, `zsh`), `json`, `yaml` (or `yml`) and `diff`, as well as JavaScript and TypeScript. Keys in JSON and YAML are coloured as types, shell flags as constants, and a diff's added lines as strings and removed lines as constants, with its headers and hunk ranges set apart. Each grammar still loads only when a block in that language is first highlighted.

### Patch Changes

- 85b8d1c: The `design-rules` agent skill now gives each built-in theme its goal, the kind of product to choose it for: Paper for products that shouldn't have a personality yet, Ledger for numbers people have to trust, Flightdeck for operating something live, and Riso for products made for people. It also notes that Monograph and Fiesta are deprecated and leave in the next minor release ([ADR 0045](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0045-four-themes-each-with-a-goal.md)). No code changes.
- 13bd01f: CodeBlock's copy button stays muted, and TagsInput's chip list stays `display: contents`, whatever order a bundler loads the CSS in. Both rules used to tie on specificity with Button's and TagList's base rules, so a Next.js build could load them in the other order and flip them.
- 74bf87c: Components that size or colour an inner Icon, Spinner, Button or TagList through `className` now win on specificity instead of stylesheet order: TreeTable's chevron, FileDrop's icon, Checkbox's tick and dash, Combobox's chevron, check, spinner and chip list, DateRangePickerField's presets, field error and warning icons and the validating spinner, CommandPalette's search icon, chevron and spinner, and an external Link's arrow. Each rule used to tie with the inner component's base rule, so a Next.js build that loaded the CSS in the other order changed them (TreeTable chevrons and FileDrop icons shrank from 16px to 12.8px).

## 0.8.0

### Minor Changes

- 34b4484: Add `TreeTable`, a WAI-ARIA `treegrid` set in `Table`'s styles for rows in a hierarchy. Each parent has a toggle, the grid is a single tab stop, and the keyboard works like a file tree: Up and Down step by row, Right opens a row then steps into it, Left closes it then steps out, Home and End jump, and Enter follows the row's link. Rows carry `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset`. It is a separate export, so `Table` and its imports are unchanged.

## 0.7.0

### Minor Changes

- 2e62980: Add data and drag tokens to the theme contract, set by every built-in theme in light and dark: a sequential ramp (`--color-seq-1` to `--color-seq-7`), a diverging ramp about a neutral midpoint (`--color-div-neg-3` to `--color-div-pos-3`, with `--color-div-mid`), a stroke variant of each categorical colour (`--color-cat-1-stroke` to `--color-cat-8-stroke`), chart chrome (`--chart-grid`, `--chart-axis`, `--chart-label`, `--chart-tooltip-surface`, `--chart-tooltip-border`, `--chart-tooltip-ink`, `--chart-focus`) and `--shadow-lift` for an item picked up to be dragged. No existing token changes value. A custom theme that doesn't set the new tokens falls back to Paper's values at the document root, except the chart label, tooltip and focus tokens, which default to the theme's own ink, raised surface, strong line and focus colours.
- 33d0852: Add `CommandPalette`, a keyboard-first launcher that searches every page and action in an app. It opens from a `trigger` button, a page-wide `shortcut` such as `mod+k`, or `open`, and is a modal dialog, so focus is trapped inside and returns to whatever opened it. Actions share `Combobox`'s option shape and ranking (`label`, `description`, `keywords`, `group`, `disabled`), are listed under their group headings with the matched text marked, and show their own `shortcut` as keys. The arrow keys, Home and End move, and Enter runs the highlighted action, which is the best match as you type. An action with its own `actions` opens them as a nested page that Backspace, Escape or the back button leaves. It also takes `filter="none"` with `loading` for results from your own search, `limit`, and `recent` action ids to list first while the search is empty, recorded through `onAction`.
- 8e4dffa: Add date and time pickers. `Calendar` is a month grid for picking a date or a range, with the full date-grid keyboard, `min`, `max`, `isDateDisabled`, locale names and week start, and one or two months. `DateInput`/`DateField`, `TimeInput`/`TimeField` and `DateTimeInput`/`DateTimeField` type a date, a time or both part by part in the locale's order, with a calendar popover for the date ones. Values are ISO strings; with `timeZone`, a date-time is a UTC instant shown as that zone's clock. `DateRangePickerField` is a calendar picker for a range: `DateRangeField`'s props plus typed ends, one two-month calendar, optional times (`granularity`) and `presets`. It's a separate import, so `DateRangeField` keeps its native inputs and costs no more to import.
- add733a: Add `Collapse`, `Collapsible` and `Transition`, the shared motion primitives. `Collapse` animates content open and closed by height, `Collapsible` adds a trigger wired with `aria-expanded` and `aria-controls`, and `Transition` mounts an element with an enter animation and unmounts it after an exit (`fade`, `slide-up`, `slide-down`, `scale`, `pop`, or your own keyframes). All three take their timing from the theme's motion tokens and change instantly under reduced motion.
- add733a: Add `NavLinksGroup` for nested navigation. In a vertical nav a group is a disclosure button over an indented list, opens by itself when it holds the current page, and supports tree-style arrow keys; in a horizontal nav it opens its links in a panel. Groups can link to a landing page of their own, and items and groups take an `icon` and a `trailing` count. `NavLinksGroup` is a separate import, so a `NavLinks` without groups renders exactly as before and costs no more to import.
- add733a: Add `ShowMore`, which clamps any content to a number of `lines`, a `maxHeight` on the space scale, or `maxItems` of the list it wraps, with a toggle that appears only when there's more to show. The docs gain a "Clamping content" pattern: layout and text components never take clamp props; wrap them in `ShowMore`.
- 710afc0: Add `Swatch`, a small colour mark for who or what something is, and a `swatch` prop on `Badge`, `Tag` and `ToggleChip` that draws it sized to their text. Add `Indicator`, a count or dot pinned to the corner of another element, with its meaning added to that element's accessible description. Add `CopyButton` and the `useClipboard` hook, which copy with a fallback where the Clipboard API is missing and announce the result; `CodeBlock`'s copy button now uses the same hook. Add `JsonInput` and `JsonField`, a JSON editor that highlights with the theme, marks the line with a syntax error, formats or minifies without changing numbers, and takes your own `validate` rules, plus `formatJson`, `minifyJson` and `validateJson` for the same work outside the editor.
- add733a: Add toast notifications: mount a `Toaster` once and call `toast()` from anywhere, inside React or out. Toasts take the Alert frame and tones, one action and a close button, pause on hover and focus, can be reached with F8, dedupe by `id`, and support `toast.update`, `toast.dismiss` and `toast.promise`.

### Patch Changes

- 250f10a: `Collapse`, `ShowMore` and `NavLinksGroup` now animate closing too: the height shrinks away instead of snapping to 0.
- 0182b53: Reword the bundled setup-and-theming skill so it no longer hardcodes how many themes ship.

## 0.6.0

### Minor Changes

- 4c53011: `CodeBlock` can highlight code. Pass `tokens`, one array per line, and each token is coloured from the theme's own tokens, so highlighting follows every theme in light and dark. The new `@mitcsutt/kiln-ui/highlight` entry turns JavaScript, JSX, TypeScript and TSX into those tokens with Shiki, which is an optional peer dependency: install `shiki` to use it. Shiki and each grammar load only when `highlight` first runs, and the main entry doesn't change. Without `tokens`, `CodeBlock` renders as before.

### Patch Changes

- 4c53011: The `setup-and-theming` and `component-mode` skills link to the new AI tooling page on the docs site.

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
