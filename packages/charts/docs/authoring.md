# Authoring `@mitcsutt/kiln-charts`

Themed, accessible charts for kiln-ui. Two layers, both Kiln's own: **presets** (`TimeSeries`, `Bars`, `Share`, `BarList`, `Sparkline`, `Heatmap`) that take data and a few props, and the **composable** `Chart` with its parts, which `TimeSeries` and `Bars` are short compositions of. The decisions are in [ADR 0040](../../../docs/adr/0040-kiln-charts.md) (and the packaging rule in [ADR 0039](../../../docs/adr/0039-subpath-or-package.md)). Read the root [`DESIGN.md`](../../../DESIGN.md) first: its colour rules ("categorical colour marks who; ramps mark how much") and the data tokens in §3.2 are what these charts draw with. This file and its rules are binding standards ([ADR 0012](../../../docs/adr/0012-design-standards.md)); change a rule only together with the test that enforces it.

## Rules

- **The engine is hidden.** Recharts is a dependency, imported only in `src/components/Chart/` (`Chart.tsx`, `parts.tsx`). No public type names it: `src/test/publicTypes.test.ts` emits the declarations and fails on any mention. `engineProps` is typed `Readonly<Record<string, unknown>>` and documented as outside semver.
- **Plain SVG or HTML where the engine isn't needed.** `Sparkline`, `Heatmap`, `Share` and `BarList` never import Recharts (the size checks bundle Recharts in and would show it), so they cost a few kB and render completely on the server.
- **Colours are tokens, resolved to `var()`.** Every colour goes through `resolveColor` (`#core/colors`): `cat-N` fills with `--color-cat-N` and strokes with `--color-cat-N-stroke`, ramps and tones map to their variables. Never read a computed style: a theme or mode switch restyles a mounted chart through CSS with no React render (`Chart.test.tsx` counts commits).
- **Text is ink, never a series colour.** Ticks, legends and tooltips use `--chart-label`, `--chart-tooltip-*` and the ink tokens; the swatch carries the series colour. Legend swatches are kiln-ui's `Swatch` (lines get their own stroke mark).
- **Every chart sits in a `ChartFrame`**, which gives it an accessible name (`label`), a summary (written from the data by default), a visually hidden data table, the loading, empty and error states, and a reserved height so a chart that draws in the browser never shifts the page.
- **Server rendering.** The engine draws only in the browser: `ChartFrame` calls a render-function child only once it has measured the plot. The server and the first client render produce the same frame, legend and table (`src/test/hydration.test.tsx`). Use `useIsomorphicLayoutEffect`, never a bare `useLayoutEffect`.
- **No animation under reduced motion** (`usePrefersReducedMotion`, which assumes reduced motion on the server and during hydration).
- **Keyboard.** The engine's accessibility layer moves between points with the arrow keys; `Chart` adds Enter and Space for `onPointClick`, and Shift with the arrows plus Enter for `Chart.Zoom`. `Heatmap` is a grid with one roving tab stop.
- **Parts are read, not registered.** `Chart` reads its series, `Chart.Legend` and `Chart.Zoom` from its children (through fragments) before drawing, so the legend, tooltip and table exist on the server. Series parts must be children of the `Chart`.
- **Names.** No export shares a name with a kiln-ui export (`src/test/exportNames.test.ts`). A compound part whose `<Name><Member>Props` would name another export's props types them `<Name><Member>PartProps` (`ChartTooltipPartProps`), which the docs generator prefers.
- Same React, import and lint rules as kiln-ui: React 18 and 19, `forwardRef`, `#` subpath imports, kiln-ui from its barrel, CSS Modules unlayered with tokens only, `--_` private variables defined on the element that reads them.

## Layout

```
src/
  index.ts             the public barrel
  components/
    Chart/             the composable root (Chart.tsx), its parts (parts.tsx) and context
    ChartFrame/        frame, states and the hidden table
    ChartTooltip/      the tooltip card
    ChartLegend/       the legend, as a list or toggles
    ChartColorScope/   consistent colours across charts (useSeriesColors)
    TimeSeries/ Bars/  presets composed from Chart parts
    Share/ BarList/ Sparkline/ Heatmap/   plain SVG and HTML presets
    internal/Swatch/   the legend and tooltip colour key
  core/                colors, data (pivot, summary, table), format, hooks, series, style
  test/                setup, server rendering, hydration, public types, export names
```

Stories are `Charts/Presets/<Name>`, `Charts/Primitives/Chart` and `Charts/Building blocks/<Name>`, each with a `Playground` and docs stories, as in kiln-ui. Guides live in `apps/docs/content/docs/charts/getting-started/`.

## Commands

```bash
pnpm --filter @mitcsutt/kiln-charts test            # Vitest on React 19
pnpm --filter @mitcsutt/kiln-charts test:react18    # the same suite on React 18.3
pnpm --filter @mitcsutt/kiln-charts typecheck
pnpm --filter @mitcsutt/kiln-charts lint
pnpm --filter @mitcsutt/kiln-charts build
pnpm --filter @mitcsutt/kiln-charts check:package   # publint and attw
pnpm --filter @mitcsutt/kiln-charts size            # budgets, with Recharts bundled in for the engine checks
```

## Don'ts

- Don't import Recharts outside `components/Chart/`, or re-export anything from it.
- Don't colour text with a series colour, or use a categorical colour for an amount.
- Don't add runtime dependencies without an ADR. Today: `recharts` only.
