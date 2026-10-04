import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import type { Size } from '#utils/tokens'
import { Checkbox } from '#components/inputs/Checkbox'
import {
  FieldContext,
  markFieldAware,
  useResolvedField,
} from '#components/inputs/internal/FieldContext'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { hiddenInputs, useControllableValue, useFocusLeave, type ChoiceOption } from './choice'
import styles from './CheckboxGroup.module.css'

export type CheckboxGroupColumns = 1 | 2 | 3

export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Options as data. Alternatively pass `<CheckboxGroup.Item>` children. */
  options?: readonly ChoiceOption[]
  children?: ReactNode
  /** Controlled checked values. */
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  /** `vertical` (default) stacks the options; `horizontal` runs them in a wrapping row. */
  orientation?: 'vertical' | 'horizontal'
  /** Lay the options out in 1–3 equal columns (wins over `orientation`). Responsive. */
  columns?: Responsive<CheckboxGroupColumns>
  /** Adds a tri-state "select all" checkbox above the options, with this label. */
  selectAllLabel?: string
  /** Emits one hidden input per checked value, so FormData sees every choice. */
  name?: string
  disabled?: boolean
  /** Focusable but not editable: every box sets `aria-readonly` and clicks are ignored. */
  readOnly?: boolean
  /** Critical edge on the unchecked boxes. Inside a `<Fieldset error>` this is set for you. */
  invalid?: boolean
  size?: Size
}

export interface CheckboxGroupItemProps {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  /** Id for the checkbox. Defaults to a generated one. */
  id?: string
  className?: string
}

interface GroupContextValue {
  values: readonly string[]
  toggle: (value: string, checked: boolean) => void
  disabled: boolean
  readOnly: boolean
  size: Size
}

const GroupContext = createContext<GroupContextValue | null>(null)

interface ItemViewProps {
  label: ReactNode
  description?: ReactNode
  disabled: boolean
  readOnly: boolean
  size: Size
  checked: boolean | 'indeterminate'
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
  select?: boolean
}

function ItemView({
  label,
  description,
  disabled,
  readOnly,
  size,
  checked,
  onCheckedChange,
  id: idProp,
  className,
  select,
}: ItemViewProps) {
  const autoId = useId()
  const id = idProp ?? `${autoId}checkbox`
  const descriptionId = `${id}-description`
  return (
    <div
      className={cx(styles.item, className)}
      data-disabled={disabled || undefined}
      data-select-all={select ? true : undefined}
    >
      <span className={styles.slot}>
        <Checkbox
          id={id}
          size={size}
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={description != null ? descriptionId : undefined}
          onCheckedChange={(state) => {
            onCheckedChange(state === true)
          }}
        />
      </span>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description != null ? (
          <span id={descriptionId} className={messageStyles.description}>
            {description}
          </span>
        ) : null}
      </span>
    </div>
  )
}

/** One option. Must be a direct child of `CheckboxGroup` (so "select all" can count it). */
function CheckboxGroupItem({
  value,
  label,
  description,
  disabled = false,
  id,
  className,
}: CheckboxGroupItemProps) {
  const group = useContext(GroupContext)
  if (!group) throw new Error('CheckboxGroup.Item must be rendered inside a CheckboxGroup')
  return (
    <ItemView
      id={id}
      className={className}
      label={label}
      description={description}
      disabled={group.disabled || disabled}
      readOnly={group.readOnly}
      size={group.size}
      checked={group.values.includes(value)}
      onCheckedChange={(checked) => {
        group.toggle(value, checked)
      }}
    />
  )
}

function childOptions(children: ReactNode): { value: string; disabled: boolean }[] {
  const found: { value: string; disabled: boolean }[] = []
  Children.forEach(children, (child) => {
    if (
      isValidElement<Partial<CheckboxGroupItemProps>>(child) &&
      typeof child.props.value === 'string'
    ) {
      found.push({ value: child.props.value, disabled: child.props.disabled === true })
    }
  })
  return found
}

const tracks = (n: CheckboxGroupColumns): string => `repeat(${String(n)}, minmax(0, 1fr))`
const EMPTY: readonly string[] = []

/**
 * Several independent choices from a short list ("Notify me about"). A `role="group"`
 * labelled by the surrounding `<Fieldset>` legend (or `<Field>` label, or `aria-label`);
 * each option is a real checkbox, so Tab visits each one and Space toggles it.
 *
 * <Fieldset legend="Notify me about">
 *   <CheckboxGroup name="notify" options={topics} selectAllLabel="Everything" />
 * </Fieldset>
 */
const CheckboxGroupRoot = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  {
    options,
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = 'vertical',
    columns,
    selectAllLabel,
    name,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    invalid: invalidProp,
    size = 'md',
    className,
    style,
    onBlur,
    'aria-describedby': describedByProp,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': labelledByProp,
    ...rest
  },
  ref,
) {
  const field = useResolvedField({
    describedBy: describedByProp,
    invalid: invalidProp,
    ariaInvalid,
    disabled: disabledProp,
    readOnly: readOnlyProp,
  })
  const [values, setValues] = useControllableValue<readonly string[]>(
    valueProp,
    defaultValue ?? EMPTY,
    onValueChange &&
      ((next) => {
        onValueChange([...next])
      }),
    field.readOnly,
  )
  const handleBlur = useFocusLeave(onBlur)

  const all = useMemo(
    () =>
      options
        ? options.map((o) => ({ value: o.value, disabled: o.disabled === true }))
        : childOptions(children),
    [options, children],
  )

  const toggle = useCallback(
    (v: string, checked: boolean) => {
      const next = checked
        ? values.includes(v)
          ? [...values]
          : [...values, v]
        : values.filter((x) => x !== v)
      // Keep option order, whatever order they were ticked in.
      const order = all.map((o) => o.value)
      next.sort((a, b) => {
        const ia = order.indexOf(a)
        const ib = order.indexOf(b)
        return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
      })
      setValues(next)
    },
    [values, setValues, all],
  )

  const context = useMemo<GroupContextValue>(
    () => ({
      values,
      toggle,
      disabled: field.disabled,
      readOnly: field.readOnly,
      size,
    }),
    [values, toggle, field.disabled, field.readOnly, size],
  )

  let selectAll: ReactNode = null
  if (selectAllLabel != null) {
    const enabled = all.filter((o) => !o.disabled).map((o) => o.value)
    const checkedCount = enabled.filter((v) => values.includes(v)).length
    const state =
      enabled.length > 0 && checkedCount === enabled.length
        ? true
        : checkedCount > 0
          ? 'indeterminate'
          : false
    selectAll = (
      <ItemView
        select
        label={selectAllLabel}
        disabled={field.disabled || enabled.length === 0}
        readOnly={field.readOnly}
        size={size}
        checked={state}
        onCheckedChange={() => {
          // Disabled options keep whatever state they had.
          const locked = values.filter((v) => !enabled.includes(v))
          setValues(state === true ? locked : [...locked, ...enabled])
        }}
      />
    )
  }

  const layout = columns !== undefined ? 'columns' : orientation

  return (
    // aria-invalid on the group, not on each checkbox: the error belongs to the set.
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props
    <div
      ref={ref}
      role="group"
      className={cx(styles.group, className)}
      data-orientation={orientation}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-readonly={field.readOnly || undefined}
      aria-labelledby={labelledByProp ?? (rest['aria-label'] ? undefined : field.groupLabelId)}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      aria-busy={field.busy || undefined}
      style={mergeStyles(responsiveVars('checkbox-group-columns', columns, tracks), style)}
      onBlur={handleBlur}
      {...rest}
    >
      {/* Options wire their own ids and descriptions; they must not inherit the Field's. */}
      <FieldContext.Provider value={null}>
        <GroupContext.Provider value={context}>
          {selectAll}
          <div className={styles.items} data-layout={layout}>
            {options
              ? options.map((o) => (
                  <CheckboxGroupItem
                    key={o.value}
                    value={o.value}
                    label={o.label}
                    description={o.description}
                    disabled={o.disabled}
                  />
                ))
              : children}
          </div>
        </GroupContext.Provider>
      </FieldContext.Provider>
      {hiddenInputs(name, values, field.disabled)}
    </div>
  )
})

export const CheckboxGroup = markFieldAware(
  Object.assign(CheckboxGroupRoot, { Item: CheckboxGroupItem }),
)

// Re-exported so consumers of the choice controls can type their option lists.
export type { ChoiceOption } from './choice'
