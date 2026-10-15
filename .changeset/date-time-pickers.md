---
'@mitcsutt/kiln-ui': minor
---

Add date and time pickers. `Calendar` is a month grid for picking a date or a range, with the full date-grid keyboard, `min`, `max`, `isDateDisabled`, locale names and week start, and one or two months. `DateInput`/`DateField`, `TimeInput`/`TimeField` and `DateTimeInput`/`DateTimeField` type a date, a time or both part by part in the locale's order, with a calendar popover for the date ones. Values are ISO strings; with `timeZone`, a date-time is a UTC instant shown as that zone's clock. `DateRangeField` gains an opt-in calendar picker (`picker="calendar"`) with typed ends, one two-month calendar, optional times (`granularity`) and `presets`; its default native inputs are unchanged.
