import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FocusEventHandler,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { CheckIcon, ChevronDownIcon, CloseIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { Spinner } from '#components/feedback/Spinner'
import { Tag, TagList } from '#components/display/Tag'
import { PortalAnchorContext, usePortalTheme } from '#components/overlays/usePortalTheme'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { filterOptions, foldText } from '#components/inputs/internal/filterOptions'
import { useMergedRefs } from '#components/inputs/internal/refs'
import control from '#components/inputs/internal/control.module.css'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { useControllableState } from './useControllableState'
import styles from './Combobox.module.css'

export interface ComboboxOption {
  value: string
  label: string
  /** A second, quieter line under the label. Also searched. */
  description?: string
  /** Extra search terms that aren't shown ("USA", "Holland"). An exact keyword ranks first. */
  keywords?: readonly string[]
  /** Heading the option is listed under. Groups appear in order of their first option. */
  group?: string
  disabled?: boolean
}

export interface ComboboxBase extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'multiple' | 'onBlur'
> {
  options: readonly ComboboxOption[]
  /** The text in the box (the query). Controlled. */
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (query: string) => void
  /**
   * `auto` (default) filters and ranks `options` by the query. `none` shows `options` as
   * given — for async search, where the loader has already filtered.
   */
  filter?: 'auto' | 'none'
  /** Options are being fetched: a spinner in the box and `loadingMessage` in an empty list. */
  loading?: boolean
  loadingMessage?: ReactNode
  /** Shown in the list when nothing matches. Default "No matches". */
  emptyMessage?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Free text is allowed: whatever is typed becomes the value when committed (Enter, or
   * leaving the field). A typed label that matches an option picks that option instead.
   */
  creatable?: boolean
  /** Shows a clear button while there's a value. */
  clearable?: boolean
  /** Accessible name of the clear button. Default "Clear". */
  clearLabel?: string
  size?: Size
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Fires once focus leaves the whole control (input, chips, clear button, list). */
  onBlur?: FocusEventHandler<HTMLElement>
}

export interface ComboboxSingleProps extends ComboboxBase {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

export interface ComboboxMultipleProps extends ComboboxBase {
  multiple: true
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  /** Once this many are chosen, the rest of the list is disabled. */
  maxSelected?: number
  /** Accessible name of a chip's remove button. Default `Remove <label>`. */
  removeLabel?: (label: string) => string
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/* ─── Pure helpers ────────────────────────────────────────────────────────── */

interface Section {
  key: string
  label?: string
  options: ComboboxOption[]
}

/** Visible options, in groups (ordered by each group's first/best option), and flattened. */
function buildView(options: readonly ComboboxOption[], query: string, shouldFilter: boolean) {
  const matched = shouldFilter ? filterOptions(options, query) : [...options]
  const sections: Section[] = []
  const byKey = new Map<string, Section>()
  for (const option of matched) {
    const key = option.group === undefined ? '' : `g:${option.group}`
    let section = byKey.get(key)
    if (!section) {
      section = { key, label: option.group, options: [] }
      byKey.set(key, section)
      sections.push(section)
    }
    section.options.push(option)
  }
  return { sections, ordered: sections.flatMap((section) => section.options) }
}

interface ModeProps {
  multiple: boolean
  value: readonly string[] | undefined
  defaultValue: readonly string[]
  emit: (next: readonly string[]) => void
  maxSelected: number | undefined
  removeLabel: (label: string) => string
}

const defaultRemoveLabel = (label: string) => `Remove ${label}`

/** Splits the single/multiple union into one normalised shape (values are always arrays). */
function splitMode(props: ComboboxProps): [ComboboxBase, ModeProps] {
  if (props.multiple === true) {
    const { multiple, value, defaultValue, onValueChange, maxSelected, removeLabel, ...base } =
      props
    return [
      base,
      {
        multiple,
        value,
        defaultValue: defaultValue ?? [],
        emit: (next) => onValueChange?.([...next]),
        maxSelected,
        removeLabel: removeLabel ?? defaultRemoveLabel,
      },
    ]
  }
  const { multiple, value, defaultValue, onValueChange, ...base } = props
  return [
    base,
    {
      multiple: Boolean(multiple),
      value: value === undefined ? undefined : value === null ? [] : [value],
      defaultValue: defaultValue == null ? [] : [defaultValue],
      emit: (next) => onValueChange?.(next[0] ?? null),
      maxSelected: undefined,
      removeLabel: defaultRemoveLabel,
    },
  ]
}

/** The nearest theme scope below `<html>` — the portal target, so the list opens in that theme. */
function themeScopeOf(node: HTMLElement | null): HTMLElement | undefined {
  const scope = node?.closest<HTMLElement>('[data-theme]')
  return scope && scope !== node?.ownerDocument.documentElement ? scope : undefined
}

function countMessage(count: number): string {
  return `${String(count)} ${count === 1 ? 'option' : 'options'} available`
}

/* ─── Popup (mounts on open, so it reads the theme at open time) ─────────── */

interface PopupProps {
  children: ReactNode
  onInteractOutside: (event: Event) => void
}

// forwardRef: Radix Presence hands the popup a ref (React 18 warns without it).
const ComboboxPopup = forwardRef<HTMLDivElement, PopupProps>(function ComboboxPopup(
  { children, onInteractOutside },
  ref,
) {
  const theme = usePortalTheme()
  return (
    <PopoverPrimitive.Content
      ref={ref}
      className={styles.popup}
      // A wrapper, not a dialog: the listbox inside carries the semantics.
      role={undefined}
      side="bottom"
      align="start"
      sideOffset={6}
      collisionPadding={8}
      // Focus never leaves the input (ARIA combobox): no auto-focus in or back.
      onOpenAutoFocus={(event) => {
        event.preventDefault()
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault()
      }}
      // The input's own keydown handles Escape (close, then clear).
      onEscapeKeyDown={(event) => {
        event.preventDefault()
      }}
      onInteractOutside={onInteractOutside}
      // Clicks on padding / messages must not take focus from the input.
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      {...theme}
    >
      {children}
    </PopoverPrimitive.Content>
  )
})

/* ─── Combobox ────────────────────────────────────────────────────────────── */

/**
 * Type to filter, pick from a list (ARIA 1.2 combobox with a listbox popup). Single or
 * `multiple` (chosen values become removable chips), `creatable` for free text, and
 * async-ready: pass `filter="none"`, `loading` and the loader's results as `options`.
 * The ref and native input props go to the text input; `className`/`style` go to the box.
 *
 * <Combobox options={teams} placeholder="Search teams" onValueChange={setTeam} />
 * <Combobox multiple options={labels} maxSelected={3} />
 */
export const Combobox = markFieldAware(
  forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(props, ref) {
    const [base, mode] = splitMode(props)
    const {
      options,
      inputValue: inputValueProp,
      defaultInputValue,
      onInputValueChange,
      filter = 'auto',
      loading = false,
      loadingMessage = 'Loading…',
      emptyMessage = 'No matches',
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      creatable = false,
      clearable = false,
      clearLabel = 'Clear',
      size = 'md',
      invalid: invalidProp,
      id: idProp,
      disabled: disabledProp,
      required: requiredProp,
      readOnly: readOnlyProp,
      name,
      form,
      placeholder,
      className,
      style,
      onKeyDown,
      onBlur,
      onClick,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    } = base
    const { multiple, maxSelected, removeLabel } = mode

    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      required: requiredProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const autoId = useId()
    const inputId = field.id ?? `${autoId}combobox`
    const listboxId = `${inputId}-listbox`
    const statusId = `${inputId}-status`
    const interactive = !field.disabled && !field.readOnly

    const inputRef = useRef<HTMLInputElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const composedInputRef = useMergedRefs(ref, inputRef)

    /* Labels of chosen values survive the options changing (async results, creatable). */
    const labelCache = useRef(new Map<string, string>())
    for (const option of options) labelCache.current.set(option.value, option.label)
    const labelOf = useCallback(
      (value: string) =>
        options.find((option) => option.value === value)?.label ??
        labelCache.current.get(value) ??
        value,
      [options],
    )

    const [values, setValues] = useControllableState<readonly string[]>(
      mode.value,
      mode.defaultValue,
      mode.emit,
    )
    const selectedLabel = !multiple && values[0] !== undefined ? labelOf(values[0]) : ''

    const [query, setQueryState] = useControllableState<string>(
      inputValueProp,
      defaultInputValue ??
        (multiple || mode.defaultValue[0] === undefined ? '' : labelOf(mode.defaultValue[0])),
      onInputValueChange,
    )
    const queryRef = useRef(query)
    queryRef.current = query
    const setQuery = useCallback(
      (next: string) => {
        if (next !== queryRef.current) setQueryState(next)
      },
      [setQueryState],
    )
    /** The user has typed since the last pick (single: the text is a query, not the label). */
    const [dirty, setDirty] = useState(false)

    const [openState, setOpenState] = useControllableState<boolean>(
      openProp,
      defaultOpen,
      onOpenChange,
    )
    const openRef = useRef(openState)
    openRef.current = openState
    const setOpen = useCallback(
      (next: boolean) => {
        if (next !== openRef.current) setOpenState(next)
      },
      [setOpenState],
    )

    const [activeValue, setActiveValue] = useState<string | null>(null)

    // Single: show the chosen option's label whenever the user isn't mid-edit (covers
    // external value changes such as a form reset).
    useEffect(() => {
      if (!multiple && !dirty) setQuery(selectedLabel)
    }, [multiple, dirty, selectedLabel, setQuery])

    /* ─── Derived view ─── */
    const shouldFilter = filter === 'auto' && (multiple || dirty)
    const { sections, ordered } = useMemo(
      () => buildView(options, query, shouldFilter),
      [options, query, shouldFilter],
    )
    const indexOf = useMemo(
      () => new Map(options.map((option, index) => [option.value, index])),
      [options],
    )
    const optionId = (value: string) => `${inputId}-option-${String(indexOf.get(value) ?? 0)}`

    const atMax = multiple && maxSelected !== undefined && values.length >= maxSelected
    const isSelected = (value: string) => values.includes(value)
    const isDisabled = (option: ComboboxOption) =>
      Boolean(option.disabled) || (atMax && !isSelected(option.value))
    const enabled = ordered.filter((option) => !isDisabled(option))

    const trimmedQuery = query.trim()
    const freeText = creatable && trimmedQuery !== '' && (multiple || dirty)
    const showEmpty = !loading && ordered.length === 0 && !freeText
    const hasPopupContent = ordered.length > 0 || loading || showEmpty
    const expanded = openState && interactive && hasPopupContent

    // Non-creatable: typing highlights the best match, so Enter picks it. Not while loading:
    // the list still shows the previous query's results, and Enter must not commit one of them.
    const autoHighlight =
      expanded && !loading && !creatable && trimmedQuery !== '' && (multiple || dirty)
    const activeOption =
      enabled.find((option) => option.value === activeValue) ??
      (autoHighlight ? enabled[0] : undefined)
    const active = expanded ? activeOption : undefined

    /* ─── Live region: result count, debounced ─── */
    const [announcement, setAnnouncement] = useState('')
    const countText = loading
      ? ''
      : ordered.length === 0
        ? typeof emptyMessage === 'string'
          ? emptyMessage
          : 'No matches'
        : countMessage(ordered.length)
    useEffect(() => {
      if (!expanded || countText === '') {
        if (!expanded) setAnnouncement('')
        return
      }
      const timer = setTimeout(() => {
        setAnnouncement(countText)
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    }, [expanded, countText])

    /* Keep the highlighted row in view. */
    const activeId = active ? optionId(active.value) : undefined
    useEffect(() => {
      if (!activeId) return
      const node = inputRef.current?.ownerDocument.getElementById(activeId)
      node?.scrollIntoView({ block: 'nearest' })
    }, [activeId])

    /* ─── Actions ─── */
    const selectOption = (option: ComboboxOption) => {
      if (!interactive || isDisabled(option)) return
      labelCache.current.set(option.value, option.label)
      if (multiple) {
        const next = isSelected(option.value)
          ? values.filter((value) => value !== option.value)
          : [...values, option.value]
        setValues(next)
        setQuery('')
        setDirty(false)
        setActiveValue(option.value)
      } else {
        setValues([option.value])
        setQuery(option.label)
        setDirty(false)
        setActiveValue(null)
        setOpen(false)
      }
    }

    /** Creatable: turn the typed text into a value. Returns whether anything changed. */
    const commitText = (): boolean => {
      if (!creatable || trimmedQuery === '') return false
      const folded = foldText(trimmedQuery)
      const match = options.find((option) => !option.disabled && foldText(option.label) === folded)
      const value = match?.value ?? trimmedQuery
      const label = match?.label ?? trimmedQuery
      labelCache.current.set(value, label)
      if (multiple) {
        setQuery('')
        setDirty(false)
        if (isSelected(value) || atMax) return false
        setValues([...values, value])
        return true
      }
      setDirty(false)
      setQuery(label)
      if (values[0] === value) return false
      setValues([value])
      return true
    }

    const removeValue = (value: string) => {
      if (!interactive) return
      setValues(values.filter((v) => v !== value))
    }

    const clear = () => {
      if (!interactive) return
      setValues([])
      setQuery('')
      setDirty(false)
      setActiveValue(null)
      inputRef.current?.focus()
    }

    /** First visible selected option, else the first/last enabled one. */
    const initialActive = (fromEnd: boolean) =>
      enabled.find((option) => isSelected(option.value)) ??
      (fromEnd ? enabled[enabled.length - 1] : enabled[0])

    const move = (delta: 1 | -1) => {
      if (enabled.length === 0) return
      const index = active ? enabled.indexOf(active) : -1
      const next =
        index === -1
          ? delta === 1
            ? enabled[0]
            : enabled[enabled.length - 1]
          : enabled[(index + delta + enabled.length) % enabled.length]
      setActiveValue(next?.value ?? null)
    }

    const openList = (highlight: 'first' | 'last' | 'keep') => {
      if (!interactive) return
      setOpen(true)
      if (highlight !== 'keep') setActiveValue(initialActive(highlight === 'last')?.value ?? null)
    }

    /* ─── Events ─── */
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      setQuery(text)
      setDirty(true)
      setActiveValue(null)
      if (interactive) setOpen(true)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.nativeEvent.isComposing) return
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (event.altKey) openList('keep')
          else if (expanded) move(1)
          else openList('first')
          return
        case 'ArrowUp':
          event.preventDefault()
          if (event.altKey) setOpen(false)
          else if (expanded) move(-1)
          else openList('last')
          return
        case 'Home':
        case 'End':
          if (!expanded || enabled.length === 0) return
          event.preventDefault()
          setActiveValue(
            (event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1])?.value ?? null,
          )
          return
        case 'Enter':
          if (expanded && active) {
            event.preventDefault()
            selectOption(active)
          } else if (freeText) {
            event.preventDefault()
            commitText()
            if (!multiple) setOpen(false)
          } else if (expanded) {
            event.preventDefault()
          }
          return
        case 'Escape':
          if (expanded) {
            event.preventDefault()
            setOpen(false)
          } else if (query !== '' && interactive) {
            event.preventDefault()
            setQuery('')
            setDirty(!multiple)
          }
          return
        case 'Tab':
          setOpen(false)
          return
        case 'Backspace':
          if (multiple && query === '' && interactive && values.length > 0) {
            event.preventDefault()
            setValues(values.slice(0, -1))
          }
          return
      }
    }

    /** Focus left the whole control: settle the text, close, then tell the consumer. */
    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null
      if (next && boxRef.current?.contains(next)) return
      if (interactive) {
        if (multiple) {
          if (!commitText()) setQuery('')
        } else if (dirty) {
          if (creatable && trimmedQuery !== '') commitText()
          else if (trimmedQuery === '') {
            if (values.length > 0) setValues([])
            setQuery('')
          } else setQuery(selectedLabel)
        }
        setDirty(false)
      }
      setOpen(false)
      setActiveValue(null)
      onBlur?.(event)
    }

    // Clicking the box's padding or chevron focuses the input and toggles the list.
    const handleBoxPointerDown = (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      if (target === inputRef.current || target.closest('button, a, input')) return
      event.preventDefault()
      inputRef.current?.focus()
      if (openRef.current) setOpen(false)
      else openList('keep')
    }

    const handleInputClick = (event: MouseEvent<HTMLInputElement>) => {
      onClick?.(event)
      if (!openRef.current) openList('keep')
    }

    const handleInteractOutside = (event: Event) => {
      const target = event.target as Node | null
      if (target && boxRef.current?.contains(target)) event.preventDefault()
    }

    /* ─── Render ─── */
    const listLabelledBy = ariaLabelledBy ?? field.labelId
    const showPlaceholder = !multiple || values.length === 0
    const canClear = clearable && interactive && (values.length > 0 || query !== '')

    const renderOption = (option: ComboboxOption) => {
      const selected = isSelected(option.value)
      const disabled = isDisabled(option)
      return (
        // The input owns focus and the keyboard (aria-activedescendant points here), so an
        // option is never focused itself and its click is the pointer path only.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
        <div
          key={option.value}
          id={optionId(option.value)}
          role="option"
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          className={styles.option}
          data-active={active?.value === option.value || undefined}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          onPointerMove={() => {
            if (!disabled && activeValue !== option.value) setActiveValue(option.value)
          }}
          onClick={() => {
            selectOption(option)
          }}
        >
          {multiple ? (
            <span className={styles.box} aria-hidden="true">
              {selected ? <CheckIcon /> : null}
            </span>
          ) : null}
          <span className={styles.optionText}>
            <span className={styles.optionLabel}>{option.label}</span>
            {option.description ? (
              <span className={styles.optionDescription}>{option.description}</span>
            ) : null}
          </span>
          {!multiple && selected ? <CheckIcon className={styles.check} /> : null}
        </div>
      )
    }

    return (
      <PopoverPrimitive.Root
        open={expanded}
        onOpenChange={(next) => {
          if (!next) setOpen(false)
        }}
      >
        <PortalAnchorContext.Provider value={boxRef}>
          <PopoverPrimitive.Anchor asChild>
            <div
              ref={boxRef}
              className={cx(control.box, styles.root, className)}
              style={style}
              data-size={size}
              data-multiple={multiple || undefined}
              data-state={expanded ? 'open' : 'closed'}
              data-invalid={field.invalid || undefined}
              data-disabled={field.disabled || undefined}
              data-readonly={field.readOnly || undefined}
              onPointerDown={handleBoxPointerDown}
              onBlur={handleBlur}
            >
              <div className={styles.values}>
                {multiple && values.length > 0 ? (
                  <TagList className={styles.chips}>
                    {values.map((value) => {
                      const label = labelOf(value)
                      return (
                        <Tag
                          key={value}
                          className={styles.chip}
                          onRemove={
                            interactive
                              ? () => {
                                  removeValue(value)
                                  inputRef.current?.focus()
                                }
                              : undefined
                          }
                          removeLabel={removeLabel(label)}
                        >
                          {label}
                        </Tag>
                      )
                    })}
                  </TagList>
                ) : null}
                <input
                  ref={composedInputRef}
                  id={inputId}
                  type="text"
                  role="combobox"
                  className={styles.input}
                  value={query}
                  placeholder={showPlaceholder ? placeholder : undefined}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={field.disabled}
                  readOnly={field.readOnly}
                  aria-autocomplete="list"
                  aria-haspopup="listbox"
                  aria-expanded={expanded}
                  aria-controls={listboxId}
                  aria-activedescendant={activeId}
                  aria-label={ariaLabel}
                  aria-labelledby={ariaLabelledBy}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  aria-required={field.required || undefined}
                  aria-busy={field.busy || undefined}
                  {...rest}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onClick={handleInputClick}
                />
              </div>
              <span className={styles.trailing}>
                {loading ? <Spinner size="sm" label={null} className={styles.spinner} /> : null}
                {canClear ? (
                  <button
                    type="button"
                    className={styles.clear}
                    aria-label={clearLabel}
                    onMouseDown={(event) => {
                      event.preventDefault()
                    }}
                    onClick={clear}
                  >
                    <CloseIcon />
                  </button>
                ) : null}
                <ChevronDownIcon className={styles.chevron} />
              </span>
              {name !== undefined ? (
                multiple ? (
                  values.map((value) => (
                    <input
                      key={value}
                      type="hidden"
                      name={name}
                      value={value}
                      form={form}
                      disabled={field.disabled || undefined}
                    />
                  ))
                ) : (
                  <input
                    type="hidden"
                    name={name}
                    value={values[0] ?? ''}
                    form={form}
                    disabled={field.disabled || undefined}
                  />
                )
              ) : null}
              <div
                id={statusId}
                role="status"
                aria-live="polite"
                className={messageStyles.visuallyHidden}
              >
                {announcement}
              </div>
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal container={expanded ? themeScopeOf(boxRef.current) : undefined}>
            <ComboboxPopup onInteractOutside={handleInteractOutside}>
              <div
                id={listboxId}
                role="listbox"
                aria-labelledby={listLabelledBy}
                aria-label={listLabelledBy ? undefined : ariaLabel}
                aria-multiselectable={multiple || undefined}
                aria-busy={loading || undefined}
                className={styles.listbox}
              >
                {sections.map((section) =>
                  section.label === undefined ? (
                    section.options.map(renderOption)
                  ) : (
                    <div
                      key={section.key}
                      role="group"
                      aria-labelledby={`${inputId}-group-${String(sections.indexOf(section))}`}
                      className={styles.group}
                    >
                      <div
                        id={`${inputId}-group-${String(sections.indexOf(section))}`}
                        role="presentation"
                        className={styles.groupLabel}
                      >
                        {section.label}
                      </div>
                      {section.options.map(renderOption)}
                    </div>
                  ),
                )}
              </div>
              {loading && ordered.length === 0 ? (
                <div className={styles.message}>
                  <Spinner size="sm" label={null} />
                  <span>{loadingMessage}</span>
                </div>
              ) : null}
              {showEmpty ? <div className={styles.message}>{emptyMessage}</div> : null}
            </ComboboxPopup>
          </PopoverPrimitive.Portal>
        </PortalAnchorContext.Provider>
      </PopoverPrimitive.Root>
    )
  }),
)
