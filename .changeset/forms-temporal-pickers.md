---
'@mitcsutt/kiln-forms': minor
---

`FormDateField`, `FormTimeField` and `FormDateTimeField` take an opt-in `picker` prop (and the same key in a schema) that renders kiln-ui's typed date and time controls in place of the native input: `picker="calendar"` for `DateField` or `DateTimeField` with a calendar to pick from, and `picker="segmented"` for the typed parts alone (the only picker for a time). With a picker they also take `isDateDisabled`, `firstDayOfWeek`, `locale`, `clearable` and `labels`, plus `timeZone` on a date and `granularity` and `hourCycle` on a time or date-time. Without `picker` nothing changes, and the value is the same ISO string either way. `FormDateRangeField` takes `picker="calendar"` too (and turns it on by itself for `presets` or a time `granularity`), rendering kiln-ui's `DateRangePickerField` with every one of its props; its view mode now reads an end with a time as a date and time (on the field's `timeZone` for an instant) instead of showing the raw ISO string.

In view mode, all four fields now read the value in the field's `locale`, and on its `hourCycle` for a time, when you set them, so reading matches editing. Without them, view mode reads exactly as before.
