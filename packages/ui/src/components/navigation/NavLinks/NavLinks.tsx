import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
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
  type TreeKeyDown,
} from './context'
import styles from './NavLinks.module.css'

export type { NavLinksOrientation, NavLinksSize } from './context'

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export interface NavLinksProps extends HTMLAttributes<HTMLElement>, VisibilityProps {
  /** Names the landmark. Required when a page has more than one nav. Default "Main". */
  label?: string
  /** `horizontal` (default) for headers; `vertical` for sidebars and footers. */
  orientation?: NavLinksOrientation
  /**
   * Space between links, as a step on the space scale. Default `5` horizontal, and a 2px
   * hairline vertical (vertical items are already a full control tall).
   */
  gap?: Space
  /**
   * `md` (default), body-size labels for page headers; `sm`, one step smaller, for sidebars,
   * dense toolbars, footers and sub-navs. Neither drops to the caption steps.
   */
  size?: NavLinksSize
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
  // The arrow keys of a nav with groups. Its groups set the handler, so a flat nav doesn't carry
  // the code.
  const treeKeysRef = useRef<TreeKeyDown | null>(null)
  return (
    <NavLinksContext.Provider value={{ orientation, size, treeKeysRef }}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow keys pressed on the links and group buttons inside bubble here; the nav itself is never focused */}
      <nav
        ref={ref}
        aria-label={label}
        className={cx(styles.nav, visibilityClass({ hideBelow, hideAbove }), className)}
        data-orientation={orientation}
        data-size={size}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented && orientation === 'vertical') treeKeysRef.current?.(event)
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
 * under the label (horizontal), or with a soft accent fill across its row and a dot beside the
 * label (vertical), and gets `aria-current="page"`. In a vertical nav every link is a full-width
 * row, so the pointer, the current page and the keyboard focus ring all sit inside the sidebar.
 * These docs' header and sidebar are `NavLinks`.
 *
 * ## Groups
 *
 * `NavLinksGroup` nests links under a section, and groups nest inside groups. In a vertical nav a
 * top-level group is one of the app's sections: its label is set in the heading face a step above
 * the links, it's ruled off from the section before it, and its button opens its links below it. A
 * link at the top level beside groups (an Overview, say) is set the same way, so it lines up. A
 * group nested inside another opens its links indented on a guide rule. In a horizontal nav a
 * group opens its links in a panel under the button, so a top bar gets one level of nesting. It's a
 * separate import, so a nav without groups doesn't load the panel and animation code they use.
 *
 * A group that holds the current page opens by itself and shows a ring while it's closed, and the
 * current link keeps `aria-current="page"`. Give a group `href` (or a router `link`) when the
 * section has a landing page of its own: the label becomes a link, with a separate button to open
 * and close it. Items and groups take an `icon` and a `trailing` count or status. Links under a
 * section share one size at every depth, and no label drops to the caption steps.
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
 * it did before groups existed and ignores arrow keys. NavLinksGroup isn't attached as
 * `NavLinks.Group`: `Object.assign` keeps every part in the bundle, and a group brings Popover and
 * Collapse, so a flat nav would pay for them (ADR 0044).
 */
export const NavLinks = Object.assign(NavLinksRoot, { Item: NavLinksItem })
