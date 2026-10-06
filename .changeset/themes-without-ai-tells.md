---
'@mitcsutt/kiln-ui': minor
---

Add two theme presets, rework two others, and enforce the second-order AI design tells with a test. Each new or reworked theme takes its subject from a real object or standard, and every colour, face, radius and easing has a one-line reason in its stylesheet. See [ADR 0028](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0028-theme-family-without-ai-tells.md).

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
