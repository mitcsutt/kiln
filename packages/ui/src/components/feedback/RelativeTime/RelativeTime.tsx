import { forwardRef, useEffect, useState, type ReactNode, type TimeHTMLAttributes } from 'react'
import { formatAbsoluteTime, formatRelativeTime, toDate, type RelativeTimeStyle } from './format'
import styles from './RelativeTime.module.css'

export interface RelativeTimeProps extends Omit<
  TimeHTMLAttributes<HTMLTimeElement>,
  'dateTime' | 'children' | 'prefix'
> {
  /** The moment to describe. Anything `new Date()` accepts. */
  date: Date | string | number
  /** BCP 47 locale. Default `en-AU`. */
  locale?: string
  /** Wording length: "3 minutes ago" (`long`), "3 mins ago" (`short`, default), `narrow`. */
  format?: RelativeTimeStyle
  /** Re-render every N ms so the text stays true. `0` disables. Default 30 000. */
  updateInterval?: number
  /** Text before the time, e.g. "Updated". A space is added for you. */
  prefix?: ReactNode
}

/**
 * A `<time>` that says how long ago (or until) something happened, and keeps itself current.
 *
 * SSR: the server and the first client render show the absolute date (no clock is read
 * during render, so hydration can't disagree about "now"); the relative wording appears
 * once mounted. The absolute date stays available as the `title`.
 *
 * <RelativeTime date={fetchedAt} prefix="Updated" />
 */
export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(function RelativeTime(
  {
    date,
    locale = 'en-AU',
    format = 'short',
    updateInterval = 30_000,
    prefix,
    title,
    className,
    ...rest
  },
  ref,
) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    if (!updateInterval) return
    const id = setInterval(() => {
      setNow(Date.now())
    }, updateInterval)
    return () => {
      clearInterval(id)
    }
  }, [updateInterval])

  const d = toDate(date)
  const valid = !Number.isNaN(d.getTime())
  const absolute = valid ? formatAbsoluteTime(d, locale) : ''
  const text = !valid ? '' : now === null ? absolute : formatRelativeTime(d, now, locale, format)

  return (
    <time
      ref={ref}
      dateTime={valid ? d.toISOString() : undefined}
      title={title ?? absolute}
      className={className}
      suppressHydrationWarning
      {...rest}
    >
      {prefix ? <span className={styles.prefix}>{prefix} </span> : null}
      {/* Server renders the absolute date in its timezone; the client re-renders relative text on mount. */}
      <span className={styles.value} suppressHydrationWarning>
        {text}
      </span>
    </time>
  )
})
