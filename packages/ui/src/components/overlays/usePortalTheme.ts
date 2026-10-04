import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type Ref,
} from 'react'

/**
 * Portal theming.
 *
 * Radix portals render into `document.body`, outside any nested `<ThemeScope>`. Themes
 * are plain CSS scoped to `[data-theme]`, so portalled content would otherwise fall back
 * to the document's theme — a Fiesta dialog opened from a Fiesta card on a Monograph page
 * would render in Monograph.
 *
 * The fix: each overlay's portalled element copies the theme axes (`data-theme`,
 * `data-mode`, `data-density`) of the place it was opened from. Tokens then resolve on
 * the portalled element exactly as they would have in place.
 *
 * Source element, in order: an explicit `container` → the overlay's trigger (registered
 * through `PortalAnchorContext`) → the element focused when the overlay opened (covers
 * controlled dialogs with no trigger) → `<html>`.
 */

export const PORTAL_THEME_ATTRIBUTES = ['data-theme', 'data-mode', 'data-density'] as const

export interface PortalThemeAttributes {
  'data-theme'?: string
  'data-mode'?: string
  'data-density'?: string
}

type AnchorRef = RefObject<HTMLElement | null>

/** Set by each overlay Root; its Trigger registers itself as the theme source. */
export const PortalAnchorContext = createContext<AnchorRef | null>(null)

/** Creates the anchor ref an overlay Root provides via `PortalAnchorContext`. */
export function usePortalAnchorRef(): AnchorRef {
  return useRef<HTMLElement | null>(null)
}

/** The nearest overlay Root's anchor ref, or `null` outside one. */
export function usePortalAnchor(): AnchorRef | null {
  return useContext(PortalAnchorContext)
}

/** Merge refs (forwarded + internal) into one callback ref. */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/** Reads the theme axes that apply at `source` (nearest ancestor per axis, then `<html>`). */
export function readPortalTheme(source: Element | null | undefined): PortalThemeAttributes {
  const doc = source?.ownerDocument ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc) return {}
  const attrs: PortalThemeAttributes = {}
  for (const name of PORTAL_THEME_ATTRIBUTES) {
    const scope = source?.closest(`[${name}]`) ?? doc.documentElement
    const value = scope.getAttribute(name)
    if (value !== null) attrs[name] = value
  }
  return attrs
}

function resolveSource(
  anchor: AnchorRef | null | undefined,
  container: Element | null | undefined,
): Element | null {
  if (container) return container
  if (anchor?.current?.isConnected) return anchor.current
  if (typeof document === 'undefined') return null
  const active = document.activeElement
  return active && active !== document.body ? active : document.documentElement
}

function sameAttributes(a: PortalThemeAttributes, b: PortalThemeAttributes): boolean {
  return PORTAL_THEME_ATTRIBUTES.every((name) => a[name] === b[name])
}

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/**
 * Returns the `data-theme` / `data-mode` / `data-density` attributes to spread on a
 * portalled overlay element. Call it in a component that mounts when the overlay opens
 * (inside the Radix Portal), so the source is read at open time.
 *
 * Stays in sync while open: if any theme axis changes in the document (a mode toggle,
 * a Storybook global) the attributes are re-read.
 */
export function usePortalTheme(container?: Element | null): PortalThemeAttributes {
  const anchor = usePortalAnchor()
  // Portalled content never renders on the server, but guard anyway: no DOM, no attributes.
  const [attrs, setAttrs] = useState<PortalThemeAttributes>(() =>
    typeof document === 'undefined' ? {} : readPortalTheme(resolveSource(anchor, container)),
  )
  // Remember the source chosen at open time; focus moves into the overlay afterwards.
  const sourceRef = useRef<Element | null>(null)

  useIsomorphicLayoutEffect(() => {
    sourceRef.current = resolveSource(anchor, container)
    const update = () => {
      const next = readPortalTheme(sourceRef.current)
      setAttrs((prev) => (sameAttributes(prev, next) ? prev : next))
    }
    update()
    if (typeof MutationObserver === 'undefined') return
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: [...PORTAL_THEME_ATTRIBUTES],
    })
    return () => {
      observer.disconnect()
    }
  }, [anchor, container])

  return attrs
}
