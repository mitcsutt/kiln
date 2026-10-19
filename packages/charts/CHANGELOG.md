# @mitcsutt/kiln-charts

## 0.1.0

### Minor Changes

- 642f1b1: Add `@mitcsutt/kiln-charts`: charts drawn with kiln-ui's tokens. Presets `TimeSeries` (with drag-to-zoom and a keyboard alternative), `Bars`, `Share`, `BarList`, `Sparkline` and `Heatmap`; a composable `Chart` with bar, line and area series, grid, axes, reference lines, tooltip, legend and zoom parts; and the building blocks `ChartFrame`, `ChartTooltip`, `ChartLegend` and `ChartColorScope`. Every chart takes wide or long rows (`pivot`, grouping past eight series as "Other"), `format`, `locale` and `timeZone`; has an accessible name, a summary and a hidden data table; reads from the keyboard; skips animation under reduced motion; and renders on the server at its reserved size. Theme and mode changes restyle a mounted chart through CSS alone.
