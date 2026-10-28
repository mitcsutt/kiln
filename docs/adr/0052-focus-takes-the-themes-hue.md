# 0052. Focus takes the theme's own hue

- **Status:** Accepted (amends [0012](0012-design-standards.md)'s DESIGN.md focus rule)
- **Date:** 2026-10-28

## Context

DESIGN.md said "**Focus is neutral** (`--color-focus` = ink)". The reasoning was that a neutral ring can never be mistaken for validation. Reviewing the four built-in themes, the owner found the result looked wrong: "The focus color on inputs looks off ... Most of the time its a black outline which doesn't match their themes each time." At 2px, Paper's blue-black ink reads as plain black.

Mature systems don't colour focus with ink. Carbon's `$focus` is Blue 60 (`#0f62fe`), Primer's focus outline is its accent emphasis (`#0969da` light, `#1f6feb` dark), Atlassian's `border.focused` is a lighter tone of its brand blue (`#4688EC` light, `#8FB8F6` dark), and Material 3 draws the ring in its secondary colour. GOV.UK is the outlier: yellow with black, so one indicator works on any background, which a themed system doesn't need.

WCAG asks for two things here. 1.4.11 (AA) requires an author-styled indicator to reach 3:1 against adjacent colours, and 2.4.13 (AAA) asks for a 2px perimeter at 3:1 between focused and unfocused states. Kiln draws `outline: 2px solid var(--color-focus); outline-offset: 2px`, so the ring sits on whatever fill surrounds the element: the canvas, a sheet, a popover, or, for inset rings on nav rows, list rows and tabs, the accent-soft and highlight fills.

## Decision

- **`--color-focus` takes a hue from the theme**, normally its interactive hue at full saturation, not its ink. This applies to all four built-in themes:

  | Theme        | Light                   | Dark                    | Where the hue comes from                                                                                              |
  | ------------ | ----------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | `paper`      | `oklch(0.52 0.17 258)`  | `oklch(0.78 0.115 252)` | The fountain-pen ink, saturated. The navy accent reads as black at 2px; this reads as blue.                           |
  | `ledger`     | `oklch(0.52 0.12 240)`  | `oklch(0.78 0.11 240)`  | The blue pencil. Ledger's accent is ink, so this is the theme's only hue that isn't a status.                         |
  | `flightdeck` | `oklch(0.52 0.092 215)` | `oklch(0.86 0.12 208)`  | Cyan, the cockpit's colour for what the crew has selected (FAA AC 25-11A), a step lighter than the cyan fill in dark. |
  | `riso`       | `oklch(0.52 0.131 245)` | `oklch(0.78 0.11 252)`  | The blue drum in both modes, so focus never reads as the pink "selected" at night.                                    |

- **It clears 3:1 against every fill a ring sits beside:** `--color-canvas`, `--color-surface`, `--color-surface-sunken`, `--color-surface-raised`, `--color-accent-soft` and `--color-highlight`, in both modes.
- **It stays clear of validation:** at least 60° of hue and ΔE_OK 0.1 from `--tone-critical`, `--tone-positive` and their `-text` roles. Only error, warning and success tint a field, so focus must not look like them.
- **`themes/focus.test.ts` enforces both** for every built-in theme except the deprecated `monograph` and `fiesta`. The hue check applies only when both colours carry chroma (C ≥ 0.04), since a near-neutral has no meaningful hue.
- **Bands keep re-pointing focus to their ink.** `Section` and `Box` with an accent, inverse or categorical surface, and Marquee's non-plain surfaces, set focus to the band's ink so the ring clears any fill. That's unchanged.

## Consequences

- Each theme takes its focus colour in its own rebuild, one change per theme ([0045](0045-four-themes-each-with-a-goal.md)), and Paper's is first. Until a theme's rebuild lands, its old ink focus still passes the test, because ink clears the same contrast and tone-distance bar.
- The rule now asks for a hue, which the test can't judge; review does. A theme whose focus is still its ink is out of step with DESIGN.md even though the test passes.
- Keyboard highlight inside menus and listboxes (`Select`, `DropdownMenu`, `Combobox`, `CommandPalette`) is a sunken fill, not the focus token, and is below 3:1 against the popover. That's a separate component fix.
