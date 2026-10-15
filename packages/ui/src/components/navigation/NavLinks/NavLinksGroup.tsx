import {
  cloneElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { visibilityClass, type VisibilityProps } from '#utils/visibility'
import { ChevronDownIcon } from '#icons'
import { Collapse } from '#components/layout/Collapse'
import { Popover } from '#components/overlays/Popover'
import { useLatest } from '#components/inputs/internal/useLatest'
import {
  NavLinksContext,
  NavLinksGroupContext,
  holdsActive,
  type NavLinksGroupContextValue,
} from './context'
import styles from './NavLinks.module.css'

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export interface NavLinksGroupProps
  extends Omit<HTMLAttributes<HTMLLIElement>, 'children'>, VisibilityProps {
  /** The group's name: "Settings", "Reports". */
  label: ReactNode
  /** The group's links, `NavLinks.Item`s, and further groups. */
  children: ReactNode
  /** A glyph before the label. Decorative: the label names the group. */
  icon?: ReactNode
  /** A count or status after the label, such as a `Badge` or a `StatusDot`. */
  trailing?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /**
   * Uncontrolled initial state. Default: open when the group holds the current page. An
   * uncontrolled group also opens when the current page moves into it.
   */
  defaultOpen?: boolean
  /** Runs when the group's toggle asks to open or close. */
  onOpenChange?: (open: boolean) => void
  /**
   * Makes the label a link to the group's own page (a section's landing page), with a separate
   * button beside it to open and close the group.
   */
  href?: string
  /**
   * Like `href`, for a router: the link element to render the label as, such as
   * `<Link to="/settings" />`. The label becomes its content.
   */
  link?: ReactElement
  /** The group's own page (`href` or `link`) is the current page. */
  active?: boolean
  /**
   * Accessible name of the open-and-close button beside a linked label. Default: the label's own
   * text.
   */
  toggleLabel?: string
}

function Chevron() {
  return <ChevronDownIcon className={styles.chevron} aria-hidden />
}

/**
 * A group of links in a `NavLinks`: a section with child pages.
 *
 * @privateRemarks
 * Vertical: a disclosure button and a nested list in a Collapse (the disclosure-navigation
 * pattern, not a tree role, so links stay links). Horizontal: the same button opens a Popover with
 * the links listed vertically inside. Not DropdownMenu: ARIA menus are for commands and drop link
 * semantics such as aria-current.
 */
export const NavLinksGroup = forwardRef<HTMLLIElement, NavLinksGroupProps>(function NavLinksGroup(
  {
    label,
    children,
    icon,
    trailing,
    open: openProp,
    defaultOpen,
    onOpenChange,
    href,
    link,
    active = false,
    toggleLabel,
    hideBelow,
    hideAbove,
    className,
    ...rest
  },
  ref,
) {
  const { orientation, size } = useContext(NavLinksContext)
  const parent = useContext(NavLinksGroupContext)
  const id = useId()
  const labelId = `${id}-label`
  const panelId = `${id}-panel`

  // Which descendants have said they're the current page (see NavLinks.Item).
  const [reported, setReported] = useState<string[]>([])
  const report = useCallback((child: string, isActive: boolean) => {
    setReported((prev) =>
      isActive
        ? prev.includes(child)
          ? prev
          : [...prev, child]
        : prev.includes(child)
          ? prev.filter((entry) => entry !== child)
          : prev,
    )
  }, [])
  const groupContext = useMemo<NavLinksGroupContextValue>(() => ({ report }), [report])
  const containsActive = reported.length > 0 || holdsActive(children)

  // Tell the groups around this one, so a closed parent can show it holds the current page.
  useIsomorphicLayoutEffect(() => {
    if (!parent) return
    parent.report(id, active || containsActive)
    return () => {
      parent.report(id, false)
    }
  }, [parent, id, active, containsActive])

  const vertical = orientation === 'vertical'
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? (vertical && containsActive))
  // An uncontrolled vertical group opens when the current page moves into it.
  const [held, setHeld] = useState(containsActive)
  if (held !== containsActive) {
    setHeld(containsActive)
    if (containsActive && vertical && openProp === undefined) setUncontrolled(true)
  }
  const open = openProp ?? uncontrolled
  const change = useLatest(onOpenChange)
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next)
      change.current?.(next)
    },
    [openProp, change],
  )

  const linked = href !== undefined || link !== undefined
  const shared = {
    'data-orientation': orientation,
    'data-size': size,
  }
  const labelContent = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {trailing !== undefined ? <span className={styles.trailing}>{trailing}</span> : null}
    </>
  )
  const linkElement = linked ? (
    <Slot.Root
      id={labelId}
      className={styles.link}
      {...shared}
      data-active={active || undefined}
      data-contains-active={containsActive || undefined}
      data-state={open ? 'open' : 'closed'}
      aria-current={active ? 'page' : undefined}
    >
      {link ? cloneElement(link, undefined, labelContent) : <a href={href}>{labelContent}</a>}
    </Slot.Root>
  ) : null
  const toggleState = {
    'aria-expanded': open,
    'data-state': open ? 'open' : 'closed',
    'data-contains-active': containsActive || undefined,
  }

  const item = cx(styles.item, styles.group, visibilityClass({ hideBelow, hideAbove }), className)

  if (!vertical) {
    return (
      <li ref={ref} className={item} data-navlinks-group="" {...rest}>
        <Popover open={open} onOpenChange={setOpen}>
          {linked ? (
            <span className={styles.groupRow} data-navlinks-row="">
              {linkElement}
              <Popover.Trigger
                className={styles.toggle}
                {...shared}
                {...toggleState}
                aria-label={toggleLabel}
                aria-labelledby={toggleLabel ? undefined : labelId}
              >
                <Chevron />
              </Popover.Trigger>
            </span>
          ) : (
            <Popover.Trigger
              id={labelId}
              className={cx(styles.link, styles.groupButton)}
              {...shared}
              {...toggleState}
            >
              {labelContent}
              <Chevron />
            </Popover.Trigger>
          )}
          <Popover.Content
            align="start"
            className={styles.flyout}
            aria-labelledby={labelId}
            onClick={(event) => {
              // Following a link closes the flyout, even when the router keeps the page.
              if ((event.target as Element).closest('a')) setOpen(false)
            }}
          >
            <NavLinksContext.Provider value={{ orientation: 'vertical', size }}>
              <NavLinksGroupContext.Provider value={groupContext}>
                <ul className={styles.sublist} role="list" data-flyout="">
                  {children}
                </ul>
              </NavLinksGroupContext.Provider>
            </NavLinksContext.Provider>
          </Popover.Content>
        </Popover>
      </li>
    )
  }

  const toggle = () => {
    setOpen(!open)
  }

  return (
    <li ref={ref} className={item} data-navlinks-group="" {...rest}>
      {linked ? (
        <span className={styles.groupRow} data-navlinks-row="">
          {linkElement}
          <button
            type="button"
            className={styles.toggle}
            {...shared}
            {...toggleState}
            aria-controls={panelId}
            aria-label={toggleLabel}
            aria-labelledby={toggleLabel ? undefined : labelId}
            onClick={toggle}
          >
            <Chevron />
          </button>
        </span>
      ) : (
        <button
          type="button"
          id={labelId}
          className={cx(styles.link, styles.groupButton)}
          {...shared}
          {...toggleState}
          aria-controls={panelId}
          onClick={toggle}
        >
          {labelContent}
          <Chevron />
        </button>
      )}
      <Collapse open={open} id={panelId} data-navlinks-panel="">
        <NavLinksGroupContext.Provider value={groupContext}>
          <ul className={styles.sublist} role="list">
            {children}
          </ul>
        </NavLinksGroupContext.Provider>
      </Collapse>
    </li>
  )
})
