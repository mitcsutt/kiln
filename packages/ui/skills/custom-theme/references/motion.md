<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Motion

> Three durations and three easings, scaled by the theme's temperament and collapsed for reduced motion.

Source: https://kiln.mitchellsutton.com/docs/ui/foundations/motion

Motion in Kiln answers an action or shows a change of state: a panel opening, a row expanding, a score updating. It's never decoration. There's no fade-up on scroll, no hover-scale on static cards and no parallax.

## Durations and easings

| Token           | Paper | For                                              |
| --------------- | ----- | ------------------------------------------------ |
| `--dur-1`       | 110ms | hover and press feedback, colour changes         |
| `--dur-2`       | 190ms | small movements: a chevron turning, a toggle     |
| `--dur-3`       | 340ms | larger ones: a sheet sliding in, a panel opening |
| `--ease-out`    |       | things arriving                                  |
| `--ease-in-out` |       | things moving from one place to another          |
| `--ease-spring` |       | things landing. Only Fiesta actually bounces     |

Durations are multiplied by the theme's `--motion-scale`: Monograph runs a little slow (1.1), Ledger brisk (0.8). Hover or focus a row below to see each combination in the current theme:


## Reduced motion

When the reader asks for reduced motion, every duration collapses to 1ms. Transitions still run, so code that waits for `transitionend` keeps working, but nothing visibly travels. Components with keyframe animations (`Spinner`, `Skeleton`, `Marquee`, `LiveIndicator`) have their own reduced-motion branch.

## In your own CSS

Use the same tokens, and you get the theme's temperament and the reduced-motion behaviour for free:

```css
.panel {
  transition:
    opacity var(--dur-2) var(--ease-out),
    translate var(--dur-3) var(--ease-out);
}
```
