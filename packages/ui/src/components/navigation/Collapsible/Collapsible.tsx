import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
} from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { ChevronDownIcon } from '#icons'
import { Collapse, type CollapseProps } from '#components/layout/Collapse'
import { useLatest } from '#components/inputs/internal/useLatest'
import styles from './Collapsible.module.css'

interface CollapsibleContextValue {
  open: boolean
  disabled: boolean
  contentId: string
  toggle: () => void
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null)

function useCollapsible(part: string): CollapsibleContextValue {
  const context = useContext(CollapsibleContext)
  if (!context) throw new Error(`Collapsible.${part} must be inside <Collapsible>.`)
  return context
}

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial state. Default `false`. */
  defaultOpen?: boolean
  /** Runs when the trigger asks to open or close. */
  onOpenChange?: (open: boolean) => void
  /** The trigger does nothing. */
  disabled?: boolean
}

const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const contentId = useId()
  const change = useLatest(onOpenChange)
  const toggle = useCallback(() => {
    const next = !open
    if (openProp === undefined) setUncontrolled(next)
    change.current?.(next)
  }, [open, openProp, change])

  return (
    <CollapsibleContext.Provider value={{ open, disabled, contentId, toggle }}>
      <div
        ref={ref}
        className={cx(styles.root, className)}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Render the single child (your own `Button`, a row, a heading's button) as the trigger
   * instead of Kiln's label-and-chevron button. It gets `aria-expanded`, `aria-controls` and the
   * click handler.
   */
  asChild?: boolean
}

const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild = false, onClick, className, children, ...rest }, ref) {
    const { open, disabled, contentId, toggle } = useCollapsible('Trigger')
    const props = {
      ref,
      type: 'button' as const,
      'aria-expanded': open,
      'aria-controls': contentId,
      'data-state': open ? 'open' : 'closed',
      disabled: disabled || undefined,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggle()
      },
      ...rest,
    }
    if (asChild) {
      return (
        <Slot.Root className={className} {...props}>
          {children}
        </Slot.Root>
      )
    }
    return (
      <button className={cx(styles.trigger, className)} {...props}>
        <span className={styles.label}>{children}</span>
        <ChevronDownIcon className={styles.chevron} />
      </button>
    )
  },
)

/** `Collapse`'s props except `open`, which comes from the `Collapsible`. */
export type CollapsibleContentProps = Omit<CollapseProps, 'open'>

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, ...rest }, ref) {
    const { open, contentId } = useCollapsible('Content')
    return (
      <Collapse
        ref={ref}
        id={contentId}
        open={open}
        className={cx(styles.content, className)}
        {...rest}
      />
    )
  },
)

/**
 * A trigger that shows and hides one block of content: "Advanced options", "Show the formula".
 *
 * @remarks
 * `Collapsible` is a button and the content it opens, wired together: the button gets
 * `aria-expanded` and `aria-controls`, and the content animates with the same height motion as
 * {@link Collapse | Collapse}. Unlike {@link Accordion | Accordion} it brings no heading, no
 * divider and no list of items, so it fits inside a form, a card or a sidebar.
 *
 * The default trigger is a label and a chevron that turns. To use your own control, such as a
 * ghost `Button`, pass it to `Collapsible.Trigger` with `asChild`.
 *
 * @privateRemarks
 * Not Radix Collapsible: its Content owns mounting and `hidden`, so it can't run Collapse's
 * height motion. The context here is the same contract (open, contentId, toggle) with Kiln's
 * Collapse underneath.
 *
 * <Collapsible>
 *   <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
 *   <Collapsible.Content>…</Collapsible.Content>
 * </Collapsible>
 */
export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
})
