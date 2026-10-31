---
'@mitcsutt/kiln-ui': minor
---

Deprecate the Monograph and Fiesta themes ([ADR 0045](https://github.com/mitcsutt/kiln/blob/main/docs/adr/0045-four-themes-each-with-a-goal.md)). Both still work in this release, and leave in the next minor release. Switch Fiesta to Riso, and Monograph to Paper for a page or Flightdeck for a tool. `THEME_META` gains an optional `deprecated` note, set on both, that says what to switch to.
