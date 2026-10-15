# 0040. How kiln-charts is built: a hidden engine, plain SVG where it can be, and a frame that renders on the server

- **Status:** Accepted
- **Date:** 2026-10-15

## Context

Charts ship as their own package, `@mitcsutt/kiln-charts` ([0039](0039-subpath-or-package.md)). The design was settled in [#47](https://github.com/mitcsutt/kiln/issues/47) (three grilling rounds and a Recharts spike) and specified in [#51](https://github.com/mitcsutt/kiln/issues/51), [#52](https://github.com/mitcsutt/kiln/issues/52) and [#53](https://github.com/mitcsutt/kiln/issues/53). Building it settled several details those issues left open or got slightly wrong, and later work needs them written down.

## Decision

**Two layers, both Kiln's.** Presets (`TimeSeries`, `Bars`, `Share`, `BarList`, `Sparkline`, `Heatmap`) take rows and a few props. The composable `Chart` takes parts (`Chart.Bar`, `Chart.Line`, `Chart.Area`, `Chart.Grid`, `Chart.XAxis`, `Chart.YAxis`, `Chart.ReferenceLine`, `Chart.Tooltip`, `Chart.Legend`, `Chart.Zoom`) that mix freely on one axis. `TimeSeries` and `Bars` are short compositions of those parts, documented as the source to copy.

**Recharts 3 is a regular dependency, imported only by `Chart`.** No public type names it, which a test checks by emitting the declarations. `engineProps` stays as the escape hatch, but it is typed `Readonly<Record<string, unknown>>` rather than as the engine's props: typing it as Recharts' props would put Recharts in the public types, which the same spec forbids, and the engine-swap goal wins. It is documented as outside semver.

**Plain SVG and HTML wherever the engine isn't needed.** The spike made `Sparkline` and `Heatmap` plain SVG and CSS. `Share` and `BarList` follow the same rule: a ring of dashed circle strokes and a ranked HTML list need no engine. They cost a few kB instead of about 80 kB, render completely on the server, and carry their values as text (the `Share` legend, the `BarList` list, the `Heatmap` table), which serves screen readers better than a drawn chart with a hidden table.

**`react-is` is a peer dependency.** Recharts peer-depends on it, and it must match the app's React major (React 19 elements are not React 18 elements to `react-is` 18), so the app supplies it.

**Every chart sits in a `ChartFrame`.** The frame is a figure named by `label` and described by `summary` (written from the data unless given), reserves the chart's height, holds the data as a visually hidden table, and shows the loading, empty and error states. A plot given as a function of its measured size runs only in the browser, so the server and the first client render produce the same frame, legend and table, and the plot then draws into space already reserved. That is the server-rendering model the spike called for: Recharts renders nothing on the server.

**Parts are read before drawing.** `Chart` reads its series, legend and zoom parts from its children (through fragments), not by registration in effects, so the legend, the tooltip's names and the table exist on the server too. Series parts must therefore be children of the `Chart`.

**Colour is resolved to CSS variables.** Every colour token resolves to a `var()`, so changing the theme or mode restyles a mounted chart with no React render. `ChartColorScope` assigns categorical slots to keys in first-seen order across the charts inside it; `order` fixes that order and `colors` pins a colour. A series' own `color` stays local to its chart, so pinning in one chart never changes another's colours depending on render order.

**Keyboard.** Recharts' accessibility layer moves between points with the arrow keys. `Chart` adds Enter and Space for `onPointClick`, and, with `Chart.Zoom`, Shift with the arrow keys to select a range and Enter to zoom, as the keyboard alternative to dragging. `Heatmap` is a grid with one roving tab stop. The tooltip content is a polite live region.

**Points sit evenly on a category axis.** `TimeSeries` places one point per row rather than on a continuous time scale. It keeps ticks, tooltips and the table on the same formatted values, keeps the keyboard and zoom index-based, and avoids time-zone drift in generated ticks. A gap in time is a row with missing values.

**Size budget.** The spike measured the Recharts presets at about 114 kB (gzip, tree-shaken, engine included); the budget for every preset together is that plus 10%, 125.4 kB. The size report gains a `bundle` option so those checks measure the engine a consumer ships, and separate checks keep `Sparkline` and `Heatmap` free of it.

## Consequences

- Swapping the engine touches `src/components/Chart/` only; presets and consumers keep their API, except code that passes `engineProps`.
- `TimeSeries` alone measures more than the spike's 101 kB (about 116 kB), because the one Cartesian root is Recharts' composed chart, which carries every series kind. The set of presets stays within budget.
- Irregular time series are drawn evenly spaced. A continuous time axis can be added later as an opt-in without changing the default.
- Wrapping a series part in your own component hides it from the legend, tooltip names and table. The docs say so.
