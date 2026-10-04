import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { Slider as RadixSlider } from 'radix-ui'
import { cx } from '#utils/cx'
import { joinIds } from '#components/inputs/internal/refs'
import styles from './Slider.module.css'

/*
 * The shared body of Slider and RangeSlider (internal — import it only from those two).
 * Radix Slider underneath: values are always an array here; the public components map
 * them to a number or a tuple.
 */

export interface SliderMark {
  value: number
  /** Shown under the track; also used as the thumb's `aria-valuetext` when it lands on it. */
  label: string
}

export type SliderSize = 'sm' | 'md'

export interface SliderThumbConfig {
  id: string
  ref?: Ref<HTMLSpanElement>
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-readonly'?: true
  'aria-busy'?: true
}

export interface SliderBaseProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  values: readonly number[]
  onValuesChange: (values: number[]) => void
  onValuesCommit: (values: number[]) => void
  min: number
  max: number
  step: number
  minStepsBetweenThumbs?: number
  marks?: readonly SliderMark[]
  showValue: boolean
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
  name?: string
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  size: SliderSize
  thumbs: readonly SliderThumbConfig[]
}

/** `Intl.NumberFormat` for the value and `aria-valuetext`, memoised on its inputs. */
function useFormatter(locale: string | undefined, options: Intl.NumberFormatOptions | undefined) {
  const key = JSON.stringify(options ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is the options' identity
  return useMemo(() => new Intl.NumberFormat(locale, options), [locale, key])
}

const percentOf = (value: number, min: number, max: number) =>
  max === min ? 0 : ((value - min) / (max - min)) * 100

export const SliderBase = forwardRef<HTMLSpanElement, SliderBaseProps>(function SliderBase(
  {
    values,
    onValuesChange,
    onValuesCommit,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    marks,
    showValue,
    formatOptions,
    locale,
    name,
    disabled,
    readOnly,
    invalid,
    size,
    thumbs,
    className,
    ...rest
  },
  ref,
) {
  const formatter = useFormatter(locale, formatOptions)
  const valueText = (v: number): string | undefined => {
    const mark = marks?.find((m) => m.value === v)
    if (mark) return mark.label
    return formatOptions ? formatter.format(v) : undefined
  }
  const output: ReactNode = showValue ? values.map((v) => formatter.format(v)).join(' – ') : null

  return (
    <span
      ref={ref}
      className={cx(styles.slider, className)}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-show-value={showValue || undefined}
      {...rest}
    >
      <RadixSlider.Root
        className={styles.control}
        value={[...values]}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        disabled={disabled}
        onValueChange={(next) => {
          if (!readOnly) onValuesChange(next)
        }}
        onValueCommit={(next) => {
          if (!readOnly) onValuesCommit(next)
        }}
      >
        <RadixSlider.Track className={styles.track}>
          <RadixSlider.Range className={styles.range} />
        </RadixSlider.Track>
        {thumbs.map(({ ref: thumbRef, ...thumb }, i) => {
          const v = values[i]
          return (
            <RadixSlider.Thumb
              key={thumb.id}
              ref={thumbRef}
              className={styles.thumb}
              aria-valuetext={v === undefined ? undefined : valueText(v)}
              {...thumb}
            />
          )
        })}
      </RadixSlider.Root>
      {showValue ? (
        <output
          className={styles.output}
          htmlFor={joinIds(...thumbs.map((t) => t.id))}
          aria-live="off"
        >
          {output}
        </output>
      ) : null}
      {marks && marks.length > 0 ? (
        <span className={styles.marks} aria-hidden="true">
          {marks.map((m) => {
            const p = percentOf(m.value, min, max)
            return (
              <span
                key={m.value}
                className={styles.mark}
                data-edge={p <= 0 ? 'start' : p >= 100 ? 'end' : undefined}
                style={{ '--_p': p } as CSSProperties}
              >
                {m.label}
              </span>
            )
          })}
        </span>
      ) : null}
      {name
        ? values.map((v, i) => (
            <input key={i} type="hidden" name={name} value={v} disabled={disabled || undefined} />
          ))
        : null}
    </span>
  )
})
