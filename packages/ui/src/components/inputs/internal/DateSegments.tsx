import {
  forwardRef,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type SyntheticEvent,
  type KeyboardEvent,
} from 'react'
import {
  DEFAULT_LOCALE,
  daysInMonth,
  pad,
  type CalendarDate,
  type TimeGranularity,
  type TimeOfDay,
} from './dates'
import styles from './segments.module.css'

/**
 * Segmented entry for dates and times: each part (day, month, year, hour, minute, second,
 * am/pm) is its own spin button. Typing digits fills a part and moves on once it can't take
 * another digit; arrows step it; Backspace clears it. Shared by DateInput, TimeInput,
 * DateTimeInput and DateRangeField's calendar picker (internal, not exported).
 *
 * Each part is `contenteditable` only so a phone opens its numeric keyboard: every key and
 * `beforeinput` is handled here and the DOM text never changes under React.
 */

export type SegmentField = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
export type SegmentType = SegmentField | 'dayPeriod'

/** The parts typed so far. `hour` is 0 to 23; `period` holds am/pm while the hour is empty. */
export type Draft = Partial<Record<SegmentField, number>> & { period?: 'am' | 'pm' }

export type SegmentPattern = ({ type: SegmentType } | { type: 'literal'; value: string })[]

/** Accessible names of the parts, and the text an empty part shows. */
export interface SegmentLabels {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
  dayPeriod: string
  /** Read for an empty part. */
  empty: string
  yearPlaceholder: string
  monthPlaceholder: string
  dayPlaceholder: string
  hourPlaceholder: string
  minutePlaceholder: string
  secondPlaceholder: string
}

export const DEFAULT_SEGMENT_LABELS: SegmentLabels = {
  year: 'Year',
  month: 'Month',
  day: 'Day',
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  dayPeriod: 'AM/PM',
  empty: 'Empty',
  yearPlaceholder: 'yyyy',
  monthPlaceholder: 'mm',
  dayPlaceholder: 'dd',
  hourPlaceholder: '––',
  minutePlaceholder: '––',
  secondPlaceholder: '––',
}

const FIELD_TYPES = new Set<string>(['year', 'month', 'day', 'hour', 'minute', 'second'])
const DATE_TYPES = new Set<string>(['year', 'month', 'day'])

/**
 * The parts and separators for `kind`, in the locale's order: "15/10/2026", "2:30 pm",
 * "15/10/2026, 2:30 pm" in en-AU.
 */
export function segmentPattern(
  kind: 'date' | 'time' | 'datetime',
  locale: string,
  granularity: TimeGranularity,
  hourCycle: 12 | 24,
): SegmentPattern {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }
  if (kind !== 'time') Object.assign(options, { year: 'numeric', month: '2-digit', day: '2-digit' })
  if (kind !== 'date') {
    Object.assign(options, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: hourCycle === 12 ? 'h12' : 'h23',
    })
    if (granularity === 'second') options.second = '2-digit'
  }
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat(locale, options).formatToParts(Date.UTC(2026, 10, 22, 13, 45))
  } catch {
    parts = new Intl.DateTimeFormat(DEFAULT_LOCALE, options).formatToParts(
      Date.UTC(2026, 10, 22, 13, 45),
    )
  }
  const pattern: SegmentPattern = []
  for (const part of parts) {
    if (FIELD_TYPES.has(part.type) || part.type === 'dayPeriod')
      pattern.push({ type: part.type as SegmentType })
    else if (part.type === 'literal' && pattern.length > 0)
      pattern.push({ type: 'literal', value: part.value.replace(/[\u200e\u200f]/g, '') })
  }
  while (pattern.length > 0 && pattern[pattern.length - 1]?.type === 'literal') pattern.pop()
  return pattern
}

/** Whether every part in `pattern` has a value. */
export function isDraftComplete(draft: Draft, pattern: SegmentPattern): boolean {
  return pattern.every(
    (part) =>
      part.type === 'literal' || part.type === 'dayPeriod' || draft[part.type] !== undefined,
  )
}

export function draftFromParts(date?: CalendarDate | null, time?: TimeOfDay | null): Draft {
  return { ...date, ...time }
}

export function draftDate(draft: Draft): CalendarDate | null {
  const { year, month, day } = draft
  return year !== undefined && month !== undefined && day !== undefined
    ? { year, month, day }
    : null
}

export function draftTime(draft: Draft): TimeOfDay | null {
  const { hour, minute, second = 0 } = draft
  return hour !== undefined && minute !== undefined ? { hour, minute, second } : null
}

/**
 * Value ↔ draft for a segmented control. The draft holds partial entry (a day and month with
 * no year yet); the value only changes once the draft is complete, or empties when a complete
 * draft loses a part. A new value from outside (controlled, or a calendar pick) resets it.
 */
export function useSegmentDraft(
  value: string,
  toDraft: (value: string) => Draft,
  fromDraft: (draft: Draft) => string,
  setValue: (value: string) => void,
): [Draft, (next: Draft) => void] {
  const [draft, setDraft] = useState<Draft>(() => toDraft(value))
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(toDraft(value))
  }
  const update = (next: Draft) => {
    const nextValue = fromDraft(next)
    setDraft(nextValue ? toDraft(nextValue) : next)
    if (nextValue !== value) {
      setSynced(nextValue)
      setValue(nextValue)
    }
  }
  return [draft, update]
}

interface Bounds {
  min: number
  max: number
}

function boundsOf(type: SegmentType, draft: Draft, hourCycle: 12 | 24): Bounds {
  switch (type) {
    case 'year':
      return { min: 1, max: 9999 }
    case 'month':
      return { min: 1, max: 12 }
    case 'day':
      return {
        min: 1,
        max: draft.month === undefined ? 31 : daysInMonth(draft.year ?? 2024, draft.month),
      }
    case 'hour':
      return hourCycle === 12 ? { min: 1, max: 12 } : { min: 0, max: 23 }
    case 'minute':
    case 'second':
      return { min: 0, max: 59 }
    case 'dayPeriod':
      return { min: 0, max: 1 }
  }
}

function isPm(draft: Draft): boolean | undefined {
  if (draft.hour !== undefined) return draft.hour >= 12
  return draft.period === undefined ? undefined : draft.period === 'pm'
}

/** A part's value as shown: the hour on the 12-hour clock where it's in use, 0/1 for am/pm. */
function displayValue(type: SegmentType, draft: Draft, hourCycle: 12 | 24): number | undefined {
  if (type === 'dayPeriod') {
    const pm = isPm(draft)
    return pm === undefined ? undefined : pm ? 1 : 0
  }
  const value = draft[type]
  if (type === 'hour' && hourCycle === 12 && value !== undefined) return value % 12 || 12
  return value
}

function without(draft: Draft, key: keyof Draft): Draft {
  return Object.fromEntries(Object.entries(draft).filter(([name]) => name !== key))
}

/** Sets a part from its shown value, keeping the hour and am/pm consistent and the day real. */
function withValue(
  draft: Draft,
  type: SegmentType,
  value: number | undefined,
  hourCycle: 12 | 24,
): Draft {
  let next: Draft = { ...draft }
  if (type === 'dayPeriod') {
    const pm = value === 1
    if (next.hour !== undefined) next.hour = (next.hour % 12) + (pm ? 12 : 0)
    else if (value === undefined) return without(next, 'period')
    else next.period = pm ? 'pm' : 'am'
    return next
  }
  if (value === undefined) {
    if (type === 'hour' && next.hour !== undefined && hourCycle === 12)
      next.period = next.hour >= 12 ? 'pm' : 'am'
    next = without(next, type)
  } else if (type === 'hour' && hourCycle === 12) {
    next.hour = (value % 12) + (isPm(draft) ? 12 : 0)
    next = without(next, 'period')
  } else {
    next[type] = value
  }
  if (next.day !== undefined && next.month !== undefined) {
    next.day = Math.min(next.day, daysInMonth(next.year ?? 2024, next.month))
  }
  return next
}

interface Typed {
  type: SegmentType
  text: string
}

const SEPARATOR_KEYS = new Set(['/', '-', '.', ':', ',', ' '])

export interface DateSegmentsProps {
  pattern: SegmentPattern
  draft: Draft
  onDraftChange: (next: Draft) => void
  hourCycle: 12 | 24
  /** The locale's am and pm markers. */
  periodNames: [string, string]
  labels: SegmentLabels
  /** What an arrow key starts an empty part from (today, now). */
  reference: Draft
  /** Id of the first part, which the field label points at. */
  firstId?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  describedBy?: string
  onFocus?: (event: FocusEvent<HTMLElement>) => void
  onBlur?: (event: FocusEvent<HTMLElement>) => void
}

/** The parts and separators. The caller supplies the box and the `group` role around it. */
export const DateSegments = forwardRef<HTMLSpanElement, DateSegmentsProps>(function DateSegments(
  {
    pattern,
    draft,
    onDraftChange,
    hourCycle,
    periodNames,
    labels,
    reference,
    firstId,
    disabled = false,
    readOnly = false,
    invalid = false,
    required = false,
    describedBy,
    onFocus,
    onBlur,
  },
  ref,
) {
  // Digits typed into the focused part so far ("1" waiting for a second digit of the day).
  // Read through the ref in handlers: focusing the next part blurs this one synchronously,
  // before the state update lands.
  const [typed, setTypedState] = useState<Typed | null>(null)
  const typedRef = useRef<Typed | null>(null)
  const setTyped = (next: Typed | null) => {
    typedRef.current = next
    setTypedState(next)
  }
  const editable = !disabled && !readOnly
  const types = pattern.flatMap((part) => (part.type === 'literal' ? [] : [part.type]))

  const focusSibling = (from: HTMLElement, step: 1 | -1) => {
    const all = Array.from(
      from.parentElement?.querySelectorAll<HTMLElement>('[data-segment]') ?? [],
    )
    all[all.indexOf(from) + step]?.focus()
  }

  const set = (type: SegmentType, value: number | undefined) => {
    onDraftChange(withValue(draft, type, value, hourCycle))
  }

  const commitTyped = () => {
    const pending = typedRef.current
    if (!pending) return
    if (pending.type === 'year' && Number(pending.text) >= 1) set('year', Number(pending.text))
    setTyped(null)
  }

  const typeDigit = (type: SegmentType, digit: string, target: HTMLElement) => {
    const { min, max } = boundsOf(type, draft, hourCycle)
    const maxLength = type === 'year' ? 4 : 2
    const pending = typedRef.current
    let text = (pending?.type === type ? pending.text : '') + digit
    if (Number(text) > max || text.length > maxLength) text = digit
    const number = Number(text)
    const done = text.length >= maxLength || number * 10 > max
    if (type === 'year') {
      if (done) set(type, Math.max(number, min))
    } else if (number >= min) {
      set(type, number)
    }
    if (done && (type !== 'year' || number >= min)) {
      setTyped(null)
      focusSibling(target, 1)
    } else {
      setTyped({ type, text })
    }
  }

  const step = (type: SegmentType, delta: number) => {
    setTyped(null)
    const current = displayValue(type, draft, hourCycle)
    const { min, max } = boundsOf(type, draft, hourCycle)
    if (current === undefined) {
      set(type, displayValue(type, reference, hourCycle) ?? min)
      return
    }
    if (type === 'year') {
      set(type, Math.min(max, Math.max(min, current + delta)))
      return
    }
    const span = max - min + 1
    set(type, ((((current - min + delta) % span) + span) % span) + min)
  }

  const erase = (type: SegmentType, target: HTMLElement, key: string) => {
    const pending = typedRef.current
    if (pending?.type === type && pending.text.length > 1 && key === 'Backspace') {
      const text = pending.text.slice(0, -1)
      setTyped({ type, text })
      if (type !== 'year' && Number(text) >= boundsOf(type, draft, hourCycle).min)
        set(type, Number(text))
      return
    }
    if (displayValue(type, draft, hourCycle) !== undefined || pending?.type === type) {
      setTyped(null)
      set(type, undefined)
      return
    }
    if (key === 'Backspace') focusSibling(target, -1)
  }

  const typePeriod = (char: string) => {
    const lower = char.toLowerCase()
    const [am, pm] = periodNames.map((name) => name.toLowerCase())
    if (am?.startsWith(lower) && !pm?.startsWith(lower)) set('dayPeriod', 0)
    else if (pm?.startsWith(lower) && !am?.startsWith(lower)) set('dayPeriod', 1)
    else if (lower === 'a') set('dayPeriod', 0)
    else if (lower === 'p') set('dayPeriod', 1)
  }

  const handleKeyDown = (type: SegmentType, event: KeyboardEvent<HTMLElement>) => {
    const { key } = event
    const target = event.currentTarget
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault()
      commitTyped()
      focusSibling(target, key === 'ArrowRight' ? 1 : -1)
      return
    }
    if (key === 'Tab' || key === 'Escape') return
    if (key === 'Enter') {
      // Never a newline in the part; let a form listen for it on the way up.
      event.preventDefault()
      commitTyped()
      return
    }
    if (!editable) {
      if (key.length === 1) event.preventDefault()
      return
    }
    const { min, max } = boundsOf(type, draft, hourCycle)
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault()
        step(type, key === 'ArrowUp' ? 1 : -1)
        return
      case 'PageUp':
      case 'PageDown': {
        event.preventDefault()
        const big = type === 'year' ? 10 : type === 'minute' || type === 'second' ? 10 : 1
        step(type, key === 'PageUp' ? big : -big)
        return
      }
      case 'Home':
      case 'End':
        event.preventDefault()
        setTyped(null)
        set(type, key === 'Home' ? min : max)
        return
      case 'Backspace':
      case 'Delete':
        event.preventDefault()
        erase(type, target, key)
        return
    }
    if (key.length !== 1) return
    event.preventDefault()
    if (type === 'dayPeriod') {
      if (/\p{L}/u.test(key)) typePeriod(key)
      else if (SEPARATOR_KEYS.has(key)) focusSibling(target, 1)
      return
    }
    if (/^\d$/.test(key)) typeDigit(type, key, target)
    else if (SEPARATOR_KEYS.has(key) && displayValue(type, draft, hourCycle) !== undefined) {
      commitTyped()
      focusSibling(target, 1)
    }
  }

  // Touch keyboards send `beforeinput` without a usable keydown.
  const handleBeforeInput = (type: SegmentType, event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault()
    if (!editable) return
    const data = (event.nativeEvent as InputEvent).data ?? ''
    for (const char of data) {
      if (type === 'dayPeriod') typePeriod(char)
      else if (/\d/.test(char)) typeDigit(type, char, event.currentTarget)
    }
  }

  // Pasting "2026-10-15", "15/10/2026" or "14:30" fills every part it can.
  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault()
    if (!editable) return
    const text = event.clipboardData.getData('text')
    const numbers = (text.match(/\d+/g) ?? []).map(Number)
    if (numbers.length === 0) return
    const iso = /^\s*\d{4}-\d{1,2}-\d{1,2}/.test(text)
    const order = iso
      ? (['year', 'month', 'day', 'hour', 'minute', 'second'] as const).filter((t) =>
          types.includes(t),
        )
      : types.filter((t): t is SegmentField => t !== 'dayPeriod')
    const pastedTime = /\d:\d/.test(text)
    const start =
      !iso && pastedTime && !/\d[/.-]\d/.test(text) ? order.findIndex((t) => !DATE_TYPES.has(t)) : 0
    let next: Draft = { ...draft }
    order.slice(Math.max(start, 0)).forEach((type, index) => {
      const number = numbers[index]
      if (number === undefined) return
      const { min, max } = boundsOf(type, next, hourCycle)
      if (number >= min && number <= max) next = withValue(next, type, number, hourCycle)
    })
    if (types.includes('dayPeriod')) {
      if (/p\.?\s*m/i.test(text)) next = withValue(next, 'dayPeriod', 1, hourCycle)
      else if (/a\.?\s*m/i.test(text)) next = withValue(next, 'dayPeriod', 0, hourCycle)
    }
    setTyped(null)
    onDraftChange(next)
  }

  const textOf = (type: SegmentType): { text: string; empty: boolean } => {
    if (typed?.type === type) return { text: typed.text, empty: false }
    const value = displayValue(type, draft, hourCycle)
    if (value === undefined) {
      const placeholder = type === 'dayPeriod' ? periodNames[0] : labels[`${type}Placeholder`]
      return { text: placeholder, empty: true }
    }
    if (type === 'dayPeriod') return { text: periodNames[value] ?? '', empty: false }
    if (type === 'year') return { text: pad(value, 4), empty: false }
    return { text: pad(value), empty: false }
  }

  const firstIndex = pattern.findIndex((part) => part.type !== 'literal')
  return (
    <span ref={ref} className={styles.segments}>
      {pattern.map((part, index) => {
        if (part.type === 'literal') {
          return (
            <span key={index} className={styles.literal} aria-hidden="true">
              {part.value}
            </span>
          )
        }
        const type = part.type
        const { text, empty } = textOf(type)
        const value = displayValue(type, draft, hourCycle)
        const { min, max } = boundsOf(type, draft, hourCycle)
        const valueText =
          value === undefined
            ? labels.empty
            : type === 'dayPeriod'
              ? (periodNames[value] ?? '')
              : String(value)
        return (
          // A disabled part leaves the tab order, as a disabled native input does.
          // eslint-disable-next-line jsx-a11y/interactive-supports-focus
          <span
            key={index}
            id={index === firstIndex ? firstId : undefined}
            role="spinbutton"
            className={styles.segment}
            data-segment={type}
            data-placeholder={empty || undefined}
            tabIndex={disabled ? undefined : 0}
            contentEditable={editable}
            suppressContentEditableWarning
            inputMode={type === 'dayPeriod' ? 'text' : 'numeric'}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            enterKeyHint="next"
            aria-label={labels[type]}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={valueText}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-readonly={readOnly || undefined}
            aria-disabled={disabled || undefined}
            aria-describedby={describedBy}
            onKeyDown={(event) => {
              handleKeyDown(type, event)
            }}
            onBeforeInput={(event) => {
              handleBeforeInput(type, event)
            }}
            onPaste={handlePaste}
            onFocus={onFocus}
            onBlur={(event) => {
              commitTyped()
              onBlur?.(event)
            }}
          >
            {text}
          </span>
        )
      })}
    </span>
  )
})
