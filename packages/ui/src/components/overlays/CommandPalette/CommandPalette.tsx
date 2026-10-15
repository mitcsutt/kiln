import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { ArrowLeftIcon, ChevronRightIcon, SearchIcon } from '#icons'
import { cx } from '#utils/cx'
import { Spinner } from '#components/feedback/Spinner'
import { VisuallyHidden } from '#components/layout/VisuallyHidden'
import { Kbd } from '#components/typography/Kbd'
import type { ComboboxOption } from '#components/inputs/Combobox'
import { useControllableState } from '#components/inputs/Combobox/useControllableState'
import { useLatest } from '#components/inputs/internal/useLatest'
import { filterOptions, groupOptions, matchRange } from '#components/inputs/internal/filterOptions'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchor,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import { describeShortcut, isApplePlatform, matchesShortcut, parseShortcut } from './shortcut'
import styles from './CommandPalette.module.css'

/**
 * One entry in the palette: a page to go to or a command to run. It's a `Combobox` option with
 * an `id` in place of `value`, so `label`, `description`, `keywords`, `group` and `disabled`
 * search and group the same way in both.
 */
export interface CommandAction extends Omit<ComboboxOption, 'value'> {
  /** Unique across the palette, nested actions included. `recent` refers to actions by it. */
  id: string
  /** A glyph before the label, such as one of the built-in icons. */
  icon?: ReactNode
  /**
   * The action's own keyboard shortcut, shown beside it, written like `mod+shift+l` (`mod` is
   * Command on a Mac and Control elsewhere). Display only: bind the shortcut yourself.
   */
  shortcut?: string
  /** Runs when the action is picked. The palette closes first. */
  onSelect?: () => void
  /**
   * Makes this action open a page of its own: picking it lists these instead of running
   * `onSelect`. Backspace in an empty search box, Escape or the back button returns.
   */
  actions?: readonly CommandAction[]
  /** The search box placeholder while this action's page is open. */
  placeholder?: string
}

export interface CommandPaletteProps extends Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  'title' | 'children' | 'asChild' | 'forceMount'
> {
  /** Everything the palette can find, in the order to list it when the search is empty. */
  actions: readonly CommandAction[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** A button that opens the palette. Its theme scope themes the palette. */
  trigger?: ReactElement
  /**
   * A keyboard shortcut anywhere on the page that opens and closes the palette, written like
   * `mod+k` (Command-K on a Mac, Control-K elsewhere). Off when omitted.
   */
  shortcut?: string
  /** Accessible name of the palette and its search box. */
  label?: string
  placeholder?: string
  /** The search text. Controlled. */
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /**
   * `auto` (default) filters and ranks the actions by the search, like `Combobox`. `none` lists
   * them as given, for results your own search has already chosen.
   */
  filter?: 'auto' | 'none'
  /** Actions are being fetched: a spinner in the search box, and `loadingMessage` when empty. */
  loading?: boolean
  loadingMessage?: ReactNode
  /** Shown when nothing matches. */
  emptyMessage?: ReactNode
  /** The most actions to list at once, after ranking. */
  limit?: number
  /** Ids of recently used actions, most recent first, listed above the rest while the search is empty. */
  recent?: readonly string[]
  /** Heading of the recent actions. */
  recentLabel?: string
  /** Fires after any action runs (not when one opens a page): a place to record recent actions. */
  onAction?: (action: CommandAction) => void
  /** Accessible name of the back button on a nested page. */
  backLabel?: string
  /** Portal target. Defaults to `document.body`; its theme scope is also used. */
  container?: HTMLElement | null
}

/* ─── Pure helpers ────────────────────────────────────────────────────────── */

interface Row {
  key: string
  action: CommandAction
  index: number
}

interface Section {
  key: string
  label?: string
  rows: Row[]
}

function findAction(actions: readonly CommandAction[], id: string): CommandAction | undefined {
  for (const action of actions) {
    if (action.id === id) return action
    const nested = action.actions ? findAction(action.actions, id) : undefined
    if (nested) return nested
  }
  return undefined
}

function resultsMessage(count: number): string {
  return `${String(count)} ${count === 1 ? 'result' : 'results'}`
}

/** The label with the matched part in a `<mark>`. */
function Highlight({ label, query }: { label: string; query: string }) {
  const range = matchRange(label, query)
  if (!range) return <>{label}</>
  const [start, end] = range
  return (
    <>
      {label.slice(0, start)}
      <mark className={styles.match}>{label.slice(start, end)}</mark>
      {label.slice(end)}
    </>
  )
}

/* ─── Overlay (mounts on open, so it reads the theme at that moment) ──────── */

const Overlay = forwardRef<HTMLDivElement, { container?: HTMLElement | null }>(function Overlay(
  { container },
  ref,
) {
  const theme = usePortalTheme(container)
  return <DialogPrimitive.Overlay ref={ref} className={styles.overlay} {...theme} />
})

const Trigger = forwardRef<HTMLButtonElement, { children: ReactElement }>(function Trigger(
  { children },
  ref,
) {
  const anchor = usePortalAnchor()
  return (
    <DialogPrimitive.Trigger ref={composeRefs(ref, anchor)} asChild>
      {children}
    </DialogPrimitive.Trigger>
  )
})

/* ─── Panel ───────────────────────────────────────────────────────────────── */

interface PanelProps extends Omit<
  CommandPaletteProps,
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'trigger'
  | 'shortcut'
  | 'query'
  | 'defaultQuery'
  | 'onQueryChange'
> {
  query: string
  setQuery: (query: string) => void
  /** Ids of the open pages, outermost first. */
  path: readonly string[]
  setPath: (path: readonly string[]) => void
  hasTrigger: boolean
  close: () => void
}

const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  {
    actions,
    label = 'Command palette',
    placeholder = 'Search',
    query,
    setQuery,
    path,
    setPath,
    hasTrigger,
    close,
    filter = 'auto',
    loading = false,
    loadingMessage = 'Loading…',
    emptyMessage = 'No matches',
    limit,
    recent,
    recentLabel = 'Recent',
    onAction,
    backLabel = 'Back',
    container,
    className,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    ...rest
  },
  ref,
) {
  const theme = usePortalTheme(container)
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const inputRef = useRef<HTMLInputElement>(null)
  const apple = useMemo(() => isApplePlatform(), [])
  const returnFocusRef = useRef<Element | null>(null)

  const pages = path.map((id) => findAction(actions, id))
  const trail = pages.every((action) => action?.actions) ? path : []
  const page = trail.length > 0 ? pages[pages.length - 1] : undefined
  const pageActions = page?.actions ?? actions
  const pageLabel = page?.label ?? label

  /* ─── Derived view ─── */
  const { sections, rows } = useMemo(() => {
    const result: Section[] = []
    let index = 0
    const toRow = (key: string, action: CommandAction): Row => ({ key, action, index: index++ })
    if (query.trim() === '' && !page && recent && recent.length > 0) {
      const recentRows = recent.flatMap((id) => {
        const action = findAction(actions, id)
        return action ? [toRow(`recent:${id}`, action)] : []
      })
      if (recentRows.length > 0)
        result.push({ key: 'recent', label: recentLabel, rows: recentRows })
    }
    const matched = filter === 'auto' ? filterOptions(pageActions, query) : [...pageActions]
    const limited = limit === undefined ? matched : matched.slice(0, Math.max(0, limit))
    for (const section of groupOptions(limited)) {
      result.push({
        key: section.key,
        label: section.label,
        rows: section.options.map((action) => toRow(action.id, action)),
      })
    }
    return { sections: result, rows: result.flatMap((section) => section.rows) }
  }, [actions, filter, limit, page, pageActions, query, recent, recentLabel])

  // When any row has an icon, every row keeps the icon column, so the labels line up.
  const hasIcons = rows.some((row) => row.action.icon !== undefined)
  const enabled = rows.filter((row) => !row.action.disabled)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  // Nothing chosen yet, or the chosen row is gone: the first result, so Enter runs the best match.
  const active = enabled.find((row) => row.key === activeKey) ?? enabled[0]
  const optionId = (row: Row) => `${baseId}-option-${String(row.index)}`
  const activeId = active ? optionId(active) : undefined

  useEffect(() => {
    if (!activeId) return
    inputRef.current?.ownerDocument.getElementById(activeId)?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  /* ─── Live region: the result count, debounced ─── */
  const [announcement, setAnnouncement] = useState('')
  const countText = loading
    ? ''
    : rows.length === 0
      ? typeof emptyMessage === 'string'
        ? emptyMessage
        : 'No matches'
      : resultsMessage(rows.length)
  const statusText = countText === '' ? '' : page ? `${pageLabel}: ${countText}` : countText
  useEffect(() => {
    if (statusText === '') return
    const timer = setTimeout(() => {
      setAnnouncement(statusText)
    }, 500)
    return () => {
      clearTimeout(timer)
    }
  }, [statusText])

  /* ─── Actions ─── */
  const focusInput = () => {
    inputRef.current?.focus()
  }

  const goBack = () => {
    setPath(trail.slice(0, -1))
    setQuery('')
    setActiveKey(null)
  }

  const run = (action: CommandAction) => {
    if (action.disabled) return
    if (action.actions) {
      setPath([...trail, action.id])
      setQuery('')
      setActiveKey(null)
      return
    }
    close()
    action.onSelect?.()
    onAction?.(action)
  }

  const move = (delta: 1 | -1) => {
    if (enabled.length === 0) return
    const index = active ? enabled.indexOf(active) : -1
    const next = enabled[(index + delta + enabled.length) % enabled.length]
    setActiveKey(next?.key ?? null)
  }

  /* ─── Events ─── */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setActiveKey(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        return
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        return
      case 'Home':
      case 'End': {
        const target = event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1]
        if (!target) return
        event.preventDefault()
        setActiveKey(target.key)
        return
      }
      case 'Enter':
        event.preventDefault()
        if (active) run(active.action)
        return
      case 'Backspace':
        if (query === '' && page) {
          event.preventDefault()
          goBack()
        }
        return
    }
  }

  const renderRow = (row: Row) => {
    const { action } = row
    const disabled = Boolean(action.disabled)
    const id = optionId(row)
    const shortcut = action.shortcut ? describeShortcut(action.shortcut, apple) : undefined
    const hint = [action.description, shortcut?.spoken].filter(Boolean).join(', ')
    return (
      // The search box owns focus and the keyboard (aria-activedescendant points here), so a
      // row is never focused itself and its click is the pointer path only.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
      <div
        key={row.key}
        id={id}
        role="option"
        aria-selected={active?.key === row.key}
        aria-disabled={disabled || undefined}
        aria-label={action.label}
        aria-describedby={hint === '' ? undefined : `${id}-hint`}
        aria-keyshortcuts={shortcut?.aria}
        className={styles.option}
        data-active={active?.key === row.key || undefined}
        data-disabled={disabled || undefined}
        data-page={action.actions ? '' : undefined}
        onMouseDown={(event) => {
          event.preventDefault()
        }}
        onPointerMove={() => {
          if (!disabled && activeKey !== row.key) setActiveKey(row.key)
        }}
        onClick={() => {
          run(action)
        }}
      >
        {action.icon !== undefined || hasIcons ? (
          <span className={styles.icon} aria-hidden="true">
            {action.icon}
          </span>
        ) : null}
        <span className={styles.text}>
          <span className={styles.label}>
            <Highlight label={action.label} query={query} />
          </span>
          {action.description ? (
            <span className={styles.description} aria-hidden="true">
              {action.description}
            </span>
          ) : null}
        </span>
        {shortcut ? (
          <span className={styles.shortcut} aria-hidden="true">
            {shortcut.keys.map((key, index) => (
              <Kbd key={index} size="sm">
                {key}
              </Kbd>
            ))}
          </span>
        ) : null}
        {action.actions ? <ChevronRightIcon className={styles.chevron} /> : null}
        {hint === '' ? null : (
          <span id={`${id}-hint`} hidden>
            {hint}
          </span>
        )}
      </div>
    )
  }

  return (
    <DialogPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      aria-describedby={undefined}
      data-page={page ? '' : undefined}
      {...theme}
      {...rest}
      onOpenAutoFocus={(event) => {
        returnFocusRef.current = inputRef.current?.ownerDocument.activeElement ?? null
        onOpenAutoFocus?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        focusInput()
      }}
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event)
        const returnFocus = returnFocusRef.current
        returnFocusRef.current = null
        if (event.defaultPrevented || hasTrigger || !(returnFocus instanceof HTMLElement)) return
        if (!returnFocus.isConnected) return
        event.preventDefault()
        returnFocus.focus()
      }}
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event)
        if (event.defaultPrevented || !page) return
        // On a nested page, Escape goes back a level instead of closing.
        event.preventDefault()
        goBack()
        focusInput()
      }}
    >
      <DialogPrimitive.Title asChild>
        <VisuallyHidden as="h2">{label}</VisuallyHidden>
      </DialogPrimitive.Title>
      <div className={styles.search}>
        {page ? (
          <button
            type="button"
            className={styles.back}
            aria-label={backLabel}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              goBack()
              focusInput()
            }}
          >
            <ArrowLeftIcon />
          </button>
        ) : (
          <SearchIcon className={styles.searchIcon} />
        )}
        {page ? (
          <span className={styles.crumb} aria-hidden="true">
            {page.label}
          </span>
        ) : null}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className={styles.input}
          value={query}
          placeholder={page?.placeholder ?? placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={pageLabel}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={rows.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          aria-busy={loading || undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {loading ? <Spinner size="sm" label={null} className={styles.spinner} /> : null}
      </div>
      <div className={styles.body}>
        <div
          id={listboxId}
          role="listbox"
          aria-label={pageLabel}
          aria-busy={loading || undefined}
          className={styles.listbox}
        >
          {sections.map((section, index) =>
            section.label === undefined ? (
              section.rows.map(renderRow)
            ) : (
              <div
                key={section.key}
                role="group"
                aria-labelledby={`${baseId}-group-${String(index)}`}
                className={styles.group}
              >
                <div
                  id={`${baseId}-group-${String(index)}`}
                  role="presentation"
                  className={styles.groupLabel}
                >
                  {section.label}
                </div>
                {section.rows.map(renderRow)}
              </div>
            ),
          )}
        </div>
        {rows.length === 0 ? (
          loading ? (
            <div className={styles.message}>
              <Spinner size="sm" label={null} />
              <span>{loadingMessage}</span>
            </div>
          ) : (
            <div className={styles.message}>{emptyMessage}</div>
          )
        ) : null}
      </div>
      <VisuallyHidden as="div" role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </DialogPrimitive.Content>
  )
})

/* ─── CommandPalette ──────────────────────────────────────────────────────── */

/**
 * A keyboard-first launcher: search every page and action in an app, then run one with Enter.
 *
 * @remarks
 * `CommandPalette` is a modal search over a list of actions. Each one is a page to go to or a
 * command to run, grouped under headings and ranked as you type, with the matched part of each
 * label marked. Open it with a `shortcut` (usually `mod+k`), a `trigger` button, or `open`.
 *
 * The arrow keys, Home and End move through the results and Enter runs the highlighted one; the
 * first result is highlighted as you type, so Enter alone runs the best match. An action with
 * its own `actions` opens them as a page, such as a list of projects to switch to: Backspace in
 * an empty search box, Escape or the back button returns. Escape at the top closes the palette.
 *
 * ## Search and grouping
 *
 * Actions search and group exactly like {@link Combobox | Combobox} options: by `label`, then
 * `keywords` and `description`, ignoring case and accents, with an exact match first, then a
 * match at the start of a word, then anywhere. Groups appear in the order of their best result.
 *
 * ## Results from a server
 *
 * For results your own search chooses, such as records, pass `filter="none"`, set `loading` while
 * you fetch, and pass the results as `actions`. Control the search text with `query` and
 * `onQueryChange`.
 *
 * ## Recent actions
 *
 * `recent` takes the ids of actions to list first while the search is empty. The palette doesn't
 * remember anything itself: record each one in `onAction`, and keep the list wherever suits your
 * app.
 *
 * ## Accessibility
 *
 * It's a modal dialog, so focus is trapped inside and returns to whatever opened it. The search
 * box is an ARIA combobox that keeps focus while the arrow keys move a highlight through the
 * listbox, and a polite live region announces how many results there are. Each action's shortcut
 * is read as its description.
 *
 * @privateRemarks
 * Radix Dialog for focus (the same primitive and portal theming as Dialog and Sheet) around an
 * ARIA 1.2 combobox whose listbox is always shown. Options share Combobox's shape and its
 * `filterOptions`/`groupOptions`, so the two rank and group identically.
 *
 * <CommandPalette shortcut="mod+k" actions={actions} onAction={remember} recent={recentIds} />
 */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      trigger,
      shortcut,
      query: queryProp,
      defaultQuery = '',
      onQueryChange,
      container,
      ...rest
    },
    ref,
  ) {
    const anchor = usePortalAnchorRef()

    const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange)
    const [query, setQueryState] = useControllableState(queryProp, defaultQuery, onQueryChange)
    const [path, setPath] = useState<readonly string[]>([])

    const queryRef = useLatest(query)
    const setQuery = useCallback(
      (next: string) => {
        if (next !== queryRef.current) setQueryState(next)
      },
      [queryRef, setQueryState],
    )

    const openRef = useLatest(open)
    const setOpen = useCallback(
      (next: boolean) => {
        if (next !== openRef.current) setOpenState(next)
      },
      [openRef, setOpenState],
    )

    // Every opening starts fresh: once the palette closes, by any route, clear the search and
    // go back to the top level.
    const wasOpen = useRef(open)
    useEffect(() => {
      if (wasOpen.current && !open) {
        setQuery('')
        setPath((current) => (current.length > 0 ? [] : current))
      }
      wasOpen.current = open
    }, [open, setQuery])

    /* The page-wide shortcut toggles the palette. */
    const toggleRef = useLatest(() => {
      setOpen(!openRef.current)
    })
    useEffect(() => {
      if (!shortcut) return
      const parsed = parseShortcut(shortcut, isApplePlatform())
      const handle = (event: globalThis.KeyboardEvent) => {
        if (event.defaultPrevented || event.isComposing || event.repeat) return
        if (!matchesShortcut(event, parsed)) return
        event.preventDefault()
        toggleRef.current()
      }
      document.addEventListener('keydown', handle)
      return () => {
        document.removeEventListener('keydown', handle)
      }
    }, [shortcut, toggleRef])

    return (
      <PortalAnchorContext.Provider value={anchor}>
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          {trigger ? <Trigger>{trigger}</Trigger> : null}
          <DialogPrimitive.Portal container={container}>
            <Overlay container={container} />
            <Panel
              ref={ref}
              container={container}
              query={query}
              setQuery={setQuery}
              path={path}
              setPath={setPath}
              hasTrigger={Boolean(trigger)}
              close={() => {
                setOpen(false)
              }}
              {...rest}
            />
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </PortalAnchorContext.Provider>
    )
  },
)
