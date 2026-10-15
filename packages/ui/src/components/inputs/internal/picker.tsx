import type { FocusEvent, PointerEvent, RefObject } from 'react'
import type { CalendarLabels } from '#components/inputs/Calendar'
import { DEFAULT_SEGMENT_LABELS, type SegmentLabels } from './DateSegments'

/**
 * Every word the date and time controls say, for another language or wording. Each control
 * reads the ones it uses.
 */
export interface DateTimeLabels extends SegmentLabels, CalendarLabels {
  /** The calendar button and the panel it opens. Default `'Choose date'`. */
  openCalendar: string
  /** The clear button. Default `'Clear'`. */
  clear: string
  /** The time inside a date-time calendar. Default `'Time'`. */
  time: string
  /** The start's time inside a range calendar. Default `'Start time'`. */
  startTime: string
  /** The end's time inside a range calendar. Default `'End time'`. */
  endTime: string
  /** The list of preset ranges. Default `'Presets'`. */
  presets: string
}

export const DEFAULT_DATE_TIME_LABELS: DateTimeLabels = {
  ...DEFAULT_SEGMENT_LABELS,
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  openCalendar: 'Choose date',
  clear: 'Clear',
  time: 'Time',
  startTime: 'Start time',
  endTime: 'End time',
  presets: 'Presets',
}

/** Focus the first empty part (or the first part) inside `root`. */
export function focusSegment(root: HTMLElement | null, which: 'empty' | 'first' = 'empty') {
  const segments = Array.from(root?.querySelectorAll<HTMLElement>('[data-segment]') ?? [])
  const target =
    which === 'empty' ? (segments.find((s) => s.dataset.placeholder !== undefined) ?? null) : null
  ;(target ?? segments[0])?.focus()
}

/**
 * Clicking the box's padding or a separator focuses a part, like one native control. Events
 * from the portalled calendar bubble here through React, so only the box's own DOM counts.
 */
export function handleBoxPointerDown(event: PointerEvent<HTMLElement>) {
  const root = event.currentTarget
  const target = event.target as HTMLElement
  if (!root.contains(target)) return
  if (target.closest('[data-segment], button, a, input')) return
  if (root.querySelector('[data-segment]')?.getAttribute('aria-disabled') === 'true') return
  event.preventDefault()
  focusSegment(root)
}

/** Whether focus is leaving the whole control: the box and, when open, its calendar panel. */
export function isLeaving(
  event: FocusEvent<HTMLElement>,
  ...parts: RefObject<HTMLElement | null>[]
): boolean {
  const next = event.relatedTarget
  if (!(next instanceof Node)) return true
  return !parts.some((part) => part.current?.contains(next))
}
