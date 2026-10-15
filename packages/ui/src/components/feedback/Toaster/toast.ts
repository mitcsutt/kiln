import { isValidElement, type ReactNode } from 'react'

export type ToastTone = 'neutral' | 'info' | 'positive' | 'caution' | 'critical'

export interface ToastAction {
  /** The button's label: "Undo", "Retry", "View invoice". */
  label: string
  /** Runs when the button is pressed. The toast closes afterwards. */
  onClick: () => void
  /**
   * What a screen reader user hears about how to do this without the toast, since it may have
   * gone by the time they reach it: "Undo from the Trash page". Default: the label.
   */
  altText?: string
}

export interface ToastOptions {
  /**
   * Names the toast. Raising a toast with the `id` of one still on screen updates it instead of
   * stacking a second, so a repeated "Sync failed" shows once.
   */
  id?: string
  /** The short message, read first: "Invoice sent". */
  title?: ReactNode
  /** One more sentence when the title needs it: "Kittiwake Ltd, £1,240.00". */
  description?: ReactNode
  /** Meaning: the glyph and the tab on the top edge. `critical` and `caution` interrupt. Default `neutral`. */
  tone?: ToastTone
  /** Shows a spinner in place of the glyph, for work still in progress. */
  loading?: boolean
  /** One button, such as Undo or Retry. */
  action?: ToastAction
  /**
   * How long it stays, in milliseconds. `Infinity` keeps it until it's dismissed. Default 5000,
   * 8000 for `caution`, and `Infinity` for `critical` and `loading`, so errors wait to be read.
   * The timer pauses while the pointer or focus is on the toasts, and while the window is in the
   * background.
   */
  duration?: number
  /** Show the close button. Default `true`. */
  dismissible?: boolean
  /** Runs when the toast closes: on a timer, a swipe, Escape or the close button. */
  onDismiss?: () => void
}

/** A toast as the `Toaster` sees it. */
export interface ToastRecord extends ToastOptions {
  id: string
  /** `false` once it's dismissed: it plays its exit and is then removed. */
  open: boolean
  /** Goes up each time the message changes, so the change is announced again. */
  version: number
}

type Listener = () => void

let toasts: ToastRecord[] = []
const listeners = new Set<Listener>()
let nextId = 0

const REMOVE_AFTER_MS = 1000

function emit(next: ToastRecord[]) {
  toasts = next
  for (const listener of listeners) listener()
}

/** @internal The `Toaster`'s subscription. */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** @internal The current toasts, oldest first. */
export function getToasts(): ToastRecord[] {
  return toasts
}

const EMPTY: ToastRecord[] = []
/** @internal The server snapshot: nothing is raised during a server render. */
export function getServerToasts(): ToastRecord[] {
  return EMPTY
}

function changesMessage(record: ToastRecord, options: ToastOptions): boolean {
  return (['title', 'description', 'tone', 'loading'] as const).some(
    (key) => key in options && options[key] !== record[key],
  )
}

function upsert(options: ToastOptions): string {
  const id = options.id ?? `toast-${String(++nextId)}`
  const existing = toasts.find((record) => record.id === id && record.open)
  if (existing) {
    const version = changesMessage(existing, options) ? existing.version + 1 : existing.version
    emit(
      toasts.map((record) =>
        record === existing ? { ...record, ...options, id, version } : record,
      ),
    )
  } else {
    emit([
      ...toasts.filter((record) => record.id !== id),
      { ...options, id, open: true, version: 0 },
    ])
  }
  return id
}

function close(id?: string) {
  const closing = toasts.filter((record) => record.open && (id === undefined || record.id === id))
  if (closing.length === 0) return
  emit(toasts.map((record) => (closing.includes(record) ? { ...record, open: false } : record)))
  for (const record of closing) record.onDismiss?.()
  // Long enough for the exit animation; then the record goes.
  setTimeout(() => {
    emit(
      toasts.filter((record) => !closing.some((closed) => closed.id === record.id && !record.open)),
    )
  }, REMOVE_AFTER_MS)
}

/** A message for one stage of `toast.promise`: text, full options, or either worked out from the result. */
export type ToastPromiseMessage<T> =
  ReactNode | ToastOptions | ((value: T) => ReactNode | ToastOptions)

export interface ToastPromiseMessages<T> {
  /** While it's pending. Shown with a spinner. */
  loading: ReactNode | ToastOptions
  /** When it resolves. Shown in the `positive` tone. */
  success: ToastPromiseMessage<T>
  /** When it rejects, with the error. Shown in the `critical` tone. */
  error: ToastPromiseMessage<unknown>
}

function isOptions(message: unknown): message is ToastOptions {
  return (
    typeof message === 'object' &&
    message !== null &&
    !isValidElement(message) &&
    !Array.isArray(message)
  )
}

function toOptions<T>(message: ToastPromiseMessage<T>, value: T): ToastOptions {
  const resolved = typeof message === 'function' ? message(value) : message
  return isOptions(resolved) ? resolved : { title: resolved }
}

/**
 * Raises a toast and returns its id. Takes the message as text, or full options.
 *
 * @remarks
 * Call it from anywhere, inside React or out of it: an event handler, a query's error callback, a
 * socket listener. A {@link Toaster | Toaster} mounted once near the root shows it.
 *
 * - `toast.update(id, options)` changes a toast on screen, such as a retry count.
 * - `toast.dismiss(id)` closes one; `toast.dismiss()` closes them all.
 * - `toast.promise(promise, { loading, success, error })` shows a loading toast that turns into
 *   the success or error message when the promise settles, and returns the same promise.
 */
export function toast(message: ReactNode | ToastOptions): string {
  return upsert(isOptions(message) ? message : { title: message })
}

/** Changes a toast that's on screen. Does nothing if it has gone. */
toast.update = (id: string, options: ToastOptions): void => {
  if (toasts.some((record) => record.id === id && record.open)) upsert({ ...options, id })
}

/** Closes one toast, or every toast when no id is given. */
toast.dismiss = (id?: string): void => {
  close(id)
}

/**
 * Shows a loading toast while `promise` is pending, then the success or error message in its
 * place. Returns `promise`, so you can still await it.
 */
toast.promise = <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> => {
  const id = upsert({
    ...toOptions(messages.loading, undefined),
    loading: true,
    dismissible: false,
  })
  promise.then(
    (value) => {
      upsert({
        tone: 'positive',
        duration: undefined,
        title: undefined,
        description: undefined,
        action: undefined,
        onDismiss: undefined,
        ...toOptions(messages.success, value),
        id,
        loading: false,
        dismissible: true,
      })
    },
    (error: unknown) => {
      upsert({
        tone: 'critical',
        duration: undefined,
        title: undefined,
        description: undefined,
        action: undefined,
        onDismiss: undefined,
        ...toOptions(messages.error, error),
        id,
        loading: false,
        dismissible: true,
      })
    },
  )
  return promise
}

const toasters: object[] = []
const toasterListeners = new Set<Listener>()

/**
 * @internal Registers a mounted `Toaster`. Only the first one registered shows toasts, so a page
 * that mounts two (a docs page with several examples) doesn't show each toast twice.
 */
export function registerToaster(token: object): () => void {
  toasters.push(token)
  for (const listener of toasterListeners) listener()
  return () => {
    const index = toasters.indexOf(token)
    if (index >= 0) toasters.splice(index, 1)
    for (const listener of toasterListeners) listener()
  }
}

/** @internal Subscribes to changes in which `Toaster` shows toasts. */
export function subscribeToasters(listener: Listener): () => void {
  toasterListeners.add(listener)
  return () => {
    toasterListeners.delete(listener)
  }
}

/** @internal The `Toaster` that shows toasts, if any is mounted. */
export function primaryToaster(): object | undefined {
  return toasters[0]
}

/** @internal Clears every toast at once, with no exit. For tests. */
export function resetToasts(): void {
  emit([])
}
