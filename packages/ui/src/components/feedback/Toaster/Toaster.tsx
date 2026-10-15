import { forwardRef, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Portal, Toast } from 'radix-ui'
import { cx } from '#utils/cx'
import { CircleCheckIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '#icons'
import { Spinner } from '#components/feedback/Spinner'
import {
  PortalAnchorContext,
  composeRefs,
  usePortalAnchor,
  usePortalAnchorRef,
  usePortalTheme,
} from '#components/overlays/usePortalTheme'
import {
  getServerToasts,
  getToasts,
  primaryToaster,
  registerToaster,
  subscribeToasters,
  subscribeToasts,
  toast,
  type ToastRecord,
  type ToastTone,
} from './toast'
import styles from './Toaster.module.css'

export type ToastPosition =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'

export interface ToasterProps {
  /** Where the toasts stack. Default `bottom-end`. */
  position?: ToastPosition
  /**
   * How many toasts show at once. Older ones beyond it wait, with their timers stopped, and come
   * back as the newer ones close. Default 3.
   */
  max?: number
  /**
   * Names the region for screen readers. `{hotkey}` is replaced with the shortcut. Default
   * "Notifications ({hotkey})".
   */
  label?: string
  /** The keys that move focus to the toasts. Default `['F8']`. */
  hotkey?: string[]
  /** Accessible name of each toast's close button. Default "Dismiss". */
  closeLabel?: string
  /** Portal target. Defaults to `document.body`. */
  container?: HTMLElement | null
  /** Class on the region the toasts stack in. */
  className?: string
}

const GLYPH: Record<ToastTone, ReactNode> = {
  neutral: <InfoIcon />,
  info: <InfoIcon />,
  positive: <CircleCheckIcon />,
  caution: <WarningIcon />,
  critical: <ErrorIcon />,
}

function durationOf(record: ToastRecord): number | undefined {
  if (record.duration !== undefined) return record.duration
  if (record.loading || record.tone === 'critical') return Infinity
  if (record.tone === 'caution') return 8000
  return undefined
}

function swipeDirection(position: ToastPosition): 'up' | 'down' | 'left' | 'right' {
  if (position.endsWith('-end')) return 'right'
  if (position.endsWith('-start')) return 'left'
  return position.startsWith('top') ? 'up' : 'down'
}

function ToastItem({ record, closeLabel }: { record: ToastRecord; closeLabel: string }) {
  const tone = record.tone ?? 'neutral'
  const interrupt = tone === 'critical' || tone === 'caution'
  return (
    <Toast.Root
      className={styles.toast}
      open={record.open}
      onOpenChange={(open) => {
        if (!open) toast.dismiss(record.id)
      }}
      duration={durationOf(record)}
      type={interrupt ? 'foreground' : 'background'}
      data-tone={tone}
      data-loading={record.loading === true ? '' : undefined}
      data-updated={record.version > 0 || undefined}
    >
      <span className={styles.glyph} aria-hidden="true">
        {record.loading ? <Spinner label={null} /> : GLYPH[tone]}
      </span>
      <div className={styles.body}>
        {record.title !== undefined ? (
          <Toast.Title className={styles.title}>{record.title}</Toast.Title>
        ) : null}
        {record.description !== undefined ? (
          <Toast.Description className={styles.description}>{record.description}</Toast.Description>
        ) : null}
        {record.action ? (
          <div className={styles.actions}>
            <Toast.Action
              className={styles.action}
              altText={record.action.altText ?? record.action.label}
              onClick={record.action.onClick}
            >
              {record.action.label}
            </Toast.Action>
          </div>
        ) : null}
      </div>
      {record.dismissible !== false ? (
        <Toast.Close className={styles.close} aria-label={closeLabel}>
          <CloseIcon />
        </Toast.Close>
      ) : null}
    </Toast.Root>
  )
}

const Viewport = forwardRef<
  HTMLOListElement,
  {
    position: ToastPosition
    label: string
    hotkey?: string[]
    container?: HTMLElement | null
    className?: string
  }
>(function Viewport({ position, label, hotkey, container, className }, ref) {
  const theme = usePortalTheme(container)
  return (
    <Toast.Viewport
      ref={ref}
      className={cx(styles.viewport, className)}
      data-position={position}
      label={label}
      hotkey={hotkey}
      {...theme}
    />
  )
})

/** Marks where the Toaster is mounted, so the toasts take the theme of that place. */
function Anchor() {
  const anchor = usePortalAnchor()
  return <span ref={composeRefs(anchor ?? undefined)} hidden />
}

/**
 * The region that shows toasts. Mount it once near the root, then raise toasts with `toast()` from
 * anywhere.
 *
 * @remarks
 * A toast tells someone that something happened away from where they're looking: a save
 * finished, a background job failed, a link landed on the clipboard. For a message about the
 * content beside it, use an {@link Alert | Alert} instead; it stays in the layout.
 *
 * ```tsx
 * <ThemeProvider>
 *   <App />
 *   <Toaster />
 * </ThemeProvider>
 * ```
 *
 * Each toast has the same frame as an `Alert`: a hairline, the tone in its glyph and a short tab
 * on the top edge. It can carry one action, such as Undo, and a close button. It closes on its
 * own after a few seconds; `critical` toasts and loading ones stay until they're dismissed. The
 * timer pauses while the pointer or keyboard focus is on the toasts, and while the window is in
 * the background.
 *
 * Toasts are announced as they appear, and again when one changes (a loading toast turning into
 * "Saved"). `critical` and `caution` toasts interrupt; the rest wait their turn. F8 moves focus to
 * the region, Escape closes the focused toast, and a swipe toward the nearest edge dismisses one.
 * The toasts take the theme of the place the `Toaster` is mounted, and slide in from that edge;
 * with reduced motion they appear and go without moving. If more than one `Toaster` is mounted,
 * the first one shows the toasts.
 *
 * ## Updating and dismissing
 *
 * `toast()` returns an id. `toast.update(id, options)` changes that toast, `toast.dismiss(id)`
 * closes it, and `toast.dismiss()` closes every toast. Raising a toast with an `id` that's still on
 * screen updates it rather than stacking a copy.
 *
 * `toast.promise(promise, { loading, success, error })` shows a loading toast, then turns it into
 * the success or error message when the promise settles.
 *
 * @privateRemarks
 * Radix Toast underneath (swipe, hotkey, pause, live announcements). Radix announces a toast's
 * text once, on mount, so a changed message bumps `version` and remounts the toast under a new
 * key; `data-updated` stops that remount from replaying the entrance. The viewport is portalled
 * and copies the theme of a hidden anchor where the Toaster sits (usePortalTheme).
 *
 * <Toaster position="bottom-end" />
 * toast({ title: 'Invoice sent', tone: 'positive' })
 */
export function Toaster({
  position = 'bottom-end',
  max = 3,
  label = 'Notifications ({hotkey})',
  hotkey,
  closeLabel = 'Dismiss',
  container,
  className,
}: ToasterProps) {
  const anchor = usePortalAnchorRef()
  const records = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts)
  const [token] = useState(() => ({}))
  useEffect(() => registerToaster(token), [token])
  const primary = useSyncExternalStore(subscribeToasters, primaryToaster, () => undefined)
  if (primary !== token) return null
  // The newest `max` open toasts show; closing ones stay until their exit has played.
  const shown = new Set(
    records
      .filter((record) => record.open)
      .slice(-Math.max(1, max))
      .map((record) => record.id),
  )
  const visible = records.filter((record) => !record.open || shown.has(record.id))
  return (
    <PortalAnchorContext.Provider value={anchor}>
      <Anchor />
      <Toast.Provider swipeDirection={swipeDirection(position)} label="Notification">
        {visible.map((record) => (
          <ToastItem
            key={`${record.id}:${String(record.version)}`}
            record={record}
            closeLabel={closeLabel}
          />
        ))}
        <Portal.Root container={container}>
          <Viewport
            position={position}
            label={label}
            hotkey={hotkey}
            container={container}
            className={className}
          />
        </Portal.Root>
      </Toast.Provider>
    </PortalAnchorContext.Provider>
  )
}
