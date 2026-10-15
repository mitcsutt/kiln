import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { space, type Space } from '#utils/tokens'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import {
  NavLinksContext,
  NavLinksGroupContext,
  type NavLinksOrientation,
  type NavLinksSize,
} from './context'
import { NavLinksGroup } from './NavLinksGroup'
import styles from './NavLinks.module.css'

export type { NavLinksOrientation, NavLinksSize } from './context'

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export interface NavLinksProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Names the landmark. Required when a page has more than one nav. Default "Main". */
  label?: string
  /** `horizontal` (default) for headers; `vertical` for sidebars and footers. */
  orientation?: NavLinksOrientation
  /**
   * Space between links, as a step on the space scale. Default `5` horizontal, `0`
   * vertical (vertical items are already a full control tall).
   */
  gap?: Space
  /**
   * `md` (default), body-size labels for page headers; `sm`, one step smaller, for sidebars,
   * dense toolbars, footers and sub-navs. Neither drops to the caption steps.
   */
  size?: NavLinksSize
}

/** The links and group buttons a reader can reach now: not inside a closed group. */
function reachable(nav: HTMLElement): HTMLElement[] {
  return Array.from(nav.querySelectorAll<HTMLElement>('a[href], button')).filter(
    (element) =>
      !element.closest('[data-navlinks-panel][data-state="closed"]') &&
      !(element as HTMLButtonElement).disabled,
  )
}

/** A group's own row: the button, or the link and its toggle. */
function rowOf(group: Element | null | undefined): HTMLElement | null {
  return (
    group?.querySelector<HTMLElement>(':scope > [data-navlinks-row], :scope > [aria-expanded]') ??
    null
  )
}

/** The element in a group's row that opens and closes it. */
function toggleOf(group: Element | null | undefined): HTMLElement | null {
  const row = rowOf(group)
  return row?.hasAttribute('aria-expanded')
    ? row
    : (row?.querySelector<HTMLElement>('[aria-expanded]') ?? null)
}

/**
 * Arrow keys for a vertical nav with groups, like a tree: Up and Down move between the links you
 * can see, Right opens a group (or steps into an open one), Left closes it (or steps out to its
 * parent), Home and End jump, and a letter jumps to the next link starting with it. Tab still
 * moves through every link, so nothing is lost for anyone who doesn't use them.
 */
function onTreeKeyDown(event: KeyboardEvent<HTMLElement>) {
  const nav = event.currentTarget
  if (!nav.querySelector('[data-navlinks-group]')) return
  const items = reachable(nav)
  const current = event.target as HTMLElement
  const index = items.indexOf(current)
  if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return

  const focus = (element: HTMLElement | null | undefined) => {
    if (!element) return
    event.preventDefault()
    element.focus()
  }
  const group = current.closest('[data-navlinks-group]')
  const row = rowOf(group)
  const inRow = row?.contains(current) === true
  const toggle = inRow ? toggleOf(group) : null

  switch (event.key) {
    case 'ArrowDown':
      focus(items[index + 1])
      return
    case 'ArrowUp':
      focus(items[index - 1])
      return
    case 'Home':
      focus(items[0])
      return
    case 'End':
      focus(items.at(-1))
      return
    case 'ArrowRight':
      if (!toggle) return
      event.preventDefault()
      if (toggle.getAttribute('aria-expanded') === 'false') toggle.click()
      else
        focus(items.find((item, at) => at > index && group?.contains(item) && !row?.contains(item)))
      return
    case 'ArrowLeft': {
      if (toggle?.getAttribute('aria-expanded') === 'true') {
        event.preventDefault()
        toggle.click()
        return
      }
      const owner = inRow ? group?.parentElement?.closest('[data-navlinks-group]') : group
      const ownerRow = rowOf(owner)
      focus(ownerRow?.querySelector<HTMLElement>('a[href]') ?? ownerRow)
      return
    }
    default:
      if (event.key.length !== 1 || event.key === ' ') return
      {
        const key = event.key.toLowerCase()
        const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
        focus(ordered.find((item) => item.textContent.trim().toLowerCase().startsWith(key)))
      }
  }
}

const NavLinksRoot = forwardRef<HTMLElement, NavLinksProps>(function NavLinks(
  {
    label = 'Main',
    orientation = 'horizontal',
    gap,
    size = 'md',
    hideBelow,
    hideAbove,
    className,
    onKeyDown,
    children,
    ...rest
  },
  ref,
) {
  return (
    <NavLinksContext.Provider value={{ orientation, size }}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow keys pressed on the links and group buttons inside bubble here; the nav itself is never focused */}
      <nav
        ref={ref}
        aria-label={label}
        className={cx(styles.nav, visibilityClass({ hideBelow, hideAbove }), className)}
        data-orientation={orientation}
        data-size={size}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented && orientation === 'vertical') onTreeKeyDown(event)
        }}
        {...rest}
      >
        <ul
          className={styles.list}
          role="list"
          style={gap === undefined ? undefined : ({ '--_gap': space(gap) } as CSSProperties)}
        >
          {children}
        </ul>
      </nav>
    </NavLinksContext.Provider>
  )
})

export interface NavLinksItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, VisibilityProps {
  /** The current page. Sets `aria-current="page"` and draws the marker. */
  active?: boolean
  /** Render the single child (e.g. a router `<Link>`) instead of an `<a>`. */
  asChild?: boolean
  /** A glyph before the label. Decorative: the label names the link. */
  icon?: ReactNode
  /** A count or status after the label, such as a `Badge` or a `StatusDot`. */
  trailing?: ReactNode
}

/**
 * One link. For router links: `<NavLinks.Item asChild active={isActive}><Link to="/work">Work</Link></NavLinks.Item>`.
 * `hideBelow`/`hideAbove` hide the whole list item (e.g. a secondary link on phones).
 */
const NavLinksItem = forwardRef<HTMLAnchorElement, NavLinksItemProps>(function NavLinksItem(
  {
    active = false,
    asChild = false,
    icon,
    trailing,
    hideBelow,
    hideAbove,
    className,
    children,
    ...rest
  },
  ref,
) {
  const { orientation, size } = useContext(NavLinksContext)
  const group = useContext(NavLinksGroupContext)
  const id = useId()
  // Inside a group, say whether this is the current page, so the group can show it holds it.
  useIsomorphicLayoutEffect(() => {
    if (!group) return
    group.report(id, active)
    return () => {
      group.report(id, false)
    }
  }, [group, id, active])

  const Comp = asChild ? Slot.Root : 'a'
  const link = {
    ref,
    className: cx(styles.link, className),
    'data-orientation': orientation,
    'data-size': size,
    'data-active': active || undefined,
    'aria-current': active ? ('page' as const) : undefined,
    ...rest,
  }
  return (
    <li className={cx(styles.item, visibilityClass({ hideBelow, hideAbove }))}>
      {icon === undefined && trailing === undefined ? (
        <Comp {...link}>{children}</Comp>
      ) : (
        // Separate children, not a fragment: with asChild, Slot finds the Slottable among them.
        <Comp {...link}>
          {icon !== undefined ? (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
          {trailing !== undefined ? <span className={styles.trailing}>{trailing}</span> : null}
        </Comp>
      )}
    </li>
  )
})

/**
 * A labelled navigation landmark with a list of links. Horizontal for headers, vertical for
 * sidebars.
 *
 * @remarks
 * `NavLinks` is a `<nav>` with a list of links. The current page is marked with a short accent bar
 * under the label (horizontal) or an accent dot beside it (vertical), and gets
 * `aria-current="page"`. These docs' header and sidebar are `NavLinks`.
 *
 * ## Groups
 *
 * `NavLinks.Group` nests links under a section, and groups nest inside groups. In a vertical nav a
 * group is a button that opens its links below it, indented on a guide rule; in a horizontal nav
 * it opens them in a panel under the button, so a top bar gets one level of nesting.
 *
 * A group that holds the current page opens by itself and shows a ring while it's closed, and the
 * current link keeps `aria-current="page"`. Give a group `href` (or a router `link`) when the
 * section has a landing page of its own: the label becomes a link, with a separate button to open
 * and close it. Items and groups take an `icon` and a `trailing` count or status. Labels stay at
 * body size at every depth.
 *
 * With groups in a vertical nav, the arrow keys work as in a tree: Up and Down move between the
 * visible links, Right opens a group and Left closes it or steps out to its parent, Home and End
 * jump to either end, and typing a letter jumps to the next link starting with it. Tab still
 * reaches every link.
 *
 * `BottomNav` stays flat: a phone's tab bar has room for four or five destinations and nothing
 * under them.
 *
 * @privateRemarks
 * Site / app navigation: a labelled `<nav>` with a list of links. The current page is
 * marked with a short accent bar under the label (horizontal) or an accent dot beside
 * it (vertical) — a mark, not a glowing pill. A flat NavLinks (no groups) renders exactly what
 * it did before groups existed and ignores arrow keys.
 */
export const NavLinks = Object.assign(NavLinksRoot, { Item: NavLinksItem, Group: NavLinksGroup })
