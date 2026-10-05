import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import { CheckIcon, ErrorIcon } from '#icons'
import { VisuallyHidden } from '#components/layout/VisuallyHidden'
import styles from './Stepper.module.css'

export type StepperStatus = 'complete' | 'current' | 'upcoming' | 'error'

export interface StepperStep {
  /** Stable identifier — matched against `value` and passed to `onStepSelect`. */
  value: string
  label: ReactNode
  description?: ReactNode
  /** Overrides the status this step would otherwise derive from its position relative to `value`. */
  status?: StepperStatus
  /**
   * The step has errors. Independent of `status` (which keeps describing progress): an invalid
   * step gets the critical glyph and text, and the hidden error suffix in place of the complete one;
   * a current invalid step keeps `aria-current="step"`. `status: 'error'` is the same treatment for a step whose progress
   * you don't report.
   */
  invalid?: boolean
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onSelect'> {
  steps: readonly StepperStep[]
  /** The current step's `value` (`aria-current="step"`). */
  value: string
  /** Steps become buttons when set — lets people jump to a visited or upcoming step. */
  onStepSelect?: (value: string) => void
  /** Default `horizontal`. */
  orientation?: 'horizontal' | 'vertical'
  /** Below this breakpoint, collapse to a single line of text (`formatCompact`). */
  compactBelow?: 'sm' | 'md'
  formatCompact?: (index: number, total: number, label: ReactNode) => ReactNode
  /** Visually-hidden suffixes announced after a step's label. */
  statusLabels?: { complete?: string; error?: string }
}

const defaultFormatCompact = (index: number, total: number, label: ReactNode): ReactNode => (
  <>
    Step {index + 1} of {total} · {label}
  </>
)

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStatus {
  if (step.status) return step.status
  if (currentIndex < 0) return 'upcoming'
  if (index === currentIndex) return 'current'
  return index < currentIndex ? 'complete' : 'upcoming'
}

/**
 * Where you are in a multi-step flow. A step indicator, not a form control.
 *
 * @remarks
 * `Stepper` shows the steps of a flow and which one you're on. It doesn't hold the form: drive it
 * and the step content from the same state, and pair it with an `ActionBar` for back and next.
 *
 * @privateRemarks
 * A step indicator for a multi-step flow — not a form control. Pair with `ActionBar`
 * for the Back / Next / Submit row and drive both from the same current-step state.
 *
 * <Stepper
 *   steps={[{ value: 'you', label: 'You' }, { value: 'team', label: 'Team' }]}
 *   value={step}
 *   onStepSelect={setStep}
 * />
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    steps,
    value,
    onStepSelect,
    orientation = 'horizontal',
    compactBelow,
    formatCompact = defaultFormatCompact,
    statusLabels,
    className,
    id,
    style,
    ...rest
  },
  ref,
) {
  const autoId = useId()
  const baseId = id ?? autoId
  const total = steps.length
  const currentIndex = steps.findIndex((step) => step.value === value)
  const currentStep = currentIndex >= 0 ? steps[currentIndex] : undefined
  const completeSuffix = statusLabels?.complete ?? 'completed'
  const errorSuffix = statusLabels?.error ?? 'has errors'

  return (
    <div
      className={cx(styles.root, className)}
      data-compact-below={compactBelow}
      style={mergeStyles({ '--_count': total } as CSSProperties, style)}
    >
      {compactBelow ? (
        <p className={styles.compact}>
          {formatCompact(Math.max(currentIndex, 0), total, currentStep?.label ?? '')}
        </p>
      ) : null}
      <ol ref={ref} id={baseId} className={styles.list} data-orientation={orientation} {...rest}>
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex)
          const hasErrors = status === 'error' || step.invalid === true
          const stepId = `${baseId}-${step.value}`
          const marker = hasErrors ? (
            <ErrorIcon size="sm" />
          ) : status === 'complete' ? (
            <CheckIcon size="sm" />
          ) : (
            <span className={styles.number}>{index + 1}</span>
          )
          const inner = (
            <>
              <span className={styles.markerCol}>
                <span className={styles.marker}>{marker}</span>
                {index < total - 1 ? (
                  <span className={styles.connector} data-status={status} />
                ) : null}
              </span>
              <span className={styles.text}>
                <span className={styles.label}>
                  {step.label}
                  {status === 'complete' && !hasErrors ? (
                    <VisuallyHidden>{` ${completeSuffix}`}</VisuallyHidden>
                  ) : null}
                  {hasErrors ? <VisuallyHidden>{` ${errorSuffix}`}</VisuallyHidden> : null}
                </span>
                {step.description ? (
                  <span className={styles.description}>{step.description}</span>
                ) : null}
              </span>
            </>
          )
          return (
            <li
              key={step.value}
              className={styles.item}
              data-status={status}
              data-invalid={hasErrors || undefined}
            >
              {onStepSelect ? (
                <button
                  type="button"
                  id={stepId}
                  className={styles.control}
                  data-status={status}
                  data-invalid={hasErrors || undefined}
                  aria-current={status === 'current' ? 'step' : undefined}
                  onClick={() => {
                    onStepSelect(step.value)
                  }}
                >
                  {inner}
                </button>
              ) : (
                <span
                  id={stepId}
                  className={styles.control}
                  data-status={status}
                  data-invalid={hasErrors || undefined}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {inner}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
})
