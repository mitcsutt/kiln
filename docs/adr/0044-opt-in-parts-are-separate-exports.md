# 0044. An opt-in part that brings heavy code is a separate export

- **Status:** Accepted (amends [0042](0042-date-and-time-pickers.md))
- **Date:** 2026-10-19

## Context

Two additions since kiln-ui 0.6.0 were opt-in in behaviour but not in size:

- `NavLinks.Group` was attached with `Object.assign(NavLinksRoot, { Item, Group })`, as kiln-ui attaches every compound part. A bundler can't drop a property of an object that's used, so every `import { NavLinks }` carried the group, and with it `Popover` (Radix's popover and its positioning code) and `Collapse`.
- `DateRangeField`'s calendar picker was a `picker="calendar"` prop ([0042](0042-date-and-time-pickers.md)). The component chose between its native inputs and the picker at render time, so it imported `Popover`, `Calendar`, `DateInput`, `DateTimeInput` and `TimeInput` whichever one it rendered.

Measured with the size report (gzip, Radix bundled in), a plain `import { NavLinks }` went from 1.89 kB in 0.6.0 to 26.22 kB, and a plain `import { DateRangeField }` from 3.33 kB to 36.18 kB. Apps that only used the flat nav and the native range rendered the same and grew by about 23 kB of JavaScript. The size budgets had no check for either import, so nothing failed.

Options considered:

- **Load the heavy part on demand** (`React.lazy` or a dynamic `import()` at render). kiln-ui renders on the server and the client with no `'use client'`, so a lazy part needs a Suspense boundary and shows a fallback on first open. It also hides the cost in a chunk the size report doesn't count by default.
- **Pass the heavy part in** (`picker={DateRangeCalendar}`, the way `CodeBlock` takes `tokens` from the `highlight` entry). It keeps one component, but its interface becomes the props the field passes the picker, and kiln-forms' schema value `"picker": "calendar"` still has to be mapped to the component somewhere.
- **Export the part as its own component**, which is what kiln-ui already does for a control that costs more than its plain version (`DateField` beside `TextField` with `type="date"`).

## Decision

- **A part that brings code its plain component doesn't need is a separate named export**, not a property of the compound and not a mode of the plain component. The plain import costs what it did before the part existed.
- **`NavLinksGroup`** is exported beside `NavLinks`, and `NavLinks` keeps only `Item`. Groups still nest inside `NavLinks` and each other exactly as before. The tree-style arrow keys, which only a nav with groups uses, live with the group too: each group hands its nav the key handler through context.
- **`DateRangePickerField`** is the calendar picker. Its props are `DateRangeFieldProps` plus the picker's own (`granularity`, `presets`, `clearable`, `isDateDisabled`, `firstDayOfWeek`, `locale`, `timeZone`, `hourCycle`, `labels`). `DateRangeField` goes back to its 0.6.0 props and markup and has no `picker` prop. Both are documented on `DateRangeField`'s page.
- **kiln-forms keeps its API.** `FormDateRangeField` still takes `picker="calendar"` and the picker's props, in components and schemas, and renders `DateRangePickerField` or `DateRangeField` from them. The default kit already registers the calendar-based fields, so this adds little to it.
- **Each plain import and each opt-in part has a size budget** in `packages/ui/size.config.json`: `NavLinks` and `DateRangeField` isolated and with `radix-ui` included, and `NavLinksGroup` and `DateRangePickerField` isolated. A part that slips back into the plain import fails `pnpm size`.

## Consequences

- A plain `import { NavLinks }` is 2.23 kB with Radix (1.14 kB without), against 1.89 kB in 0.6.0; the difference is item `icon` and `trailing`, which a flat nav can use, and the larger class map. A plain `import { DateRangeField }` is back to 3.38 kB.
- Consumers who want groups or the calendar import one more name. Neither was released, so nothing that shipped changes.
- This replaces [0042](0042-date-and-time-pickers.md)'s "`picker="calendar"`, or a time `granularity` or `presets`, switches" and "`DateRangeFieldProps` stays one interface" for kiln-ui. kiln-forms keeps that behaviour on `FormDateRangeField`, whose props now extend `DateRangePickerFieldProps`.
- A future opt-in part follows this rule: before attaching a part with `Object.assign` or adding a mode prop, check what it imports, and add a budget for the plain import when it's new.
