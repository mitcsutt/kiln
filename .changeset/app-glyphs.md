---
'@mitcsutt/kiln-ui': minor
---

Add twelve icons for app navigation and page furniture, drawn on the same 20px grid with the theme's stroke: `TrophyIcon`, `CalendarIcon`, `UsersIcon`, `SwordsIcon`, `HelpIcon`, `ClockIcon`, `ZapIcon`, `MessageIcon`, `RadioIcon`, `ShieldIcon`, `TargetIcon` and `TrendingUpIcon`. A bottom nav or a stat tile no longer needs a second icon set beside Kiln's.

`createIcon` is marked free of side effects, so a bundler drops every icon an app doesn't import. An app that imports one component which uses an icon no longer pulls in the whole set.
