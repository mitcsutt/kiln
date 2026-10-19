# 0042. Date and time pickers are built on `Intl`, with ISO string values

- **Status:** Accepted, amended by [0044](0044-opt-in-parts-are-separate-exports.md)
- **Date:** 2026-10-15

## Context

kiln-ui had one date control, `DateRangeField`, built from two native `<input type="date">`. Issue [#64](https://github.com/mitcsutt/kiln/issues/64) asks for a calendar, single date, time and date-time inputs, and a range picker with a calendar, times and presets. Three questions needed an answer before building them.

**What to build on.** The options were:

- **Native inputs** (`date`, `time`, `datetime-local`). Their pickers can't be themed, they differ from browser to browser, and there is no native range.
- **react-day-picker** for the grid. It covers the month grid only; typed entry and time would still be ours, and it brings `date-fns` with it.
- **React Aria's date packages** (`@internationalized/date` and the hooks). They are thorough, but they bring their own calendar systems, date classes and hook model, and would roughly double the size of every date control. They are also a second headless library beside Radix, which [0015](0015-kiln-ui-port.md) and `packages/ui/AGENTS.md` keep as kiln-ui's only runtime dependency.

The browser already has what the controls need: `Intl.DateTimeFormat` gives each locale's date order, separators, clock, month and weekday names and zone offsets, and `Intl.Locale` gives the first day of the week where the runtime supports it. Civil-date arithmetic on whole days through `Date.UTC` can't be moved by a daylight-saving change.

**What the values are.** `DateRangeField` already used ISO strings. `Date` objects carry a zone they don't show, serialise differently in different places, and compare by identity.

**What "date-time" means.** A meeting at 9:30 means 9:30 wherever it's read; a log entry means one instant. One control has to serve both.

## Decision

- **No new dependency.** The date maths and locale reading live in `packages/ui/src/components/inputs/internal/dates.ts`, on `Date.UTC` and `Intl`, with unit tests. Where `Intl.Locale` has no week information (Firefox at the time of writing), a short list of Sunday-first regions stands in, and `firstDayOfWeek` overrides both.
- **Values are ISO strings, `''` when empty**: `YYYY-MM-DD` for a date, `HH:mm` or `HH:mm:ss` for a time (always on the 24-hour clock, whatever clock is shown), and `{ start, end }` for a range, as before.
- **A date-time is a wall clock unless it has a zone.** Without `timeZone` it's `YYYY-MM-DDTHH:mm`, like `datetime-local`. With `timeZone` it's the UTC instant `YYYY-MM-DDTHH:mm:ssZ`, shown and typed as that zone's clock, with the zone's name in the box. A wall time skipped by a daylight-saving change moves forward with the clocks, and a repeated one takes its first occurrence.
- **Typed entry is segmented.** Each part (day, month, year, hour, minute, second, am/pm) is a `role="spinbutton"` in the locale's order: digits fill it and move on, the arrow keys step it, and paste fills every part. The parts are `contenteditable` only so that a phone opens its numeric keyboard; every key and `beforeinput` is handled, so the DOM text never changes under React. The calendar is optional: a picker works with the keyboard alone.
- **The calendar is the ARIA grid pattern**: a table per month with a roving tab stop, the date-grid keys (arrows, Home/End, Page Up/Down, Shift for a year) and unavailable days that stay focusable. It opens in kiln-ui's own `Popover`, so it takes the theme of the place it was opened from.
- **The range picker is opt-in.** `DateRangeField` keeps its native inputs by default. `picker="calendar"`, or a time `granularity` or `presets`, switches to typed ends and one two-month calendar. `DateRangeFieldProps` stays one interface, so kiln-forms' `FormDateRangeField`, which extends it, keeps compiling.

## Consequences

- kiln-ui gains `Calendar`, `DateInput`/`DateField`, `TimeInput`/`TimeField` and `DateTimeInput`/`DateTimeField`, and `DateRangeField` gains the calendar picker, with no new runtime dependency.
- Only the Gregorian calendar is supported: formatting forces `calendar: 'gregory'` and Latin digits in the parts. A locale whose default calendar is another (Persian, Buddhist) sees Gregorian dates with its own month names. Other calendar systems would need a new ADR, and probably the dependency this one avoids.
- A value with an offset passed to a date-time control without `timeZone` is shown in the device's zone, and comes back as a wall clock once edited. The docs say to pass `timeZone` for instants.
- kiln-forms has no bound fields for the new controls yet; adding them is follow-up work.
