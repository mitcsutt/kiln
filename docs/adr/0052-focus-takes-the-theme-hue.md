# 0052. Focus takes the theme's own hue

- **Status:** Accepted
- **Date:** 2026-10-28

## Context

DESIGN.md §2 said "**Focus is neutral** (`--color-focus` = ink)", and most themes set `--color-focus: var(--color-ink)`. The point of the rule was that focus must never look like validation: only error, warning and success tint a field.

In review of the redesigned themes, the owner found the result wrong: "The focus color on inputs looks off ... Most of the time its a black outline which doesn't match their themes each time." At 2px, a dark ink ring reads as black on a light page and as plain white on a dark one, whatever the theme. Riso already set a blue focus by day, so the rule wasn't being followed everywhere either.

Mature systems don't colour focus with ink. Carbon's `$focus` is its Blue 60, Primer's focus outline is its accent emphasis, Atlassian's `border.focused` is a lighter tone of its brand blue, and Material 3's focus ring is the secondary colour. GOV.UK's yellow-and-black indicator is the exception: it has to work on any background, which a themed system doesn't need.

What WCAG asks of the colour: 1.4.11 (AA) needs an author-styled indicator to reach 3:1 against adjacent colours, and 2.4.13 (AAA) needs at least a 2px perimeter with 3:1 between the focused and unfocused pixels. Kiln draws `outline: 2px solid var(--color-focus); outline-offset: 2px`, so the ring sits on the page colour, and on a fill only where it is inset (navigation rows, list rows, tabs).

## Decision

- **A theme may give focus its own interactive hue**, not only its ink: typically a lighter or more saturated tone of the hue that already means "you can act here". Flightdeck's focus is its cyan, the colour AC 25-11A gives to selected data, and is the first theme to move.
- **What "neutral" protected is now a test.** `packages/ui/src/themes/focus.test.ts` checks every built-in theme except the two being retired, in both modes:
  - the ring reaches 3:1 against the canvas, every surface, `--color-accent-soft` and `--color-highlight`;
  - it stays ΔE_OK 0.1 or more from `--tone-critical`, `--tone-positive` and their text colours, and at least 60° of hue from them when both colours have a hue (chroma 0.04 or more).
- **Ink stays a valid choice.** A theme whose ink passes the test may keep it.
- **Bands keep re-pointing focus to their own ink.** `Section` and `Box` on an accent, inverse or categorical fill set `--color-focus` to the band's ink, because that's the one colour guaranteed to clear 3:1 on any fill.
- Monograph and Fiesta keep their ink focus and are not checked: [0045](0045-four-themes-each-with-a-goal.md) retires them, and Fiesta's ink ring measures 1.4:1 on its dark gold highlight.

## Consequences

- DESIGN.md §2's focus line now states this rule and points at the test.
- Each theme that adopts its own focus hue changes only its stylesheet; the test applies to it either way.
- Menus and listboxes mark the keyboard-highlighted option with a `--color-surface-sunken` fill, not the focus colour, and that fill is low contrast against the popover. This decision doesn't change that; it's a separate component fix.
