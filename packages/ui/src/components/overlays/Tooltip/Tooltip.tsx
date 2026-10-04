import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
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
  const tooltip = (
    <PortalAnchorContext.Provider value={anchor}>
      <TooltipPrimitive.Root
        delayDuration={delay}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild ref={composeRefs(anchor)}>
          {children}
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
