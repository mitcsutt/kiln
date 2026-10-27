# 0045. Four built-in themes, each with a goal

- **Status:** Accepted (amends [0030](0030-theme-family-without-ai-tells.md))
- **Date:** 2026-10-27

## Context

[0030](0030-theme-family-without-ai-tells.md) gave each theme a subject from a real working object, and kept `monograph` and `fiesta` unchanged and exempt from the second-order tells so nothing broke for apps that used them. Kiln ships six themes as a result.

A subject explains how a theme looks, not when to choose it. Asked which world Monograph should move to, there was no way to answer: nothing said what Monograph is for. A side-by-side review of all six in both modes found the same gap from the other direction:

- Paper, Monograph and Flightdeck share almost the same cool grey-blue canvas in light mode, and almost the same blue-black in dark mode. Three of six themes are hard to tell apart with the fonts covered.
- Monograph's ember accent on near-black with a large serif, and Fiesta's hard offsets with condensed capitals, are both second-order tells that 0030 exempted rather than fixed.
- Fiesta's "misregistered" offset duplicates Riso's.

Usage in the apps that install kiln-ui:

| Theme        | Used by                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `paper`      | the default in every app                                               |
| `flightdeck` | the author's site                                                      |
| `ledger`     | the budget app                                                         |
| `riso`       | no app yet; shown as a sample                                          |
| `monograph`  | no app; it was the old site's look, and the site shows it as a sample  |
| `fiesta`     | no app; it came from a draw app that uses its own components, not Kiln |

## Decision

- **Kiln ships four built-in themes, and each has a goal:** the kind of product to choose it for. The goal comes first and the subject serves it. Every change to a theme is judged against its goal.

  | Theme        | Choose it when                                                                                                                   | It should feel           | Lead mode                                 |
  | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------- |
  | `paper`      | the product shouldn't have a personality yet, or must sit under someone else's brand: admin, internal tools, forms, early builds | clear and out of the way | neither: both modes are equal             |
  | `ledger`     | the work is numbers people have to trust: money, records, dense tables, reconciliation                                           | precise and calm         | light (the pad), with an authored dark    |
  | `flightdeck` | someone is operating something live: dashboards, monitoring, developer tools, status at a glance                                 | alert, fast, in control  | dark (the cockpit), with an authored day  |
  | `riso`       | the product is for people rather than operators: community, events, creative and personal projects                               | warm, playful, handmade  | light (the print), with an authored night |

- **Each mode is authored, not inverted.** The lead mode carries the theme's identity. The other mode is the same subject at another moment (Flightdeck's day mode is an electronic flight bag in daylight, not the cockpit with the lights on), and it must not share a canvas with another theme's same mode.
- **`riso` takes over the playful job** that `fiesta` held. It keeps its own subject; nothing of Fiesta's look moves into it.
- **`monograph` and `fiesta` are retired**, in two steps:
  1. A minor release marks both as deprecated (their `ThemeName` values, their stylesheets' docs, and DESIGN.md) and says what to switch to: `riso` for Fiesta, and `paper` or `flightdeck` for Monograph, depending on whether the app is a page or a tool.
  2. The next minor release removes `themes/monograph.css`, `themes/fiesta.css`, their font files, their `ThemeName` values, their exemption in `tells.test.ts`, and their Storybook and test-matrix entries.
- **This replaces 0030's "kept unchanged" clause.** 0030's subject rule and its second-order tells still apply, now to every built-in theme with no exemptions.
- **A new built-in theme needs a goal none of the four serves**, written down before its subject. Long-form reading is the known gap: if a reading theme is wanted, it comes back as a new theme with that goal, not as Monograph.

## Consequences

- **Breaking, in the second step.** Apps that import `themes/monograph.css` or `themes/fiesta.css`, or pass `theme="monograph"` or `theme="fiesta"`, must switch before upgrading past the removal. kiln-ui is `0.x`, so this ships as a minor bump ([0008](0008-versioning-and-release.md)), with the deprecation release in between as warning.
- The author's site imports both stylesheets for its theme swatches and has to drop them before it upgrades. The docs site's theme switcher lists all six and has to drop them in the removal release.
- The Storybook test matrix in CI goes from twelve jobs (six themes, two modes) to eight.
- `DESIGN.md` §4 opens each theme with its goal, and PRODUCT.md records the four goals as product truth.
- The 2026-10-27 critique of the six themes (light-mode sameness, dark canvases that match, a status layer that looks the same in every theme) is now scored against these goals. Those fixes follow as one change per theme.
