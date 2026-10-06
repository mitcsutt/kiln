import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type ReactNode } from 'react'
import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import { CheckIcon, ChevronRightIcon } from '#icons'
import { cx } from '#utils/cx'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchor,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import styles from './DropdownMenu.module.css'

export type DropdownMenuProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Root>

/**
 * A list of commands behind a button, with checkboxes, radio groups, submenus and full keyboard
 * support.
 *
 * @remarks
 * `DropdownMenu` holds the actions you don't need to see all the time: a row's options, a sort
 * order. It's Radix Menu underneath, so arrow keys, typeahead, Home, End and Escape all work.
 *
 * @privateRemarks
 * A list of commands behind a button: row actions, a member's options, sort order.
 * Full keyboard support (arrows, typeahead, Home/End, Escape) from Radix.
 *
 * <DropdownMenu>
 *   <DropdownMenu.Trigger asChild><Button>Options</Button></DropdownMenu.Trigger>
 *   <DropdownMenu.Content>
 *     <DropdownMenu.Item shortcut="⌘E">Edit</DropdownMenu.Item>
 *     <DropdownMenu.Separator />
 *     <DropdownMenu.Item tone="critical">Remove</DropdownMenu.Item>
 *   </DropdownMenu.Content>
 * </DropdownMenu>
 */
function DropdownMenuRoot(props: DropdownMenuProps) {
  const anchor = usePortalAnchorRef()
  return (
    <PortalAnchorContext.Provider value={anchor}>
      <MenuPrimitive.Root {...props} />
    </PortalAnchorContext.Provider>
  )
}

export type DropdownMenuTriggerProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Trigger>

const DropdownMenuTrigger = forwardRef<
  ComponentRef<typeof MenuPrimitive.Trigger>,
  DropdownMenuTriggerProps
>(function DropdownMenuTrigger(props, ref) {
  const anchor = usePortalAnchor()
  return <MenuPrimitive.Trigger ref={composeRefs(ref, anchor)} {...props} />
})

export interface DropdownMenuContentProps extends ComponentPropsWithoutRef<
  typeof MenuPrimitive.Content
> {
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

const ContentInner = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function ContentInner(
  { container, align = 'start', sideOffset = 6, className, ...rest },
  ref,
) {
  const theme = usePortalTheme(container)
  return (
    <MenuPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={8}
      {...theme}
      {...rest}
    />
  )
})

/** The menu panel. Aligns to the trigger's start edge by default and flips to stay on screen. */
const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent({ container, forceMount, ...rest }, ref) {
    return (
      <MenuPrimitive.Portal container={container} forceMount={forceMount}>
        <ContentInner ref={ref} container={container} forceMount={forceMount} {...rest} />
      </MenuPrimitive.Portal>
    )
  },
)

export type DropdownMenuItemTone = 'neutral' | 'critical'

export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof MenuPrimitive.Item> {
  /** `critical` for destructive commands. Put them last, after a separator. */
  tone?: DropdownMenuItemTone
  /** Icon before the label. Use sparingly — one menu, icons on all items or none. */
  leadingIcon?: ReactNode
  /** Keyboard shortcut hint, shown right-aligned. Display only; wire the shortcut yourself. */
  shortcut?: ReactNode
}

const DropdownMenuItem = forwardRef<ComponentRef<typeof MenuPrimitive.Item>, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { tone = 'neutral', leadingIcon, shortcut, className, children, ...rest },
    ref,
  ) {
    return (
      <MenuPrimitive.Item
        ref={ref}
        className={cx(styles.item, className)}
        data-tone={tone}
        {...rest}
      >
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <span className={styles.label}>{children}</span>
        {shortcut ? <kbd className={styles.shortcut}>{shortcut}</kbd> : null}
      </MenuPrimitive.Item>
    )
  },
)

export interface DropdownMenuCheckboxItemProps extends ComponentPropsWithoutRef<
  typeof MenuPrimitive.CheckboxItem
> {
  shortcut?: ReactNode
}

/** A toggle. Controlled with `checked` + `onCheckedChange`. Stays open on select only if you `preventDefault`. */
const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof MenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ shortcut, className, children, ...rest }, ref) {
  return (
    <MenuPrimitive.CheckboxItem
      ref={ref}
      className={cx(styles.item, className)}
      data-selectable=""
      {...rest}
    >
      <span className={styles.indicator}>
        <MenuPrimitive.ItemIndicator>
          <CheckIcon />
        </MenuPrimitive.ItemIndicator>
      </span>
      <span className={styles.label}>{children}</span>
      {shortcut ? <kbd className={styles.shortcut}>{shortcut}</kbd> : null}
    </MenuPrimitive.CheckboxItem>
  )
})

export type DropdownMenuRadioGroupProps = ComponentPropsWithoutRef<typeof MenuPrimitive.RadioGroup>

/** One-of-many choice. `value` + `onValueChange`. */
const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup

export type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>

const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof MenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...rest }, ref) {
  return (
    <MenuPrimitive.RadioItem
      ref={ref}
      className={cx(styles.item, className)}
      data-selectable=""
      {...rest}
    >
      <span className={styles.indicator}>
        <MenuPrimitive.ItemIndicator className={styles.dot} />
      </span>
      <span className={styles.label}>{children}</span>
    </MenuPrimitive.RadioItem>
  )
})

export type DropdownMenuLabelProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Label>

/** A non-interactive heading for the group below it. */
const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof MenuPrimitive.Label>,
  DropdownMenuLabelProps
>(function DropdownMenuLabel({ className, ...rest }, ref) {
  return <MenuPrimitive.Label ref={ref} className={cx(styles.menuLabel, className)} {...rest} />
})

export type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>

const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof MenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...rest }, ref) {
  return <MenuPrimitive.Separator ref={ref} className={cx(styles.separator, className)} {...rest} />
})

export type DropdownMenuGroupProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Group>

const DropdownMenuGroup = MenuPrimitive.Group

export type DropdownMenuSubProps = ComponentPropsWithoutRef<typeof MenuPrimitive.Sub>

const DropdownMenuSub = MenuPrimitive.Sub

export interface DropdownMenuSubTriggerProps extends ComponentPropsWithoutRef<
  typeof MenuPrimitive.SubTrigger
> {
  leadingIcon?: ReactNode
}

/** Opens a submenu on hover, click, or → . */
const DropdownMenuSubTrigger = forwardRef<
  ComponentRef<typeof MenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger({ leadingIcon, className, children, ...rest }, ref) {
  return (
    <MenuPrimitive.SubTrigger
      ref={ref}
      className={cx(styles.item, className)}
      data-tone="neutral"
      {...rest}
    >
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      <span className={styles.label}>{children}</span>
      <span className={styles.chevron}>
        <ChevronRightIcon />
      </span>
    </MenuPrimitive.SubTrigger>
  )
})

export interface DropdownMenuSubContentProps extends ComponentPropsWithoutRef<
  typeof MenuPrimitive.SubContent
> {
  container?: HTMLElement | null
}

const SubContentInner = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function SubContentInner({ container, sideOffset = 4, className, ...rest }, ref) {
    const theme = usePortalTheme(container)
    return (
      <MenuPrimitive.SubContent
        ref={ref}
        className={cx(styles.content, className)}
        sideOffset={sideOffset}
        collisionPadding={8}
        {...theme}
        {...rest}
      />
    )
  },
)

const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent({ container, forceMount, ...rest }, ref) {
    return (
      <MenuPrimitive.Portal container={container} forceMount={forceMount}>
        <SubContentInner ref={ref} container={container} forceMount={forceMount} {...rest} />
      </MenuPrimitive.Portal>
    )
  },
)

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
})
