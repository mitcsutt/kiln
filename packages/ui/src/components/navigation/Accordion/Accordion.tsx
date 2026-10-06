import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import { ChevronDownIcon } from '#icons'
import styles from './Accordion.module.css'
import { headingTag } from '#utils/heading'

export type AccordionVariant = 'divided' | 'contained'
export type AccordionSize = 'sm' | 'md'

interface AccordionOwnProps {
  /** `divided` (default): hairlines between items, no box. `contained`: a bordered surface. */
  variant?: AccordionVariant
  /** `sm` for inline notes ("Why is this invoice overdue?"); `md` for FAQs and sections. */
  size?: AccordionSize
}

export type AccordionProps = (
  AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps
) &
  AccordionOwnProps

const SizeContext = createContext<AccordionSize>('md')

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { variant = 'divided', size = 'md', className, ...rest },
  ref,
) {
  const props = rest.type === 'single' ? { collapsible: true, ...rest } : rest // single items can close by default
  return (
    <SizeContext.Provider value={size}>
      <AccordionPrimitive.Root
        ref={ref}
        className={cx(styles.root, className)}
        data-variant={variant}
        data-size={size}
        {...props}
      />
    </SizeContext.Provider>
  )
})

export type AccordionItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, ...rest },
  ref,
) {
  return <AccordionPrimitive.Item ref={ref} className={cx(styles.item, className)} {...rest} />
})

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  /** Heading level wrapping the trigger, for the document outline. Default 3. */
  level?: 2 | 3 | 4 | 5 | 6
  /**
   * A figure or badge at the end of the trigger, just before the chevron, like a score beside
   * a match. Keep it phrasing content (`Numeral`, `Badge`, `Text`): it's inside a button.
   */
  trailing?: ReactNode
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ level = 3, trailing, className, children, ...rest }, ref) {
    const size = useContext(SizeContext)
    const Heading = headingTag(level)
    return (
      <AccordionPrimitive.Header asChild>
        <Heading className={styles.header}>
          <AccordionPrimitive.Trigger
            ref={ref}
            className={cx(styles.trigger, className)}
            data-size={size}
            data-trailing={trailing !== undefined || undefined}
            {...rest}
          >
            <span className={styles.triggerLabel}>{children}</span>
            {trailing !== undefined ? (
              <span className={styles.triggerTrailing}>{trailing}</span>
            ) : null}
            <ChevronDownIcon className={styles.chevron} />
          </AccordionPrimitive.Trigger>
        </Heading>
      </AccordionPrimitive.Header>
    )
  },
)

export type AccordionContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...rest }, ref) {
    const size = useContext(SizeContext)
    return (
      <AccordionPrimitive.Content
        ref={ref}
        className={cx(styles.content, className)}
        data-size={size}
        {...rest}
      >
        <div className={styles.contentInner}>{children}</div>
      </AccordionPrimitive.Content>
    )
  },
)

/**
 * Expandable sections with a turning chevron. Also Kiln's disclosure, for a single "why?" note.
 *
 * @remarks
 * `Accordion` stacks sections whose content expands under their heading. It's Radix Accordion
 * underneath, so triggers are buttons inside headings, and arrow keys move between them.
 *
 * @privateRemarks
 * Radix Accordion: expandable sections with a rotating chevron and a height animation.
 * Also the library's disclosure: use one `type="single"` item for an inline "why?" note.
 * Single accordions are `collapsible` unless you pass `collapsible={false}`.
 *
 * <Accordion type="single">
 *   <Accordion.Item value="scoring">
 *     <Accordion.Trigger>How scoring works</Accordion.Trigger>
 *     <Accordion.Content>…</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})
