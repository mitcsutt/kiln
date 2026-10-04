import { createContext, forwardRef, useContext, useId, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import { VisuallyHidden } from '#components/layout/VisuallyHidden'
import styles from './AppShell.module.css'

const ShellContext = createContext<{ mainId: string } | null>(null)

export type AppShellNavBreakpoint = 'md' | 'lg'

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Text of the skip link rendered before everything else. Default "Skip to content". */
  skipLinkLabel?: string
  /**
   * Where navigation hands over from phone to desktop: from this breakpoint up the
   * `Sidebar` appears and the `BottomBar` is removed, so there is never a width with
   * neither. `md` (48em) or `lg` (64em, default). Pair it with the same value on
   * `BottomNav hideAbove` and header `NavLinks hideBelow`.
   */
  navBreakpoint?: AppShellNavBreakpoint
  /** Id given to `AppShell.Main` (the skip link target). Generated when omitted. */
  mainId?: string
}

/**
 * The frame of an app screen: header, optional sidebar, main, footer, and a
 * mobile-only bottom bar. Slots place themselves; order in JSX doesn't matter,
 * but keep DOM order = reading order (Header, Sidebar, Main, Footer, BottomBar).
 * `navBreakpoint` decides where the bottom bar gives way to the sidebar / header nav.
 *
 * <AppShell navBreakpoint="md">
 *   <AppShell.Header>… <NavLinks hideBelow="md">…</NavLinks></AppShell.Header>
 *   <AppShell.Main>…</AppShell.Main>
 *   <AppShell.BottomBar><BottomNav position="static" hideAbove="md">…</BottomNav></AppShell.BottomBar>
 * </AppShell>
 */
const AppShellRoot = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { skipLinkLabel = 'Skip to content', mainId, navBreakpoint = 'lg', className, children, ...rest },
  ref,
) {
  const generated = `app-main-${useId().replace(/[^\w-]/g, '')}`
  const id = mainId ?? generated
  return (
    <ShellContext.Provider value={{ mainId: id }}>
      <div
        ref={ref}
        className={cx(styles.shell, className)}
        data-nav-breakpoint={navBreakpoint}
        {...rest}
      >
        <VisuallyHidden as="a" href={`#${id}`} focusable className={styles.skip}>
          {skipLinkLabel}
        </VisuallyHidden>
        {children}
      </div>
    </ShellContext.Provider>
  )
})

export interface AppShellHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Stick to the top of the viewport while scrolling. Default `true`. */
  sticky?: boolean
}

/** The top bar: canvas-coloured, hairline below. Put a `Container` + `Inline` inside. */
const Header = forwardRef<HTMLElement, AppShellHeaderProps>(function AppShellHeader(
  { sticky = true, className, ...rest },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cx(styles.header, className)}
      data-sticky={sticky || undefined}
      {...rest}
    />
  )
})

export type AppShellMainProps = Omit<HTMLAttributes<HTMLElement>, 'id'>

/** The page's `<main>` landmark and the skip link's target. Its id comes from `AppShell`. */
const Main = forwardRef<HTMLElement, AppShellMainProps>(function AppShellMain(
  { className, ...rest },
  ref,
) {
  const ctx = useContext(ShellContext)
  return (
    <main
      ref={ref}
      id={ctx?.mainId}
      tabIndex={-1}
      className={cx(styles.main, className)}
      {...rest}
    />
  )
})

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Which side of Main it sits on. Logical, so it follows writing direction. Default `start`. */
  side?: 'start' | 'end'
}

/** Navigation or context beside Main. Shown from the shell's `navBreakpoint` up only (default `lg`, 64em). */
const Sidebar = forwardRef<HTMLElement, AppShellSidebarProps>(function AppShellSidebar(
  { side = 'start', className, ...rest },
  ref,
) {
  return <aside ref={ref} className={cx(styles.sidebar, className)} data-side={side} {...rest} />
})

export type AppShellFooterProps = HTMLAttributes<HTMLElement>

/** The page footer: a hairline above, quieter ink. */
const Footer = forwardRef<HTMLElement, AppShellFooterProps>(function AppShellFooter(
  { className, ...rest },
  ref,
) {
  return <footer ref={ref} className={cx(styles.footer, className)} {...rest} />
})

export type AppShellBottomBarProps = HTMLAttributes<HTMLDivElement>

/**
 * A region pinned to the bottom of the viewport on small screens and removed from the
 * shell's `navBreakpoint` up (default `lg`, 64em). Pads for the home indicator (`safe-area-inset-bottom`). Holds a
 * `BottomNav` or a single primary action.
 */
const BottomBar = forwardRef<HTMLDivElement, AppShellBottomBarProps>(function AppShellBottomBar(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.bottomBar, className)} {...rest} />
})

export const AppShell = Object.assign(AppShellRoot, { Header, Main, Sidebar, Footer, BottomBar })
