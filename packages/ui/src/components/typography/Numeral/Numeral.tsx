import { Fragment, forwardRef, type DataHTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { formatNumeralParts, signOf } from './format'
import styles from './Numeral.module.css'

export type NumeralTone =
  'auto' | 'default' | 'muted' | 'accent' | 'positive' | 'caution' | 'critical'
export type NumeralSize =
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'display-sm' | 'display-md' | 'display-lg'

export interface NumeralProps extends Omit<
  DataHTMLAttributes<HTMLDataElement>,
  'value' | 'children' | 'prefix'
> {
  value: number
  /** Passed straight to `Intl.NumberFormat` (percent, units, fraction digits, compact…). */
  format?: Intl.NumberFormatOptions
  /** BCP 47 locale. Default `en-AU`. */
  locale?: string
  /** Shorthand for `format.signDisplay`. `exceptZero` shows +/− on everything but zero. */
  signDisplay?: Intl.NumberFormatOptions['signDisplay']
  /** `auto` colours by sign: positive → positive tone, negative → critical. Omit to inherit. */
  tone?: NumeralTone
  /** Step on the type scale. Omit to inherit — figures usually sit inside other text. */
  size?: NumeralSize
  /** Set before the figures, proportional (not tabular): "≈", "#", "Rank ". Add your own spacing. */
  prefix?: ReactNode
  /** Set after the figures, proportional: " seats", "×", " km". Add your own spacing. */
  suffix?: ReactNode
}

/**
 * A formatted number in tabular figures, with its machine-readable value attached.
 *
 * @remarks
 * `Numeral` formats a number with `Intl.NumberFormat` and sets it in the theme's numeric face with
 * tabular, lining figures, so a column of them lines up and a changing value doesn't jitter. It
 * renders a `<data value>` element, so the raw value travels with the formatted text.
 *
 * @privateRemarks
 * A formatted number. Always tabular, lining figures in the theme's numeric face, and
 * wrapped in <data value> so the machine-readable value travels with it. Separators
 * and symbols are set proportionally: some faces (Schibsted) make a tabular comma as
 * wide as a digit, which reads as "1 , 017". Right-aligned columns still line up.
 *
 * <Numeral value={0.184} format={{ style: 'percent', maximumFractionDigits: 1 }} signDisplay="exceptZero" tone="auto" />
 */
export const Numeral = forwardRef<HTMLDataElement, NumeralProps>(function Numeral(
  { value, format, locale = 'en-AU', signDisplay, tone, size, prefix, suffix, className, ...rest },
  ref,
) {
  const sign = signOf(value)
  const parts = formatNumeralParts(value, locale, signDisplay ? { ...format, signDisplay } : format)
  const resolvedTone =
    tone === 'auto'
      ? sign === 'positive'
        ? 'positive'
        : sign === 'negative'
          ? 'critical'
          : undefined
      : tone
  return (
    <data
      ref={ref}
      value={String(value)}
      className={cx(styles.numeral, className)}
      data-sign={sign}
      data-tone={resolvedTone}
      data-size={size}
      {...rest}
    >
      {prefix != null && prefix !== false ? (
        <span className={styles.mark} data-affix="prefix">
          {prefix}
        </span>
      ) : null}
      {parts.map((part, i) =>
        part.kind === 'mark' ? (
          <span key={i} className={styles.mark}>
            {part.value}
          </span>
        ) : (
          <Fragment key={i}>{part.value}</Fragment>
        ),
      )}
      {suffix != null && suffix !== false ? (
        <span className={styles.mark} data-affix="suffix">
          {suffix}
        </span>
      ) : null}
    </data>
  )
})
