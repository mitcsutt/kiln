import {
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import styles from './Tooltip.module.css'

const HasProvider = createContext(false)

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>

/**
 * Shares open/skip delays between tooltips, so moving along a toolbar shows each hint
 * instantly after the first. Put one near the app root. Tooltips work without it.
 */
export function TooltipProvider({
  delayDuration = 500,
  skipDelayDuration = 300,
  ...rest
}: TooltipProviderProps) {
  return (
    <HasProvider.Provider value>
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...rest}
      />
    </HasProvider.Provider>
  )
}

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipTouch = 'none' | 'longpress'

/** How long a touch must be held before a `touch="longpress"` tooltip opens, in ms. */
const LONG_PRESS = 500
/** How far a touch may drift, in px, and still count as a press rather than a scroll. */
const PRESS_SLOP = 10
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps extends Omit<
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
  'content' | 'side' | 'align' | 'children'
> {
  /** The hint. Short — a label or one sentence. It's announced as the trigger's description. */
  content: ReactNode
  /**
   * The trigger: a single focusable element (a button or link). It receives the ref and
   * event handlers, so custom components must forward both.
   */
  children: ReactElement
  side?: TooltipSide
  align?: TooltipAlign
  /** Hover delay before opening, in ms. Keyboard focus opens immediately. */
  delay?: number
  /**
   * What a touch does. Hover and focus don't exist on a phone, so by default (`none`) a touch
   * never opens a tooltip. `longpress` opens it when the trigger is held for half a second, and
   * swallows the tap that follows, so the press doesn't also act. A tap elsewhere closes it.
   */
  touch?: TooltipTouch
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

const ContentInner = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { container?: HTMLElement | null }
>(function ContentInner({ container, className, children, ...rest }, ref) {
  const theme = usePortalTheme(container)
  return (
    <TooltipPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      collisionPadding={8}
      {...theme}
      {...rest}
    >
      {children}
      <TooltipPrimitive.Arrow className={styles.arrow} width={10} height={5} />
    </TooltipPrimitive.Content>
  )
})

/**
 * A short label that appears on hover and keyboard focus. Never for anything interactive.
 *
 * @remarks
 * `Tooltip` shows a short label beside its trigger on hover and on keyboard focus. It's portalled,
 * so an `overflow: hidden` parent never clips it. Keep it to a few words, and never put anything
 * interactive in it: use a {@link Popover | Popover} for that.
 *
 * ## On touch screens
 *
 * A phone has no hover, so a tooltip never opens on a tap. With `touch="longpress"` it opens
 * when the trigger is held for half a second, and the tap that ends the press is swallowed, so
 * holding a button to see who reacted doesn't also press it. Don't hide anything essential in a
 * tooltip: a long press is easy to miss.
 *
 * ## On disabled triggers
 *
 * A disabled button gets no pointer or focus events, so a tooltip on it could never open. When
 * the trigger is disabled, `Tooltip` wraps it in a focusable span that takes the hover, focus and
 * long press instead, so the reason it's disabled ("You've used all three reactions") still
 * reaches every reader.
 *
 * @privateRemarks
 * A small label that appears on hover and on keyboard focus. Portalled, so it's never
 * clipped by an `overflow: hidden` card. Not for anything interactive — use `Popover`.
 *
 * <Tooltip content="Copy link"><IconButton … /></Tooltip>
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    content,
    children,
    side = 'top',
    align = 'center',
    delay,
    touch = 'none',
    open,
    defaultOpen,
    onOpenChange,
    container,
    sideOffset = 6,
    ...rest
  },
  ref,
) {
  const hasProvider = useContext(HasProvider)
  const anchor = usePortalAnchorRef()
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false)
  const isOpen = open ?? uncontrolled
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }
  const press = useLongPress(touch === 'longpress', () => {
    setOpen(true)
  })
  const disabled =
    isValidElement<{ disabled?: unknown }>(children) && children.props.disabled === true
  const tooltip = (
    <PortalAnchorContext.Provider value={anchor}>
      <TooltipPrimitive.Root delayDuration={delay} open={isOpen} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild ref={composeRefs(anchor)} {...press}>
          {disabled ? (
            // A disabled control gets no pointer or focus events: this span takes them instead.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focus is how a keyboard reader reaches the hint explaining why the control is disabled
            <span className={styles.disabledTrigger} tabIndex={0}>
              {children}
            </span>
          ) : (
            children
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={container}>
          <ContentInner
            ref={ref}
            container={container}
            side={side}
            align={align}
            sideOffset={sideOffset}
            {...rest}
          >
            {content}
          </ContentInner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </PortalAnchorContext.Provider>
  )
  return hasProvider ? tooltip : <TooltipProvider>{tooltip}</TooltipProvider>
})

/**
 * Long-press handlers for a trigger: a touch held still for LONG_PRESS opens the tooltip, and
 * the click that ends that press (and the phone's context menu) is swallowed.
 */
function useLongPress(enabled: boolean, onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)
  const cancel = () => {
    clearTimeout(timer.current)
    start.current = null
  }
  useEffect(() => cancel, [])
  if (!enabled) return {}
  const swallow = (event: SyntheticEvent) => {
    if (!fired.current) return
    event.preventDefault()
    event.stopPropagation()
  }
  return {
    onPointerDown: (event: PointerEvent) => {
      fired.current = false
      if (event.pointerType !== 'touch') return
      start.current = { x: event.clientX, y: event.clientY }
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        fired.current = true
        start.current = null
        onLongPress()
      }, LONG_PRESS)
    },
    onPointerMove: (event: PointerEvent) => {
      const from = start.current
      if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > PRESS_SLOP) cancel()
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onClickCapture: swallow,
    onContextMenu: swallow,
  }
}
