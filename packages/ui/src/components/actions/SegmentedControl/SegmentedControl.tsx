import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ToggleGroup } from 'radix-ui'
import { cx } from '#utils/cx'
import { BREAKPOINTS, mergeStyles, type Responsive } from '#utils/responsive'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useFocusLeave } from '#components/inputs/CheckboxGroup/choice'
import styles from './SegmentedControl.module.css'

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

type RootPrimitiveProps = Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup.Root>,
  'type' | 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'asChild'
>

export interface SegmentedControlProps extends RootPrimitiveProps {
  /** Segments as data. Alternatively pass `SegmentedControl.Item` children. */
  options?: readonly SegmentedControlOption[]
  children?: ReactNode
  /** Controlled selected value. */
  value?: string
  /** Initial value when uncontrolled. Defaults to the first segment. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Control size. Responsive: `{ base: 'lg', md: 'md' }` for a bigger touch target on phones. */
  size?: Responsive<Size>
  /**
   * Stretch to the container's width. Segments are always equal widths. Responsive:
   * `{ base: true, md: false }` fills a phone screen and sits inline from `md` up.
   */
  fullWidth?: Responsive<boolean>
  /** Show only icons; labels become each segment's accessible name. */
  iconOnly?: boolean
  /** Emits a hidden input with the selected value, for native form submission. */
  name?: string
  /** Critical edge + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores selection changes. */
  readOnly?: boolean
}

export interface SegmentedControlItemProps extends Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup.Item>,
  'children'
> {
  value: string
  /** Visible label (or accessible name when the control is `iconOnly`). */
  children: ReactNode
  icon?: ReactNode
}

const IconOnlyContext = createContext(false)

const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem({ icon, className, children, ...rest }, ref) {
    const iconOnly = useContext(IconOnlyContext)
    return (
      <ToggleGroup.Item ref={ref} className={cx(styles.item, className)} {...rest}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className={iconOnly ? styles.srOnly : styles.label}>{children}</span>
      </ToggleGroup.Item>
    )
  },
)

/**
 * Per-breakpoint data attributes: the base value on `data-<name>`, and each explicitly
 * set larger breakpoint on `data-<name>-<bp>`. CSS applies them in mobile-first media
 * queries, so a later breakpoint overrides an earlier one.
 */
function breakpointAttrs<T extends string | boolean>(
  name: string,
  value: Responsive<T>,
  toAttr: (v: T) => string | undefined,
): Record<string, string | undefined> {
  if (typeof value !== 'object') return { [`data-${name}`]: toAttr(value) }
  const attrs: Record<string, string | undefined> = {}
  const base = value.base
  attrs[`data-${name}`] = base === undefined ? undefined : toAttr(base)
  for (const bp of BREAKPOINTS) {
    const v = value[bp]
    if (bp !== 'base' && v !== undefined) attrs[`data-${name}-${bp}`] = String(v)
  }
  return attrs
}

function childValues(children: ReactNode): string[] {
  const values: string[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<{ value?: unknown }>(child) && typeof child.props.value === 'string') {
      values.push(child.props.value)
    }
  })
  return values
}

/**
 * Single-select segmented control: pick one of 2–5 peer views or periods
 * (Month / Quarter / Year · Groups / Table / Bracket). One segment is always selected —
 * clicking the current one does nothing.
 *
 * Radix ToggleGroup underneath: segments are `role="radio"` inside a `radiogroup`,
 * arrow keys move focus (roving tabindex), Space/Enter selects. Give the group a name
 * with `aria-label`.
 *
 * Segments are equal widths, so the selection indicator is pure CSS — it slides by
 * index with no measuring, and renders correctly on the server.
 *
 * Field-aware: inside a `<Field>` it is labelled by the Field's label and picks up its
 * description, error, `disabled`, `readOnly` and `validating` (see `SegmentedField`).
 * `onBlur` fires once, when focus leaves the whole control.
 */
const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      options,
      children,
      value: valueProp,
      defaultValue,
      onValueChange,
      size = 'md',
      fullWidth = false,
      iconOnly = false,
      name,
      invalid: invalidProp,
      readOnly: readOnlyProp,
      disabled: disabledProp,
      id: idProp,
      onBlur,
      className,
      style,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': labelledByProp,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const handleBlur = useFocusLeave(onBlur)
    const values = options ? options.map((o) => o.value) : childValues(children)
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue ?? values[0])
    const value = valueProp ?? uncontrolled

    const handleChange = useCallback(
      (next: string) => {
        // ToggleGroup lets you deselect the pressed item; a segmented control can't.
        if (!next || field.readOnly) return
        if (valueProp === undefined) setUncontrolled(next)
        onValueChange?.(next)
      },
      [valueProp, onValueChange, field.readOnly],
    )

    const index = value === undefined ? -1 : values.indexOf(value)
    const vars = {
      '--_count': Math.max(values.length, 1),
      '--_index': Math.max(index, 0),
    } as CSSProperties

    return (
      <IconOnlyContext.Provider value={iconOnly}>
        <ToggleGroup.Root
          ref={ref}
          type="single"
          role="radiogroup"
          value={value ?? ''}
          onValueChange={handleChange}
          id={field.id}
          disabled={field.disabled}
          aria-labelledby={labelledByProp ?? (rest['aria-label'] ? undefined : field.labelId)}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          aria-required={field.required || undefined}
          aria-readonly={field.readOnly || undefined}
          aria-busy={field.busy || undefined}
          data-invalid={field.invalid || undefined}
          data-readonly={field.readOnly || undefined}
          onBlur={handleBlur}
          className={cx(styles.root, className)}
          {...breakpointAttrs('size', size, String)}
          {...breakpointAttrs('full-width', fullWidth, (v) => (v ? '' : undefined))}
          data-icon-only={iconOnly || undefined}
          style={mergeStyles(vars, style)}
          {...rest}
        >
          {index >= 0 ? <span className={styles.indicator} aria-hidden="true" /> : null}
          {options
            ? options.map((o) => (
                <SegmentedControlItem
                  key={o.value}
                  value={o.value}
                  icon={o.icon}
                  disabled={o.disabled}
                >
                  {o.label}
                </SegmentedControlItem>
              ))
            : children}
          {name && value ? (
            <input type="hidden" name={name} value={value} disabled={field.disabled || undefined} />
          ) : null}
        </ToggleGroup.Root>
      </IconOnlyContext.Provider>
    )
  },
)

export const SegmentedControl = markFieldAware(
  Object.assign(SegmentedControlRoot, { Item: SegmentedControlItem }),
)
