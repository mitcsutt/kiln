---
'@mitcsutt/kiln-ui': minor
---

App pages get a proper frame by default:

- **Side navigation.** `AppShell.Sidebar` sits on the sunken surface and is 18rem wide. In a vertical `NavLinks`, each top-level `NavLinksGroup` (and any link beside one) is a section: its label is in the heading face one step above the links, and a hairline rules it off from the section before. Every link is a full-width row with a hover fill and, for the current page, a soft accent fill as well as the dot. The keyboard focus ring is inset, so the sidebar's edge no longer clips it. New component tokens: `--navlinks-hover-bg`, `--navlinks-current-bg`, `--navlinks-section-rule` and `--app-shell-sidebar-bg`.
- **Page padding.** `AppShell.Main` pads the top and the end of the page (`--app-shell-main-padding`, default `var(--space-5) var(--space-5)` on a phone and `var(--space-6) var(--space-7)` from `md`), so content no longer sits flush against the end of the scroll. Set the token to `0` if your pages pad themselves.
- **`Page`.** A new layout for the content of an app screen: `Page.Header` (the `<h1>` title block), `Page.Section` (a `<section>` named by its `<h2>`), spaced at one rhythm.
- **Type scale.** The steps below body are now fixed fractions of `--type-base` instead of dividing by the theme's ratio: `--text-sm` is 0.875, `--text-xs` 0.75 and `--text-2xs` 0.6875 (14, 12 and 11px at a 16px base). Secondary text, table cells and small labels no longer drop to 12.5–12.8px beside body text. Every step is still in rem, so browser zoom scales all of them.
- **`PaletteIcon`.** A painter's palette for theme and colour-scheme pickers.
