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
import styles from './Dialog.module.css'

export type DialogSize = 'sm' | 'md' | 'lg'

export type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>

/**
 * Modal dialog root. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`).
 * Focus is trapped while open, Escape and the scrim close it, and focus returns to the
 * trigger on close.
 *
 * <Dialog>
 *   <Dialog.Trigger asChild><Button>Delete</Button></Dialog.Trigger>
 *   <Dialog.Content title="Delete invoice?" description="…">
 *     <Dialog.Footer>…</Dialog.Footer>
 *   </Dialog.Content>
 * </Dialog>
 */
function DialogRoot(props: DialogProps) {
  const anchor = usePortalAnchorRef()
  return (
    <PortalAnchorContext.Provider value={anchor}>
      <DialogPrimitive.Root {...props} />
    </PortalAnchorContext.Provider>
  )
}

export type DialogTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>

/** Opens the dialog. Use `asChild` to render your own button. Its theme scope themes the dialog. */
const DialogTrigger = forwardRef<ComponentRef<typeof DialogPrimitive.Trigger>, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    const anchor = usePortalAnchor()
    return <DialogPrimitive.Trigger ref={composeRefs(ref, anchor)} {...props} />
  },
)

/* Rendered inside the Portal so they mount on open and read the theme at that moment. */
const Overlay = forwardRef<HTMLDivElement, { container?: HTMLElement | null }>(function Overlay(
  { container },
  ref,
) {
  const theme = usePortalTheme(container)
  return <DialogPrimitive.Overlay ref={ref} className={styles.overlay} {...theme} />
})

export interface DialogContentProps extends Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  'title'
> {
  /** Width step. `sm` for confirmations, `md` (default) for short forms, `lg` for reading. */
  size?: DialogSize
  /**
   * Heading, rendered as the accessible title. If you omit it, render a `<Dialog.Title>`
   * yourself — every dialog needs a name.
   */
  title?: ReactNode
  /** Supporting sentence under the title, wired to `aria-describedby`. */
  description?: ReactNode
  /** Hide the corner close button (keep a `Dialog.Close` in the footer instead). */
  hideClose?: boolean
  /** Accessible name of the corner close button. Default "Close". */
  closeLabel?: string
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

const ContentInner = forwardRef<HTMLDivElement, DialogContentProps>(function ContentInner(
  {
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
  return (
    <DialogPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      data-size={size}
      {...theme}
      {...rest}
    >
      {title !== undefined || description !== undefined ? (
        <div className={styles.header} data-has-close={hideClose ? undefined : ''}>
          {title !== undefined ? (
            <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
          ) : null}
          {description !== undefined ? (
            <DialogPrimitive.Description className={styles.description}>
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
      ) : null}
      {children}
      {hideClose ? null : <OverlayClose className={styles.close} label={closeLabel} />}
    </DialogPrimitive.Content>
  )
})

/**
 * The dialog panel, its scrim and the portal. Centred, scrolls internally when tall.
 */
const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
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

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>

/** Actions row. Primary action last (rightmost); it wraps and stacks on narrow screens. */
const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.footer, className)} {...rest} />
})

export type DialogTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>

/** For custom headers when the `title` prop isn't enough. */
const DialogTitle = forwardRef<ComponentRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  function DialogTitle({ className, ...rest }, ref) {
    return <DialogPrimitive.Title ref={ref} className={cx(styles.title, className)} {...rest} />
  },
)

export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>

const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(function DialogDescription({ className, ...rest }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cx(styles.description, className)}
      {...rest}
    />
  )
})

export type DialogCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>

/** Closes the dialog. Use `asChild` with a Button for "Cancel". */
const DialogClose = DialogPrimitive.Close

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
})
