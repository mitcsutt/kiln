import {
  createContext,
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { space, type Space } from '#utils/tokens'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import styles from './NavLinks.module.css'

export type NavLinksOrientation = 'horizontal' | 'vertical'
export type NavLinksSize = 'sm' | 'md'

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
  /** `md` (default) for page headers; `sm` for dense toolbars, footers and sub-navs. */
  size?: NavLinksSize
}

interface NavLinksContextValue {
  orientation: NavLinksOrientation
  size: NavLinksSize
}

const NavLinksContext = createContext<NavLinksContextValue>({
  orientation: 'horizontal',
  size: 'md',
})

const NavLinksRoot = forwardRef<HTMLElement, NavLinksProps>(function NavLinks(
  {
    label = 'Main',
    orientation = 'horizontal',
    gap,
    size = 'md',
    hideBelow,
    hideAbove,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <NavLinksContext.Provider value={{ orientation, size }}>
      <nav
        ref={ref}
        aria-label={label}
        className={cx(styles.nav, visibilityClass({ hideBelow, hideAbove }), className)}
        data-orientation={orientation}
        data-size={size}
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
}

/**
 * One link. For router links: `<NavLinks.Item asChild active={isActive}><Link to="/work">Work</Link></NavLinks.Item>`.
 * `hideBelow`/`hideAbove` hide the whole list item (e.g. a secondary link on phones).
 */
const NavLinksItem = forwardRef<HTMLAnchorElement, NavLinksItemProps>(function NavLinksItem(
  { active = false, asChild = false, hideBelow, hideAbove, className, ...rest },
  ref,
) {
  const { orientation, size } = useContext(NavLinksContext)
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <li className={cx(styles.item, visibilityClass({ hideBelow, hideAbove }))}>
      <Comp
        ref={ref}
        className={cx(styles.link, className)}
        data-orientation={orientation}
        data-size={size}
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
        {...rest}
      />
    </li>
  )
})

/**
 * Site / app navigation: a labelled `<nav>` with a list of links. The current page is
 * marked with a short accent bar under the label (horizontal) or an accent dot beside
 * it (vertical) — a mark, not a glowing pill.
 */
export const NavLinks = Object.assign(NavLinksRoot, { Item: NavLinksItem })
