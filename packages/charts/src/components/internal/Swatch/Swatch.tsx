import { Swatch as KilnSwatch, type CategoryColor } from '@mitcsutt/kiln-ui'

import { resolveColor, type ChartColor } from '#core/colors'
import { cssVars } from '#core/style'

import styles from './Swatch.module.css'

/** How a swatch draws: a chip for filled marks, a stroke for lines. */
export type SwatchShape = 'chip' | 'line' | 'dashed'

export interface SwatchProps {
  color: ChartColor
  shape?: SwatchShape | undefined
}

/**
 * The colour key beside a series' name in a legend or tooltip. Decorative: the name beside it
 * carries the meaning, so it's hidden from assistive technology.
 *
 * Chips are kiln-ui's `Swatch`, so a series looks the same in a chart, its legend and a filter
 * chip (`<Tag swatch>`). Lines are drawn here, in the series' stroke colour, as the line is.
 */
export function Swatch({ color, shape = 'chip' }: SwatchProps) {
  if (shape === 'chip') {
    const slot = /^cat-([1-8])$/.exec(color)?.[1]
    return <KilnSwatch color={slot ? (Number(slot) as CategoryColor) : resolveColor(color).fill} />
  }
  return (
    <span
      aria-hidden
      className={styles.line}
      data-shape={shape}
      style={cssVars({ '--_stroke': resolveColor(color).stroke })}
    />
  )
}
