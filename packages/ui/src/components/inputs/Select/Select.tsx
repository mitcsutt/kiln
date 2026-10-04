import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { Select as RadixSelect } from 'radix-ui'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import control from '#components/inputs/internal/control.module.css'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

/* ─── Compound parts (the escape hatch) ───────────────────────────────────── */

// The trigger's element, so the popover can portal into the same theme scope.
const TriggerNodeContext = createContext<{
  node: HTMLElement | null
  setNode: (node: HTMLElement | null) => void
} | null>(null)

export type SelectRootProps = ComponentPropsWithoutRef<typeof RadixSelect.Root>

/** State owner. Radix naming: `value` / `defaultValue` / `onValueChange`, `open` / `onOpenChange`. */
function SelectRoot(props: SelectRootProps) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const scope = useMemo(() => ({ node, setNode }), [node])
  return (
    <TriggerNodeContext.Provider value={scope}>
      <RadixSelect.Root {...props} />
    </TriggerNodeContext.Provider>
  )
}

export interface SelectTriggerProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixSelect.Trigger>,
  'asChild'
> {
  size?: Size
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly`. Gate `onValueChange` at the `Root`. */
  readOnly?: boolean
  /** Shown while no value is chosen. */
  placeholder?: ReactNode
}

/** The field-styled button. Picks up id / describedby / invalid from a surrounding `<Field>`. */
const SelectTrigger = markFieldAware(
  forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
    {
      size = 'md',
      invalid: invalidProp,
      readOnly: readOnlyProp,
      placeholder,
      id: idProp,
      disabled: disabledProp,
      className,
      children,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const triggerNode = useContext(TriggerNodeContext)
    const composedRef = useMergedRefs(ref, triggerNode?.setNode)
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    return (
      <RadixSelect.Trigger
        ref={composedRef}
        id={field.id}
        className={cx(control.box, styles.trigger, className)}
        data-size={size}
        data-invalid={field.invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        disabled={field.disabled || undefined}
        aria-readonly={field.readOnly || undefined}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        aria-required={field.required || undefined}
        aria-busy={field.busy || undefined}
        {...rest}
      >
        <span className={styles.value}>
          {children ?? <RadixSelect.Value placeholder={placeholder} />}
        </span>
        <RadixSelect.Icon className={styles.chevron}>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
    )
  }),
)

export interface SelectContentProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixSelect.Content>,
  'asChild'
> {
  /**
   * Where to portal the list. Defaults to the trigger's nearest `[data-theme]` scope, so a
   * select inside a `<ThemeScope>` opens in that theme; falls back to `document.body`.
   */
  container?: HTMLElement | null
}

function themeScopeOf(node: HTMLElement | null): HTMLElement | undefined {
  const scope = node?.closest<HTMLElement>('[data-theme]')
  return scope && scope !== node?.ownerDocument.documentElement ? scope : undefined
}

/** The floating list. Anchored under the trigger, at least as wide as it. */
const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  {
    container,
    position = 'popper',
    sideOffset = 6,
    collisionPadding = 8,
    className,
    children,
    ...rest
  },
  ref,
) {
  const triggerNode = useContext(TriggerNodeContext)
  return (
    <RadixSelect.Portal container={container ?? themeScopeOf(triggerNode?.node ?? null)}>
      <RadixSelect.Content
        ref={ref}
        position={position}
        sideOffset={position === 'popper' ? sideOffset : undefined}
        collisionPadding={collisionPadding}
        className={cx(styles.content, className)}
        {...rest}
      >
        <RadixSelect.ScrollUpButton className={styles.scroll}>
          <ChevronUpIcon />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport className={styles.viewport}>{children}</RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton className={styles.scroll}>
          <ChevronDownIcon />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  )
})

export type SelectItemProps = Omit<ComponentPropsWithoutRef<typeof RadixSelect.Item>, 'asChild'>

/** One option. The chosen one carries a check. */
const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { className, children, ...rest },
  ref,
) {
  return (
    <RadixSelect.Item ref={ref} className={cx(styles.item, className)} {...rest}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={styles.indicator}>
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
})

export type SelectGroupProps = Omit<ComponentPropsWithoutRef<typeof RadixSelect.Group>, 'asChild'>

const SelectGroupPart = forwardRef<HTMLDivElement, SelectGroupProps>(function SelectGroup(
  { className, ...rest },
  ref,
) {
  return <RadixSelect.Group ref={ref} className={cx(styles.group, className)} {...rest} />
})

export type SelectLabelProps = Omit<ComponentPropsWithoutRef<typeof RadixSelect.Label>, 'asChild'>

/** A group heading inside the list. */
const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(function SelectLabel(
  { className, ...rest },
  ref,
) {
  return <RadixSelect.Label ref={ref} className={cx(styles.label, className)} {...rest} />
})

export type SelectSeparatorProps = Omit<
  ComponentPropsWithoutRef<typeof RadixSelect.Separator>,
  'asChild'
>

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(function SelectSeparator(
  { className, ...rest },
  ref,
) {
  return <RadixSelect.Separator ref={ref} className={cx(styles.separator, className)} {...rest} />
})

/* ─── Simple API ──────────────────────────────────────────────────────────── */

export interface SelectProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'dir' | 'placeholder'
> {
  /** Flat list of options. */
  options?: SelectOption[]
  /** Or headed groups (rendered after `options` if both are given). */
  groups?: SelectGroup[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: ReactNode
  size?: Size
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores value changes. */
  readOnly?: boolean
  /** Submitted with a native `<form>` under this name. */
  name?: string
  required?: boolean
  autoComplete?: string
}

/**
 * A single-choice dropdown. Pass `options` (or `groups`) for the common case; compose
 * `Select.Root` / `Trigger` / `Content` / `Item` / `Group` / `Label` for anything custom.
 * The ref and native button props go to the trigger.
 *
 * <Select options={categories} placeholder="Choose a category" onValueChange={setCategory} />
 */
const SelectBase = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    groups,
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    placeholder,
    size,
    invalid,
    readOnly,
    name,
    required,
    disabled,
    autoComplete,
    form,
    ...rest
  },
  ref,
) {
  const field = useResolvedField({ disabled, required, readOnly })
  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={field.readOnly ? undefined : onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      name={name}
      required={required}
      disabled={field.disabled}
      autoComplete={autoComplete}
      form={form}
    >
      <SelectTrigger
        ref={ref}
        size={size}
        invalid={invalid}
        readOnly={field.readOnly}
        placeholder={placeholder}
        {...rest}
      />
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
        {groups?.map((group, index) => (
          <SelectGroupPart key={group.label}>
            {index > 0 || (options && options.length > 0) ? <SelectSeparator /> : null}
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroupPart>
        ))}
      </SelectContent>
    </SelectRoot>
  )
})

export const Select = markFieldAware(
  Object.assign(SelectBase, {
    Root: SelectRoot,
    Trigger: SelectTrigger,
    Content: SelectContent,
    Item: SelectItem,
    Group: SelectGroupPart,
    Label: SelectLabel,
    Separator: SelectSeparator,
  }),
)
