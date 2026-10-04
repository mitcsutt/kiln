import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchor,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import { OverlayClose } from '#components/overlays/OverlayClose'
import styles from './Sheet.module.css'

export type SheetSide = 'right' | 'left' | 'bottom'
export type SheetSize = 'sm' | 'md' | 'lg'
/** A side per breakpoint: `{ base: 'bottom', md: 'right' }` — a bottom sheet on phones, a drawer from 48em. */
export interface SheetResponsiveSide {
  base: SheetSide
  md?: SheetSide
  lg?: SheetSide
}

export type SheetProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>

/**
 * A panel that slides in from an edge: side drawers on desktop, a bottom sheet on a
 * phone. Built on the Radix Dialog, so it traps focus, closes on Escape or a scrim tap,
 * locks page scroll and returns focus to its trigger.
 *
 * <Sheet>
 *   <Sheet.Trigger asChild><Button>Your order</Button></Sheet.Trigger>
 *   <Sheet.Content side={{ base: 'bottom', md: 'right' }} title="Your order">…</Sheet.Content>
 * </Sheet>
 */
function SheetRoot(props: SheetProps) {
  const anchor = usePortalAnchorRef()
  return (
    <PortalAnchorContext.Provider value={anchor}>
      <DialogPrimitive.Root {...props} />
    </PortalAnchorContext.Provider>
  )
}

export type SheetTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>

const SheetTrigger = forwardRef<ComponentRef<typeof DialogPrimitive.Trigger>, SheetTriggerProps>(
  function SheetTrigger(props, ref) {
    const anchor = usePortalAnchor()
    return <DialogPrimitive.Trigger ref={composeRefs(ref, anchor)} {...props} />
  },
)

const Overlay = forwardRef<HTMLDivElement, { container?: HTMLElement | null }>(function Overlay(
  { container },
  ref,
) {
  const theme = usePortalTheme(container)
  return <DialogPrimitive.Overlay ref={ref} className={styles.overlay} {...theme} />
})

export interface SheetContentProps extends Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  'title'
> {
  /**
   * Edge it slides from. `bottom` is the phone pattern and shows a grab handle. Default
   * `right`. Responsive: `{ base: 'bottom', md: 'right' }` (breakpoints `md` 48em, `lg` 64em).
   */
  side?: SheetSide | SheetResponsiveSide
  /** Width for side sheets, maximum height for bottom sheets. Default `md`. */
  size?: SheetSize
  /** Heading and accessible title. If omitted, render a `<Sheet.Title>` yourself. */
  title?: ReactNode
  /** Supporting sentence under the title, wired to `aria-describedby`. */
  description?: ReactNode
  /** Hide the corner close button. */
  hideClose?: boolean
  /** Accessible name of the corner close button. Default "Close". */
  closeLabel?: string
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

const ContentInner = forwardRef<HTMLDivElement, SheetContentProps>(function ContentInner(
  {
    side = 'right',
    size = 'md',
    title,
    description,
    hideClose = false,
    closeLabel,
    container,
    className,
    children,
    ...rest
  },
  ref,
) {
  const theme = usePortalTheme(container)
  const hasHeader = title !== undefined || description !== undefined || !hideClose
  const sides: SheetResponsiveSide = typeof side === 'string' ? { base: side } : side
  const anyBottom = sides.base === 'bottom' || sides.md === 'bottom' || sides.lg === 'bottom'
  return (
    <DialogPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      data-side={sides.base}
      data-side-md={sides.md}
      data-side-lg={sides.lg}
      data-size={size}
      {...theme}
      {...rest}
    >
      {/* Rendered whenever any breakpoint is `bottom`; CSS shows it only where it is. */}
      {anyBottom ? <div className={styles.handle} aria-hidden /> : null}
      {hasHeader ? (
        <div className={styles.header}>
          <div className={styles.heading}>
            {title !== undefined ? (
              <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
            ) : null}
            {description !== undefined ? (
              <DialogPrimitive.Description className={styles.description}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          {hideClose ? null : <OverlayClose label={closeLabel} />}
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
    </DialogPrimitive.Content>
  )
})

/** The panel, its scrim and the portal. The body scrolls; header and footer stay put. */
const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { container, forceMount, ...rest },
  ref,
) {
  return (
    <DialogPrimitive.Portal container={container} forceMount={forceMount}>
      <Overlay container={container} />
      <ContentInner ref={ref} container={container} forceMount={forceMount} {...rest} />
    </DialogPrimitive.Portal>
  )
})

export type SheetFooterProps = HTMLAttributes<HTMLDivElement>

/** Actions pinned to the bottom of the sheet (sticky inside the scrolling body). */
const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(function SheetFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.footer, className)} {...rest} />
})

export type SheetTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>

const SheetTitle = forwardRef<ComponentRef<typeof DialogPrimitive.Title>, SheetTitleProps>(
  function SheetTitle({ className, ...rest }, ref) {
    return <DialogPrimitive.Title ref={ref} className={cx(styles.title, className)} {...rest} />
  },
)

export type SheetDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>

const SheetDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  SheetDescriptionProps
>(function SheetDescription({ className, ...rest }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cx(styles.description, className)}
      {...rest}
    />
  )
})

export type SheetCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>

const SheetClose = DialogPrimitive.Close

export const Sheet = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Footer: SheetFooter,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
})
