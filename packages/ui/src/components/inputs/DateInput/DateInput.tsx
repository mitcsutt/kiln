import {
  forwardRef,
  useMemo,
  useRef,
  type FocusEventHandler,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CalendarIcon, CloseIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { Popover } from '#components/overlays/Popover'
import { Calendar } from '#components/inputs/Calendar'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import {
  DateSegments,
  draftDate,
  draftFromParts,
  segmentPattern,
  useSegmentDraft,
  type Draft,
} from '#components/inputs/internal/DateSegments'
import {
  DEFAULT_LOCALE,
  compareDates,
  formatDate,
  parseDate,
  todayIn,
} from '#components/inputs/internal/dates'
import {
  DEFAULT_DATE_TIME_LABELS,
  focusSegment,
  handleBoxPointerDown,
  isLeaving,
  type DateTimeLabels,
} from '#components/inputs/internal/picker'
import control from '#components/inputs/internal/control.module.css'
import picker from '#components/inputs/internal/picker.module.css'

export interface DateInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'onBlur' | 'onFocus'
> {
  /** `YYYY-MM-DD`, or `''` until every part is filled in. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Earliest date (`YYYY-MM-DD`). Earlier dates can't be picked and mark a typed one invalid. */
  min?: string
  /** Latest date (`YYYY-MM-DD`). */
  max?: string
  /** Marks other dates unavailable, in the calendar and when typed. */
  isDateDisabled?: (date: string) => boolean
  /** 0 (Sunday) to 6 (Saturday). Defaults to the locale's own week. */
  firstDayOfWeek?: number
  /** BCP 47 locale for the order of the parts and the calendar's names. Default `en-AU`. */
  locale?: string
  /** The zone "today" is read in: the calendar's marker and where arrow keys start. */
  timeZone?: string
  /** Show the calendar button. Default `true`. Typing always works. */
  calendar?: boolean
  /** Show a clear button while there's a value. */
  clearable?: boolean
  /** Submits the ISO date (`''` when incomplete). */
  name?: string
  form?: string
  size?: Size
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Whether the calendar is open. Controlled. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fires once focus leaves the whole control, calendar included. */
  onBlur?: FocusEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  labels?: Partial<DateTimeLabels>
}

const toDraft = (value: string): Draft => draftFromParts(parseDate(value))
const fromDraft = (draft: Draft): string => {
  const date = draftDate(draft)
  return date ? formatDate(date) : ''
}

/** Whether `value` is a date outside `min`/`max` or one `isDateDisabled` rules out. */
export function isDateOutOfRange(
  value: string,
  min: string | undefined,
  max: string | undefined,
  isDateDisabled?: (date: string) => boolean,
): boolean {
  const date = parseDate(value)
  if (!date) return false
  const minDate = parseDate(min ?? '')
  const maxDate = parseDate(max ?? '')
  return (
    (minDate !== null && compareDates(date, minDate) < 0) ||
    (maxDate !== null && compareDates(date, maxDate) > 0) ||
    (isDateDisabled?.(value) ?? false)
  )
}

/**
 * A date typed part by part in the locale's order, with a calendar to pick from.
 *
 * @remarks
 * `DateInput` holds a date as an ISO string (`2026-10-15`). The day, month and year are separate
 * parts in the locale's order: type the digits and it moves to the next part on its own, or use
 * the arrow keys to step a part up and down. The calendar button opens a {@link Calendar | Calendar}
 * for anyone who'd rather pick, and Alt + Down Arrow opens it from the keyboard. Until every part
 * is filled in the value stays `''`.
 *
 * A date outside `min`/`max`, or one `isDateDisabled` rules out, can't be picked in the calendar
 * and marks a typed one invalid. For the usual labelled field, use {@link DateField | DateField}.
 *
 * ## Keyboard
 *
 * | Key | Does |
 * | --- | --- |
 * | Digits | Fill the focused part, moving on when it's full |
 * | Up / Down Arrow | Step the focused part (an empty part starts from today) |
 * | Left / Right Arrow | Move between parts |
 * | Backspace | Clear the focused part |
 * | Alt + Down Arrow | Open the calendar |
 *
 * @privateRemarks
 * Each part is a `role="spinbutton"` inside a `role="group"` box named by the Field label; the
 * first part takes the Field's `id`. The ref goes to the box. Value ↔ draft lives in
 * `useSegmentDraft`: a new value from outside (controlled, or a calendar pick) resets the parts.
 *
 * <DateInput value={due} onValueChange={setDue} min="2026-10-01" clearable />
 */
export const DateInput = markFieldAware(
  forwardRef<HTMLDivElement, DateInputProps>(function DateInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      min,
      max,
      isDateDisabled,
      firstDayOfWeek,
      locale = DEFAULT_LOCALE,
      timeZone,
      calendar = true,
      clearable = false,
      name,
      form,
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
      invalid: invalidProp,
      open: openProp,
      defaultOpen,
      onOpenChange,
      onBlur,
      onFocus,
      onKeyDown,
      labels: labelsProp,
      className,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const labels = { ...DEFAULT_DATE_TIME_LABELS, ...labelsProp }
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
    })
    const rootRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const composedRef = useMergedRefs(ref, rootRef)
    const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onValueChange)
    const [open, setOpen] = useControllableState(openProp, defaultOpen ?? false, onOpenChange)
    const pattern = useMemo(() => segmentPattern('date', locale, 'minute', 24), [locale])
    const [draft, setDraft] = useSegmentDraft(value, toDraft, fromDraft, setValue)
    const interactive = !field.disabled && !field.readOnly
    const invalid = field.invalid || isDateOutOfRange(value, min, max, isDateDisabled)
    const hasEntry = Object.keys(draft).length > 0
    const reference = draftFromParts(todayIn(timeZone))

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      if (calendar && interactive && event.altKey && event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }
    }

    const box = (
      // The group only routes what its parts don't handle: a click on its padding, and
      // Alt + Down Arrow from any part to open the calendar.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        ref={composedRef}
        role="group"
        className={cx(control.box, picker.root, className)}
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        aria-labelledby={ariaLabelledBy ?? field.labelId}
        aria-describedby={field.describedBy}
        aria-busy={field.busy || undefined}
        {...rest}
        onPointerDown={handleBoxPointerDown}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          if (isLeaving(event, rootRef, panelRef)) onFocus?.(event)
        }}
        onBlur={(event) => {
          if (isLeaving(event, rootRef, panelRef)) onBlur?.(event)
        }}
      >
        <DateSegments
          pattern={pattern}
          draft={draft}
          onDraftChange={setDraft}
          hourCycle={24}
          periodNames={['', '']}
          labels={labels}
          reference={reference}
          firstId={field.id}
          disabled={field.disabled}
          readOnly={field.readOnly}
          invalid={invalid}
          required={field.required}
        />
        {(clearable && interactive && hasEntry) || calendar ? (
          <span className={picker.trailing}>
            {clearable && interactive && hasEntry ? (
              <button
                type="button"
                className={picker.button}
                aria-label={labels.clear}
                onClick={() => {
                  setDraft({})
                  focusSegment(rootRef.current, 'first')
                }}
              >
                <CloseIcon />
              </button>
            ) : null}
            {calendar ? (
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={picker.button}
                  aria-label={labels.openCalendar}
                  disabled={!interactive}
                >
                  <CalendarIcon />
                </button>
              </Popover.Trigger>
            ) : null}
          </span>
        ) : null}
        {name !== undefined ? (
          <input
            type="hidden"
            name={name}
            form={form}
            value={value}
            disabled={field.disabled || undefined}
          />
        ) : null}
      </div>
    )

    if (!calendar) return box

    return (
      <Popover open={open && interactive} onOpenChange={setOpen}>
        <Popover.Anchor asChild>{box}</Popover.Anchor>
        <Popover.Content
          ref={panelRef}
          className={picker.popover}
          align="start"
          aria-label={labels.openCalendar}
          onOpenAutoFocus={(event) => {
            // The calendar focuses its own day instead of the first button.
            event.preventDefault()
          }}
        >
          <Calendar
            // The panel is a dialog: opening it moves focus to its current day.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={parseDate(value) ? value : ''}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            firstDayOfWeek={firstDayOfWeek}
            locale={locale}
            timeZone={timeZone}
            labels={labels}
            onValueChange={(next) => {
              setValue(next)
              setOpen(false)
            }}
          />
        </Popover.Content>
      </Popover>
    )
  }),
)
