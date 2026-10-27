---
'@mitcsutt/kiln-forms': patch
---

The `view-mode` agent skill's "Long values" example now uses an access note long enough to run past two lines in every built-in theme. In Ledger and Flightdeck, whose smaller text fits more on a line, the old note filled exactly two lines on a wide page, so `viewLines={2}` showed no "Show more" toggle and the example didn't show the clamp. `viewLines` itself doesn't change.
