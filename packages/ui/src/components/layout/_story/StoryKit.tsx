/*
 * Story-only typography and placeholders for the layout stories. Not exported from
 * the package — the real Heading/Text/Numeral live in the typography group. This
 * keeps layout stories free of inline style soup while those components are built.
 */
import { createElement, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import styles from './StoryKit.module.css'
import { headingTag } from '#utils/heading'

type Level = 1 | 2 | 3 | 4

export function Title({
  level = 2,
  size = 'lg',
  children,
  className,
  ...rest
}: { level?: Level; size?: 'display' | 'xl' | 'lg' | 'md' } & HTMLAttributes<HTMLHeadingElement>) {
  return createElement(
    headingTag(level),
    { className: cx(styles.title, className), 'data-size': size, ...rest },
    children,
  )
}

export function Body({
  tone = 'default',
  size = 'md',
  children,
  className,
  ...rest
}: {
  tone?: 'default' | 'muted' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
} & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx(styles.body, className)} data-tone={tone} data-size={size} {...rest}>
      {children}
    </p>
  )
}

/** Tabular figure: money, percentages, counts. */
export function Figure({
  size = 'md',
  tone = 'default',
  children,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'default' | 'muted' | 'accent' | 'critical' | 'positive'
  children: ReactNode
}) {
  return (
    <span className={styles.figure} data-size={size} data-tone={tone}>
      {children}
    </span>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <span className={styles.label}>{children}</span>
}

export function NavLink({ children, current = false }: { children: ReactNode; current?: boolean }) {
  return (
    <a href="#story-nav" className={styles.navLink} aria-current={current ? 'page' : undefined}>
      {children}
    </a>
  )
}

export function Wordmark({ children }: { children: ReactNode }) {
  return <span className={styles.wordmark}>{children}</span>
}

/** A labelled tile for showing grid cells. Sunken fill, no border — not a card. */
export function Cell({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  return (
    <div className={styles.cell} data-tall={tall || undefined}>
      {children}
    </div>
  )
}

/** A bar meter for usage stories: `value` of `max`. */
export function Bar({
  value,
  max,
  tone = 'accent',
}: {
  value: number
  max: number
  tone?: 'accent' | 'critical'
}) {
  return (
    <span className={styles.bar} data-tone={tone}>
      <span
        className={styles.barFill}
        style={{ inlineSize: `${String(Math.min(100, (value / max) * 100))}%` }}
      />
    </span>
  )
}

/** A line drawing that stands in for media in stories: a task board, a screen, or a chart. */
export function Artwork({ kind, label }: { kind: 'board' | 'screen' | 'chart'; label: string }) {
  return (
    <svg
      className={styles.artwork}
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <rect x="0" y="0" width="160" height="100" className={styles.artworkGround} />
      {kind === 'board' ? (
        <g className={styles.artworkLine}>
          <rect x="14" y="14" width="40" height="72" rx="3" />
          <rect x="60" y="14" width="40" height="72" rx="3" />
          <rect x="106" y="14" width="40" height="72" rx="3" />
          <rect x="20" y="22" width="28" height="12" rx="2" className={styles.artworkStrong} />
          <rect x="20" y="40" width="28" height="12" rx="2" />
          <rect x="66" y="22" width="28" height="12" rx="2" />
          <rect x="112" y="22" width="28" height="12" rx="2" className={styles.artworkAccent} />
          <circle cx="44" cy="28" r="1.2" className={styles.artworkDot} />
        </g>
      ) : kind === 'screen' ? (
        <g className={styles.artworkLine}>
          <rect x="16" y="14" width="128" height="72" rx="3" />
          <line x1="16" y1="26" x2="144" y2="26" />
          <line x1="26" y1="38" x2="74" y2="38" className={styles.artworkStrong} />
          <line x1="26" y1="48" x2="104" y2="48" />
          <line x1="26" y1="56" x2="96" y2="56" />
          <rect x="26" y="66" width="24" height="8" rx="4" className={styles.artworkAccent} />
        </g>
      ) : (
        <g className={styles.artworkLine}>
          <line x1="16" y1="84" x2="144" y2="84" />
          <polyline
            points="16,70 36,62 56,66 76,48 96,52 116,34 144,28"
            className={styles.artworkStrong}
          />
          <circle cx="144" cy="28" r="2.5" className={styles.artworkAccent} />
        </g>
      )}
    </svg>
  )
}
