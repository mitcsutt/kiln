import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import styles from './BottomNav.module.css'

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  /** Names the landmark. Default "Main". */
  label?: string
  /**
   * Hide at and above this breakpoint, where a top nav takes over. Default `md`.
   * `false` keeps it at every width. Inside `AppShell.BottomBar`, use the shell's
   * `navBreakpoint` (default `lg`) so the bar and the nav leave together, and give the
   * desktop nav the matching `hideBelow`.
   */
  hideAbove?: 'md' | 'lg' | false
  /** `fixed` (default) pins it to the viewport bottom; `static` leaves it in flow. */
  position?: 'fixed' | 'static'
}

const BottomNavRoot = forwardRef<HTMLElement, BottomNavProps>(function BottomNav(
  { label = 'Main', hideAbove = 'md', position = 'fixed', className, children, ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cx(styles.nav, className)}
      data-hide-above={hideAbove || undefined}
      data-position={position}
      {...rest}
    >
      <ul className={styles.list} role="list">
        {children}
      </ul>
    </nav>
  )
})

export interface BottomNavItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  icon: ReactNode
  /** Always visible — icon-only tab bars are guesswork. Keep it to one short word. */
  label: string
  active?: boolean
  /**
   * `true` for an unread dot; a number for a count (shown as 99+ above 99). The count is
   * announced after the label.
   */
  badge?: boolean | number
  /** Render the single child (e.g. a router `<Link>`) as the item. */
  asChild?: boolean
  children?: ReactNode
}

const BottomNavItem = forwardRef<HTMLAnchorElement, BottomNavItemProps>(function BottomNavItem(
  { icon, label, active = false, badge, asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'a'
  const count = typeof badge === 'number' && badge > 0 ? badge : undefined
  return (
    <li className={styles.item}>
      <Comp
        ref={ref}
        className={cx(styles.link, className)}
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
        {...rest}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>{icon}</span>
          {count !== undefined ? (
            <span className={styles.badge} data-kind="count">
              {count > 99 ? '99+' : count}
            </span>
          ) : badge === true ? (
            <span className={styles.badge} data-kind="dot" />
          ) : null}
        </span>
        <span className={styles.label}>{label}</span>
        {count !== undefined ? (
          <span className={styles.srOnly}>{`, ${String(count)} new`}</span>
        ) : null}
        {badge === true ? <span className={styles.srOnly}>, new</span> : null}
        <Slot.Slottable>{children}</Slot.Slottable>
      </Comp>
    </li>
  )
})

/**
 * Mobile tab bar: 3–5 destinations, icon over label, pinned to the bottom with the
 * safe-area inset. Hidden from `md` up by default, where `NavLinks` takes over.
 * Pair the breakpoints: `<BottomNav hideAbove="md">` with `<NavLinks hideBelow="md">`.
 *
 * <BottomNav>
 *   <BottomNav.Item asChild icon={<TableIcon />} label="Table" active>
 *     <Link to="/standings" />
 *   </BottomNav.Item>
 * </BottomNav>
 */
export const BottomNav = Object.assign(BottomNavRoot, { Item: BottomNavItem })
