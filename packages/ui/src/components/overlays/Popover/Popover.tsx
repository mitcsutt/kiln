import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchor,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import styles from './Popover.module.css'

export type PopoverProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>

/**
 * A non-modal panel anchored to its trigger, for details, a filter or a small form.
 *
 * @remarks
 * `Popover` opens a floating panel beside its trigger. It's non-modal: the rest of the page stays
 * usable, and it closes on Escape or a click outside, returning focus to the trigger.
 *
 * @privateRemarks
 * Non-modal floating panel anchored to a trigger: invoice details, a filter, a small
 * form. Opens on click, closes on Escape or an outside click, returns focus. For
 * hover-only hints use `Tooltip`; for a list of commands use `DropdownMenu`.
 *
 * <Popover>
 *   <Popover.Trigger asChild><Button>Invoice details</Button></Popover.Trigger>
 *   <Popover.Content aria-label="Invoice details">…</Popover.Content>
 * </Popover>
 */
function PopoverRoot(props: PopoverProps) {
  const anchor = usePortalAnchorRef()
  return (
    <PortalAnchorContext.Provider value={anchor}>
      <PopoverPrimitive.Root {...props} />
    </PortalAnchorContext.Provider>
  )
}

export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>

const PopoverTrigger = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Trigger>,
  PopoverTriggerProps
>(function PopoverTrigger(props, ref) {
  const anchor = usePortalAnchor()
  return <PopoverPrimitive.Trigger ref={composeRefs(ref, anchor)} {...props} />
})

export type PopoverAnchorProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>

/** Position against something other than the trigger. Also becomes the theme source. */
const PopoverAnchor = forwardRef<ComponentRef<typeof PopoverPrimitive.Anchor>, PopoverAnchorProps>(
  function PopoverAnchor(props, ref) {
    const anchor = usePortalAnchor()
    return <PopoverPrimitive.Anchor ref={composeRefs(ref, anchor)} {...props} />
  },
)

export interface PopoverContentProps extends ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  /** Draw a small pointer toward the trigger. Default `false`. */
  arrow?: boolean
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

const ContentInner = forwardRef<HTMLDivElement, PopoverContentProps>(function ContentInner(
  { arrow = false, container, sideOffset, className, children, ...rest },
  ref,
) {
  const theme = usePortalTheme(container)
  return (
    <PopoverPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      sideOffset={sideOffset ?? (arrow ? 4 : 6)}
      collisionPadding={8}
      {...theme}
      {...rest}
    >
      {children}
      {arrow ? (
        <PopoverPrimitive.Arrow asChild width={18} height={9}>
          <svg className={styles.arrow} viewBox="0 0 18 9" aria-hidden>
            <path className={styles.arrowFill} d="M0 0 L9 9 L18 0 Z" />
            <path className={styles.arrowEdge} d="M0 0 L9 9 L18 0" />
          </svg>
        </PopoverPrimitive.Arrow>
      ) : null}
    </PopoverPrimitive.Content>
  )
})

/** The floating panel. `side`, `align` and `sideOffset` follow Radix; it flips to stay on screen. */
const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { container, forceMount, ...rest },
  ref,
) {
  return (
    <PopoverPrimitive.Portal container={container} forceMount={forceMount}>
      <ContentInner ref={ref} container={container} forceMount={forceMount} {...rest} />
    </PopoverPrimitive.Portal>
  )
})

export type PopoverCloseProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>

const PopoverClose = PopoverPrimitive.Close

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Content: PopoverContent,
  Close: PopoverClose,
})
