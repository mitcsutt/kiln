import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef } from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cx } from '#utils/cx'
import styles from './Tabs.module.css'

export type TabsVariant = 'underline' | 'pill'

const VariantContext = createContext<TabsVariant>('underline')

export interface TabsProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  /**
   * `underline` (default): triggers sit on a hairline and the current one is marked
   * with an accent bar — page-level sections. `pill`: compact, filled current tab —
   * for switching views inside a card or panel.
   */
  variant?: TabsVariant
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { variant = 'underline', className, ...rest },
  ref,
) {
  return (
    <VariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        ref={ref}
        className={cx(styles.root, className)}
        data-variant={variant}
        {...rest}
      />
    </VariantContext.Provider>
  )
})

export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>

/** The row of triggers. Scrolls horizontally when it overflows (phones), never wraps. */
const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...rest },
  ref,
) {
  const variant = useContext(VariantContext)
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cx(styles.list, className)}
      data-variant={variant}
      {...rest}
    />
  )
})

export type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, ...rest },
  ref,
) {
  const variant = useContext(VariantContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cx(styles.trigger, className)}
      data-variant={variant}
      {...rest}
    />
  )
})

export type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, ...rest },
  ref,
) {
  return <TabsPrimitive.Content ref={ref} className={cx(styles.content, className)} {...rest} />
})

/**
 * Radix Tabs with the library's look. Arrow keys move between triggers (roving focus);
 * activation follows focus by default (`activationMode="manual"` to require Enter).
 *
 * <Tabs defaultValue="tasks">
 *   <Tabs.List aria-label="Atlas redesign">
 *     <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
 *     <Tabs.Trigger value="people">People</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tasks">…</Tabs.Content>
 * </Tabs>
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
